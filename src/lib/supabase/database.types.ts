// Tipos do banco de dados Supabase

export interface Profile {
  id: string;
  user_id: string;
  peso_atual: number | null;
  altura: number | null;
  peso_desejado: number | null;
  motivo_emagrecer: string | null;
  idade: number | null;
  sexo: string | null;
  atividade: string | null;
  motivo: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealHistory {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string | null;
  consumed_at: string;
  notes: string | null;
  created_at: string;
}

export interface ActivityHistory {
  id: string;
  user_id: string;
  activity_name: string;
  activity_type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other' | null;
  duration_minutes: number;
  calories_burned: number | null;
  intensity: 'low' | 'moderate' | 'high' | 'very_high' | null;
  performed_at: string;
  notes: string | null;
  created_at: string;
}

export interface InsertProfile {
  user_id: string;
  peso_atual?: number;
  altura?: number;
  peso_desejado?: number;
  motivo_emagrecer?: string;
  idade?: number;
  sexo?: string;
  atividade?: string;
  motivo?: string;
}

export interface InsertMealHistory {
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size?: string;
  consumed_at?: string;
  notes?: string;
}

export interface InsertActivityHistory {
  user_id: string;
  activity_name: string;
  activity_type?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration_minutes: number;
  calories_burned?: number;
  intensity?: 'low' | 'moderate' | 'high' | 'very_high';
  performed_at?: string;
  notes?: string;
}
