/**
 * Tipos e interfaces para o sistema de Ajuste Automático de Calorias
 */

export interface CalorieAdjustment {
  id: string;
  startDate: string; // ISO date string do dia do excesso
  excessAmount: number; // Valor do excesso que gerou o ajuste
  dailyReduction: number; // Redução diária aplicada (múltiplo de 10)
  daysRemaining: number; // Dias restantes de ajuste (de 7 a 0)
  previousGoal: number; // Meta anterior ao ajuste
  adjustedGoal: number; // Meta ajustada atual
  notificationShown: boolean; // Se o pop-up inicial já foi exibido
}

export interface CalorieGoalState {
  baseGoal: number; // Meta base original do usuário
  currentGoal: number; // Meta vigente atual
  activeAdjustments: CalorieAdjustment[]; // Ajustes ativos
  lastExcessDate: string | null; // Data do último excesso processado
}

export const MINIMUM_EXCESS_THRESHOLD = 280; // Calorias
export const ADJUSTMENT_PERIOD_DAYS = 7;
export const MINIMUM_GOAL_PERCENTAGE = 0.85; // 85% da meta base
export const ADJUSTMENT_START_HOUR = 6; // 06:00 da manhã

/**
 * Arredonda para múltiplo de 10
 */
export function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

/**
 * Calcula o piso mínimo permitido
 */
export function calculateMinimumGoal(baseGoal: number): number {
  return Math.ceil((baseGoal * MINIMUM_GOAL_PERCENTAGE) / 10) * 10;
}

/**
 * Verifica se é um novo dia válido para aplicar ajuste (após 06:00)
 */
export function isValidAdjustmentTime(lastExcessDate: string): boolean {
  const excessDate = new Date(lastExcessDate);
  const now = new Date();

  // Verificar se é dia diferente
  const isDifferentDay =
    now.getDate() !== excessDate.getDate() ||
    now.getMonth() !== excessDate.getMonth() ||
    now.getFullYear() !== excessDate.getFullYear();

  if (!isDifferentDay) return false;

  // Verificar se já passou das 06:00
  return now.getHours() >= ADJUSTMENT_START_HOUR;
}

/**
 * Verifica se é o mesmo dia
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}
