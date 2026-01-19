"use client";

import { useState, useEffect } from "react";
import { Meal, NutritionInfo } from "@/lib/types/meal";

const STORAGE_KEY = "slingo_meals";

export function useMealStorage() {
  const [meals, setMeals] = useState<Meal[]>([]);

  // Carregar refeições do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMeals(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (error) {
        console.error("Erro ao carregar refeições:", error);
      }
    }
  }, []);

  // Salvar refeições no localStorage
  const saveMeals = (newMeals: Meal[]) => {
    setMeals(newMeals);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMeals));
    }
  };

  // Adicionar nova refeição
  const addMeal = (meal: Meal) => {
    const newMeals = [...meals, meal];
    saveMeals(newMeals);
  };

  // Obter refeições do dia atual
  const getTodayMeals = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    });
  };

  // Calcular totais diários (incluindo ajuste de treinos)
  const getDailyTotals = (): NutritionInfo & { caloriesBurned: number } => {
    const todayMeals = getTodayMeals();
    const totals = todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalNutrition.calories,
        carbs: acc.carbs + meal.totalNutrition.carbs,
        protein: acc.protein + meal.totalNutrition.protein,
        fat: acc.fat + meal.totalNutrition.fat,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );

    // Obter calorias queimadas de treinos
    let caloriesBurned = 0;
    
    if (typeof window !== "undefined") {
      const workoutsStored = localStorage.getItem("slingo_workouts");
      
      if (workoutsStored) {
        try {
          const workouts = JSON.parse(workoutsStored);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          caloriesBurned = workouts
            .filter((w: any) => {
              const workoutDate = new Date(w.timestamp);
              workoutDate.setHours(0, 0, 0, 0);
              return workoutDate.getTime() === today.getTime();
            })
            .reduce((acc: number, w: any) => acc + w.caloriesBurned, 0);
        } catch (error) {
          console.error("Erro ao calcular calorias queimadas:", error);
        }
      }
    }

    return {
      ...totals,
      caloriesBurned,
    };
  };

  // Obter refeições por tipo (café, almoço, etc)
  const getMealsByType = (type: Meal["type"]) => {
    return getTodayMeals().filter((meal) => meal.type === type);
  };

  return {
    meals,
    addMeal,
    getTodayMeals,
    getDailyTotals,
    getMealsByType,
  };
}
