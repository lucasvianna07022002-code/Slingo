import { WorkoutType, WorkoutIntensity } from "@/lib/types/meal";

// Valores médios de MET (Metabolic Equivalent of Task) por tipo e intensidade
const MET_VALUES: Record<WorkoutType, Record<WorkoutIntensity, number>> = {
  musculacao: {
    leve: 3.5,
    moderada: 5.0,
    pesada: 6.0,
  },
  cardio: {
    leve: 4.0,
    moderada: 7.0,
    pesada: 10.0,
  },
  esporte: {
    leve: 4.5,
    moderada: 6.5,
    pesada: 8.5,
  },
};

/**
 * Calcula o gasto calórico de um treino
 * Fórmula: Calorias = MET × Peso (kg) × Tempo (horas)
 * Usando peso médio de 70kg como padrão
 */
export function calculateWorkoutCalories(
  type: WorkoutType,
  intensity: WorkoutIntensity,
  durationMinutes: number
): number {
  const AVERAGE_WEIGHT = 70; // kg
  const met = MET_VALUES[type][intensity];
  const hours = durationMinutes / 60;
  
  return Math.round(met * AVERAGE_WEIGHT * hours);
}

/**
 * Formata o tipo de treino para exibição
 */
export function formatWorkoutType(type: WorkoutType, sportName?: string): string {
  if (type === "esporte" && sportName) {
    return sportName;
  }
  
  const labels: Record<WorkoutType, string> = {
    musculacao: "Musculação",
    cardio: "Cardio",
    esporte: "Esporte",
  };
  
  return labels[type];
}

/**
 * Formata a intensidade para exibição
 */
export function formatWorkoutIntensity(intensity: WorkoutIntensity): string {
  const labels: Record<WorkoutIntensity, string> = {
    leve: "Leve",
    moderada: "Moderado",
    pesada: "Pesado",
  };
  
  return labels[intensity];
}
