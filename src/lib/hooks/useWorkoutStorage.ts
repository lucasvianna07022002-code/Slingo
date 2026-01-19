"use client";

import { useState, useEffect } from "react";
import { Workout } from "@/lib/types/meal";

const STORAGE_KEY = "slingo_workouts";

export function useWorkoutStorage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Carregar treinos do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWorkouts(parsed.map((w: any) => ({ ...w, timestamp: new Date(w.timestamp) })));
      } catch (error) {
        console.error("Erro ao carregar treinos:", error);
      }
    }
  }, []);

  // Salvar treinos no localStorage
  const saveWorkouts = (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
  };

  // Adicionar novo treino
  const addWorkout = (workout: Workout) => {
    const newWorkouts = [...workouts, workout];
    saveWorkouts(newWorkouts);
  };

  // Obter treinos do dia atual
  const getTodayWorkouts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.timestamp);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    });
  };

  // Calcular total de calorias queimadas hoje
  const getTodayCaloriesBurned = (): number => {
    const todayWorkouts = getTodayWorkouts();
    return todayWorkouts.reduce((acc, workout) => acc + workout.caloriesBurned, 0);
  };

  // Verificar se já registrou treino hoje
  const hasWorkoutToday = (): boolean => {
    return getTodayWorkouts().length > 0;
  };

  // Verificar se o card foi dispensado hoje
  const isCardDismissedToday = (): boolean => {
    const dismissedDate = localStorage.getItem("slingo_workout_card_dismissed");
    if (!dismissedDate) return false;
    
    const dismissed = new Date(dismissedDate);
    const today = new Date();
    dismissed.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return dismissed.getTime() === today.getTime();
  };

  // Dispensar o card por hoje
  const dismissCardForToday = () => {
    localStorage.setItem("slingo_workout_card_dismissed", new Date().toISOString());
  };

  return {
    workouts,
    addWorkout,
    getTodayWorkouts,
    getTodayCaloriesBurned,
    hasWorkoutToday,
    isCardDismissedToday,
    dismissCardForToday,
  };
}
