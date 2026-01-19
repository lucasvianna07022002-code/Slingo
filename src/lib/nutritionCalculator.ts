/**
 * Calculadora de necessidades nutricionais baseada em dados do usuário
 * Utiliza a Equação de Harris-Benedict revisada e fatores de atividade
 */

export interface UserData {
  idade: number;
  peso_atual: number;
  altura: number;
  peso_desejado: number;
  sexo_biologico: "Masculino" | "Feminino";
  nivel_atividade: string;
}

export interface NutritionalNeeds {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

/**
 * Fatores de atividade física para cálculo de TDEE
 */
const ACTIVITY_FACTORS = {
  "Sedentário (pouco ou nenhum exercício)": 1.2,
  "Levemente ativo (exercício leve 1-3 dias/semana)": 1.375,
  "Moderadamente ativo (exercício moderado 3-5 dias/semana)": 1.55,
  "Muito ativo (exercício intenso 6-7 dias/semana)": 1.725,
  "Extremamente ativo (exercício muito intenso, trabalho físico)": 1.9,
};

/**
 * Calcula a Taxa Metabólica Basal (TMB) usando a Equação de Harris-Benedict revisada
 */
function calculateBMR(peso: number, altura: number, idade: number, sexo: "Masculino" | "Feminino"): number {
  if (sexo === "Masculino") {
    // TMB Homens = 88.362 + (13.397 × peso em kg) + (4.799 × altura em cm) - (5.677 × idade em anos)
    return 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
  } else {
    // TMB Mulheres = 447.593 + (9.247 × peso em kg) + (3.098 × altura em cm) - (4.330 × idade em anos)
    return 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
  }
}

/**
 * Calcula o TDEE (Total Daily Energy Expenditure) - gasto calórico diário total
 */
function calculateTDEE(bmr: number, nivelAtividade: string): number {
  const activityFactor = ACTIVITY_FACTORS[nivelAtividade as keyof typeof ACTIVITY_FACTORS] || 1.2;
  return bmr * activityFactor;
}

/**
 * Calcula o déficit calórico necessário para perda de peso
 * Déficit moderado: 300-500 kcal/dia (perda de ~0.5kg/semana)
 */
function calculateCalorieGoal(tdee: number, pesoAtual: number, pesoDesejado: number): number {
  const pesoAPerder = pesoAtual - pesoDesejado;
  
  // Se já está no peso desejado ou quer ganhar peso, manter TDEE
  if (pesoAPerder <= 0) {
    return Math.round(tdee);
  }
  
  // Déficit moderado para perda saudável
  // Até 5kg: déficit de 300 kcal
  // 5-10kg: déficit de 400 kcal
  // Mais de 10kg: déficit de 500 kcal
  let deficit = 300;
  if (pesoAPerder > 10) {
    deficit = 500;
  } else if (pesoAPerder > 5) {
    deficit = 400;
  }
  
  // Garantir que não fique abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)
  const minCalories = 1200;
  const calorieGoal = tdee - deficit;
  
  return Math.round(Math.max(calorieGoal, minCalories));
}

/**
 * Calcula a distribuição de macronutrientes
 * Padrão balanceado: 40% carboidratos, 30% proteínas, 30% gorduras
 */
function calculateMacros(calories: number, peso: number): { protein: number; carbs: number; fat: number } {
  // Proteína: 1.6-2.2g por kg de peso corporal (usamos 2g para preservar massa muscular)
  const protein = Math.round(peso * 2);
  
  // Gordura: 25-30% das calorias (usamos 30%)
  const fatCalories = calories * 0.30;
  const fat = Math.round(fatCalories / 9); // 9 kcal por grama de gordura
  
  // Carboidratos: resto das calorias
  const proteinCalories = protein * 4; // 4 kcal por grama de proteína
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4); // 4 kcal por grama de carboidrato
  
  return { protein, carbs, fat };
}

/**
 * Calcula a necessidade diária de água
 * Fórmula: 35ml por kg de peso corporal
 */
function calculateWater(peso: number): number {
  const waterML = peso * 35;
  const waterL = waterML / 1000;
  return Math.round(waterL * 10) / 10; // Arredondar para 1 casa decimal
}

/**
 * Função principal que calcula todas as necessidades nutricionais
 */
export function calculateNutritionalNeeds(userData: UserData): NutritionalNeeds {
  // Extrair dados do usuário
  const { idade, peso_atual, altura, peso_desejado, sexo_biologico, nivel_atividade } = userData;
  
  // 1. Calcular TMB (Taxa Metabólica Basal)
  const bmr = calculateBMR(peso_atual, altura, idade, sexo_biologico);
  
  // 2. Calcular TDEE (gasto calórico total diário)
  const tdee = calculateTDEE(bmr, nivel_atividade);
  
  // 3. Calcular meta de calorias (com déficit se necessário)
  const calories = calculateCalorieGoal(tdee, peso_atual, peso_desejado);
  
  // 4. Calcular macronutrientes
  const macros = calculateMacros(calories, peso_atual);
  
  // 5. Calcular necessidade de água
  const water = calculateWater(peso_atual);
  
  return {
    calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    water,
  };
}

/**
 * Extrai dados do perfil do usuário no formato esperado
 */
export function extractUserDataFromProfile(profile: any): UserData | null {
  if (!profile || !profile.motivo_emagrecer) {
    return null;
  }
  
  // Extrair informações do campo motivo_emagrecer
  const info = profile.motivo_emagrecer;
  
  // Regex para extrair idade
  const idadeMatch = info.match(/Idade:\s*(\d+)/);
  const idade = idadeMatch ? parseInt(idadeMatch[1]) : 30; // Default 30 se não encontrar
  
  // Regex para extrair sexo
  const sexoMatch = info.match(/Sexo:\s*(Masculino|Feminino)/);
  const sexo_biologico = sexoMatch ? sexoMatch[1] as "Masculino" | "Feminino" : "Masculino";
  
  // Regex para extrair nível de atividade
  const atividadeMatch = info.match(/Atividade:\s*([^|]+)/);
  const nivel_atividade = atividadeMatch 
    ? atividadeMatch[1].trim() 
    : "Sedentário (pouco ou nenhum exercício)";
  
  return {
    idade,
    peso_atual: profile.peso_atual,
    altura: profile.altura,
    peso_desejado: profile.peso_desejado,
    sexo_biologico,
    nivel_atividade,
  };
}
