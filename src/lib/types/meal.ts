// Tipos para o sistema de refeições

export interface NutritionInfo {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface FoodItem {
  name: string;
  nutrition: NutritionInfo;
  portion: string;
  confidence?: number; // Para scanner de imagem
}

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "snack" | "dinner";
  timestamp: Date;
  foods: FoodItem[];
  totalNutrition: NutritionInfo;
  method: "barcode" | "manual" | "photo";
}

export type PortionSize = "P" | "M" | "G" | "T";

export const PORTION_MULTIPLIERS: Record<PortionSize, number> = {
  P: 0.25,
  M: 0.5,
  G: 0.75,
  T: 1.0,
};

export interface BarcodeResult {
  productName: string;
  nutrition: NutritionInfo;
  barcode: string;
}

export interface PlateAnalysisResult {
  foods: Array<{
    name: string;
    estimatedPortion: string;
    nutrition: NutritionInfo;
    confidence: number;
  }>;
  totalNutrition: NutritionInfo;
}

// Tipos para o sistema de treinos

export type WorkoutType = "musculacao" | "cardio" | "esporte";
export type WorkoutIntensity = "leve" | "moderada" | "pesada";

export interface Workout {
  id: string;
  type: WorkoutType;
  sportName?: string; // Apenas quando type === "esporte"
  intensity: WorkoutIntensity;
  duration: number; // em minutos
  caloriesBurned: number;
  timestamp: Date;
}
