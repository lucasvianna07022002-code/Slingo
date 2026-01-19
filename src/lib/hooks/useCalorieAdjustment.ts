"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalorieGoalState,
  CalorieAdjustment,
  MINIMUM_EXCESS_THRESHOLD,
  ADJUSTMENT_PERIOD_DAYS,
  roundToTen,
  calculateMinimumGoal,
  isValidAdjustmentTime,
  isSameDay,
} from "@/lib/types/calorieAdjustment";

const STORAGE_KEY = "slingo_calorie_goal_state";
const DEFAULT_BASE_GOAL = 2000; // Meta padrão inicial

export function useCalorieAdjustment() {
  const [goalState, setGoalState] = useState<CalorieGoalState | null>(null);
  const [showAdjustmentNotification, setShowAdjustmentNotification] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);

  // Inicializar estado do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CalorieGoalState;
        setGoalState(parsed);
      } catch (error) {
        console.error("Erro ao carregar estado de ajuste:", error);
        initializeDefaultState();
      }
    } else {
      initializeDefaultState();
    }
  }, []);

  const initializeDefaultState = () => {
    const defaultState: CalorieGoalState = {
      baseGoal: DEFAULT_BASE_GOAL,
      currentGoal: DEFAULT_BASE_GOAL,
      activeAdjustments: [],
      lastExcessDate: null,
    };
    setGoalState(defaultState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  };

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    if (goalState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goalState));
    }
  }, [goalState]);

  // Verificar ajustes expirados e notificações pendentes na inicialização
  useEffect(() => {
    if (!goalState) return;

    const now = new Date();
    let hasChanges = false;
    let shouldShowCompletion = false;
    let shouldShowAdjustment = false;

    // Processar ajustes expirados
    const updatedAdjustments = goalState.activeAdjustments.filter((adj) => {
      const startDate = new Date(adj.startDate);
      const daysSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceStart >= ADJUSTMENT_PERIOD_DAYS + 1) {
        // Ajuste expirou
        hasChanges = true;
        shouldShowCompletion = true;
        return false;
      }

      // Atualizar dias restantes
      const newDaysRemaining = ADJUSTMENT_PERIOD_DAYS - daysSinceStart;
      if (newDaysRemaining !== adj.daysRemaining) {
        adj.daysRemaining = newDaysRemaining;
        hasChanges = true;
      }

      // Verificar se deve mostrar notificação inicial
      if (!adj.notificationShown && goalState.lastExcessDate) {
        if (isValidAdjustmentTime(goalState.lastExcessDate)) {
          adj.notificationShown = true;
          shouldShowAdjustment = true;
          hasChanges = true;
        }
      }

      return true;
    });

    if (hasChanges) {
      // Recalcular meta atual
      let newCurrentGoal = goalState.baseGoal;
      updatedAdjustments.forEach((adj) => {
        newCurrentGoal -= adj.dailyReduction;
      });

      const minimumGoal = calculateMinimumGoal(goalState.baseGoal);
      newCurrentGoal = Math.max(newCurrentGoal, minimumGoal);

      setGoalState({
        ...goalState,
        currentGoal: newCurrentGoal,
        activeAdjustments: updatedAdjustments,
      });

      if (shouldShowCompletion) {
        setShowCompletionNotification(true);
      } else if (shouldShowAdjustment) {
        setShowAdjustmentNotification(true);
      }
    }
  }, [goalState]);

  /**
   * Registra um excesso de calorias e calcula ajuste se necessário
   */
  const registerExcess = useCallback(
    (totalCalories: number) => {
      if (!goalState) return;

      const excess = totalCalories - goalState.currentGoal;

      // Verificar se atingiu o threshold e se não é o mesmo dia do último excesso
      if (excess < MINIMUM_EXCESS_THRESHOLD) return;

      const today = new Date().toISOString();

      // Não processar se já foi processado hoje
      if (goalState.lastExcessDate && isSameDay(today, goalState.lastExcessDate)) {
        return;
      }

      // Calcular redução diária
      const dailyReduction = roundToTen(excess / ADJUSTMENT_PERIOD_DAYS);

      // Calcular nova meta ajustada
      let newCurrentGoal = goalState.currentGoal - dailyReduction;
      const minimumGoal = calculateMinimumGoal(goalState.baseGoal);

      // Verificar se atingiu o piso mínimo
      if (newCurrentGoal < minimumGoal) {
        newCurrentGoal = minimumGoal;
        // Não criar ajuste se já estamos no piso mínimo
        if (goalState.currentGoal <= minimumGoal) {
          return;
        }
      }

      // Criar novo ajuste
      const newAdjustment: CalorieAdjustment = {
        id: Date.now().toString(),
        startDate: today,
        excessAmount: excess,
        dailyReduction,
        daysRemaining: ADJUSTMENT_PERIOD_DAYS,
        previousGoal: goalState.currentGoal,
        adjustedGoal: newCurrentGoal,
        notificationShown: false,
      };

      // Atualizar estado
      setGoalState({
        ...goalState,
        currentGoal: newCurrentGoal,
        activeAdjustments: [...goalState.activeAdjustments, newAdjustment],
        lastExcessDate: today,
      });
    },
    [goalState]
  );

  /**
   * Obtém a meta vigente atual
   */
  const getCurrentGoal = useCallback(() => {
    return goalState?.currentGoal ?? DEFAULT_BASE_GOAL;
  }, [goalState]);

  /**
   * Obtém a meta base original
   */
  const getBaseGoal = useCallback(() => {
    return goalState?.baseGoal ?? DEFAULT_BASE_GOAL;
  }, [goalState]);

  /**
   * Define uma nova meta base (apenas para configuração inicial)
   */
  const setBaseGoal = useCallback(
    (newBaseGoal: number) => {
      if (!goalState) return;

      setGoalState({
        ...goalState,
        baseGoal: newBaseGoal,
        currentGoal: newBaseGoal,
        activeAdjustments: [],
        lastExcessDate: null,
      });
    },
    [goalState]
  );

  /**
   * Fecha a notificação de ajuste
   */
  const dismissAdjustmentNotification = useCallback(() => {
    setShowAdjustmentNotification(false);
  }, []);

  /**
   * Fecha a notificação de conclusão
   */
  const dismissCompletionNotification = useCallback(() => {
    setShowCompletionNotification(false);
  }, []);

  /**
   * Verifica se há ajustes ativos
   */
  const hasActiveAdjustments = useCallback(() => {
    return (goalState?.activeAdjustments.length ?? 0) > 0;
  }, [goalState]);

  return {
    currentGoal: getCurrentGoal(),
    baseGoal: getBaseGoal(),
    hasActiveAdjustments: hasActiveAdjustments(),
    showAdjustmentNotification,
    showCompletionNotification,
    registerExcess,
    setBaseGoal,
    dismissAdjustmentNotification,
    dismissCompletionNotification,
  };
}
