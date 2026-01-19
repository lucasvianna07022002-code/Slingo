"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera, Dumbbell, Cookie } from "lucide-react";
import { useMealStorage } from "@/lib/hooks/useMealStorage";
import { useWorkoutStorage } from "@/lib/hooks/useWorkoutStorage";
import { formatWorkoutType, formatWorkoutIntensity } from "@/lib/utils/workoutCalculator";
import { getTodayMeals } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";
import type { MealHistory } from "@/lib/supabase/database.types";

export default function HistoryScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getTodayMeals: getLocalMeals } = useMealStorage();
  const { getTodayWorkouts } = useWorkoutStorage();
  const [mealsFromDB, setMealsFromDB] = useState<MealHistory[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar usuário autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Buscar refeições do Supabase
  useEffect(() => {
    const fetchMeals = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const meals = await getTodayMeals(userId);
        setMealsFromDB(meals);
      } catch (error) {
        console.error("Erro ao buscar refeições:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [userId]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const todayMeals = getLocalMeals();
  const todayWorkouts = getTodayWorkouts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-inter font-semibold text-slate-800">
          Histórico
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe sua jornada
        </p>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
        <button
          onClick={previousMonth}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-semibold text-slate-800 capitalize">{monthName}</span>
        <button
          onClick={nextMonth}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Calendar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const isToday = day === new Date().getDate() && 
                           currentMonth.getMonth() === new Date().getMonth() &&
                           currentMonth.getFullYear() === new Date().getFullYear();
            
            return (
              <CalendarDay
                key={day}
                day={day}
                isToday={isToday}
                hasData={false}
              />
            );
          })}
        </div>
      </div>

      {/* Monthly Stats - Zerado */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Dias Completos"
          value="0"
          total="30"
        />
        <StatCard
          label="Média Calorias"
          value="0"
          total="2,000"
        />
      </div>

      {/* Today's Activity - Refeições e Treinos */}
      {(todayMeals.length > 0 || todayWorkouts.length > 0 || mealsFromDB.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Hoje</h3>

          {/* Meals from localStorage */}
          {todayMeals.map((meal) => (
            <div key={meal.id} className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800 capitalize">
                    {meal.type === "breakfast" && "Café da Manhã"}
                    {meal.type === "lunch" && "Almoço"}
                    {meal.type === "snack" && "Lanche"}
                    {meal.type === "dinner" && "Jantar"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(meal.timestamp).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {meal.totalNutrition.calories} kcal
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {meal.foods.map((f) => f.name).join(" • ")}
              </p>
            </div>
          ))}

          {/* Meals from Supabase (Doces da aba SOS) */}
          {mealsFromDB.map((meal) => (
            <div key={meal.id} className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {meal.food_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(meal.consumed_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-pink-700">
                      {meal.calories} kcal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>P: {meal.protein}g</span>
                    <span>•</span>
                    <span>C: {meal.carbs}g</span>
                    <span>•</span>
                    <span>G: {meal.fat}g</span>
                  </div>
                  {meal.notes && (
                    <p className="text-xs text-purple-600 mt-1 italic">
                      💡 {meal.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Workouts */}
          {todayWorkouts.map((workout) => (
            <div key={workout.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Treino: {formatWorkoutType(workout.type, workout.sportName)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(workout.timestamp).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      -{workout.caloriesBurned} kcal
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formatWorkoutIntensity(workout.intensity)} • {workout.duration} min
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Body Photos - Vazio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Fotos Corporais</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <AddPhotoCard />
          <AddPhotoCard />
          <AddPhotoCard />
        </div>
      </div>

      {/* Empty State Message */}
      {todayMeals.length === 0 && todayWorkouts.length === 0 && mealsFromDB.length === 0 && !loading && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            Comece a registrar suas refeições para ver seu histórico e progresso aqui.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 text-center">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 mt-2">Carregando...</p>
        </div>
      )}
    </div>
  );
}

function CalendarDay({
  day,
  isToday,
  hasData,
}: {
  day: number;
  isToday: boolean;
  hasData: boolean;
}) {
  return (
    <div
      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
        isToday
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
      }`}
    >
      {day}
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
}: {
  label: string;
  value: string;
  total: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-1 mb-1">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-400">/{total}</p>
      </div>
    </div>
  );
}

function AddPhotoCard() {
  return (
    <button className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all duration-300 flex flex-col items-center justify-center gap-2">
      <Camera className="w-6 h-6 text-slate-400" />
      <span className="text-xs text-slate-500 font-medium">Adicionar</span>
    </button>
  );
}
