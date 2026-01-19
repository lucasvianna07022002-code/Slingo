import { supabase } from './client';
import type { 
  Profile, 
  MealHistory, 
  ActivityHistory, 
  InsertProfile,
  InsertMealHistory, 
  InsertActivityHistory 
} from './database.types';

// ==================== USER PROFILES ====================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function upsertProfile(profile: InsertProfile) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<InsertProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// ==================== MEAL HISTORY ====================

export async function addMealToHistory(meal: InsertMealHistory) {
  const { data, error } = await supabase
    .from('meal_history')
    .insert(meal)
    .select()
    .single();

  if (error) throw error;
  return data as MealHistory;
}

export async function getMealHistory(userId: string, date?: Date) {
  let query = supabase
    .from('meal_history')
    .select('*')
    .eq('user_id', userId)
    .order('consumed_at', { ascending: false });

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as MealHistory[];
}

export async function getTodayMeals(userId: string) {
  const today = new Date();
  return getMealHistory(userId, today);
}

export async function getMealsByDateRange(userId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('meal_history')
    .select('*')
    .eq('user_id', userId)
    .gte('consumed_at', startDate.toISOString())
    .lte('consumed_at', endDate.toISOString())
    .order('consumed_at', { ascending: false });

  if (error) throw error;
  return data as MealHistory[];
}

export async function updateMeal(mealId: string, updates: Partial<MealHistory>) {
  const { data, error } = await supabase
    .from('meal_history')
    .update(updates)
    .eq('id', mealId)
    .select()
    .single();

  if (error) throw error;
  return data as MealHistory;
}

export async function deleteMeal(mealId: string) {
  const { error } = await supabase
    .from('meal_history')
    .delete()
    .eq('id', mealId);

  if (error) throw error;
}

// ==================== ACTIVITY HISTORY ====================

export async function addActivityToHistory(activity: InsertActivityHistory) {
  const { data, error } = await supabase
    .from('activity_history')
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data as ActivityHistory;
}

export async function getActivityHistory(userId: string, date?: Date) {
  let query = supabase
    .from('activity_history')
    .select('*')
    .eq('user_id', userId)
    .order('performed_at', { ascending: false });

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('performed_at', startOfDay.toISOString())
      .lte('performed_at', endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ActivityHistory[];
}

export async function getTodayActivities(userId: string) {
  const today = new Date();
  return getActivityHistory(userId, today);
}

export async function getActivitiesByDateRange(userId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('activity_history')
    .select('*')
    .eq('user_id', userId)
    .gte('performed_at', startDate.toISOString())
    .lte('performed_at', endDate.toISOString())
    .order('performed_at', { ascending: false });

  if (error) throw error;
  return data as ActivityHistory[];
}

export async function updateActivity(activityId: string, updates: Partial<ActivityHistory>) {
  const { data, error } = await supabase
    .from('activity_history')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;
  return data as ActivityHistory;
}

export async function deleteActivity(activityId: string) {
  const { error } = await supabase
    .from('activity_history')
    .delete()
    .eq('id', activityId);

  if (error) throw error;
}

// ==================== ESTATÍSTICAS ====================

export async function getDailyNutritionStats(userId: string, date: Date = new Date()) {
  const meals = await getMealHistory(userId, date);
  
  const stats = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + Number(meal.protein),
      carbs: acc.carbs + Number(meal.carbs),
      fat: acc.fat + Number(meal.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return stats;
}

export async function getDailyActivityStats(userId: string, date: Date = new Date()) {
  const activities = await getActivityHistory(userId, date);
  
  const stats = activities.reduce(
    (acc, activity) => ({
      totalDuration: acc.totalDuration + activity.duration_minutes,
      totalCaloriesBurned: acc.totalCaloriesBurned + (activity.calories_burned || 0),
      activitiesCount: acc.activitiesCount + 1,
    }),
    { totalDuration: 0, totalCaloriesBurned: 0, activitiesCount: 0 }
  );

  return stats;
}

export async function getWeeklyStats(userId: string) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const meals = await getMealsByDateRange(userId, weekAgo, today);
  const activities = await getActivitiesByDateRange(userId, weekAgo, today);

  const nutritionByDay = meals.reduce((acc, meal) => {
    const day = new Date(meal.consumed_at).toLocaleDateString();
    if (!acc[day]) {
      acc[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    acc[day].calories += meal.calories;
    acc[day].protein += Number(meal.protein);
    acc[day].carbs += Number(meal.carbs);
    acc[day].fat += Number(meal.fat);
    return acc;
  }, {} as Record<string, { calories: number; protein: number; carbs: number; fat: number }>);

  const activityByDay = activities.reduce((acc, activity) => {
    const day = new Date(activity.performed_at).toLocaleDateString();
    if (!acc[day]) {
      acc[day] = { duration: 0, caloriesBurned: 0, count: 0 };
    }
    acc[day].duration += activity.duration_minutes;
    acc[day].caloriesBurned += activity.calories_burned || 0;
    acc[day].count += 1;
    return acc;
  }, {} as Record<string, { duration: number; caloriesBurned: number; count: number }>);

  return {
    nutritionByDay,
    activityByDay,
  };
}
