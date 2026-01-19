import { NutritionInfo } from "@/lib/types/meal";

// Banco de dados simulado de alimentos (em produção, isso viria de uma API)
const FOOD_DATABASE: Record<string, NutritionInfo> = {
  // Grãos e Cereais
  arroz: { calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
  "arroz integral": { calories: 112, carbs: 24, protein: 2.6, fat: 0.9 },
  macarrão: { calories: 131, carbs: 25, protein: 5, fat: 1.1 },
  pão: { calories: 265, carbs: 49, protein: 9, fat: 3.2 },
  "pão integral": { calories: 247, carbs: 41, protein: 13, fat: 3.4 },
  aveia: { calories: 389, carbs: 66, protein: 17, fat: 7 },

  // Proteínas
  frango: { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  "frango grelhado": { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  carne: { calories: 250, carbs: 0, protein: 26, fat: 15 },
  peixe: { calories: 206, carbs: 0, protein: 22, fat: 12 },
  ovo: { calories: 155, carbs: 1.1, protein: 13, fat: 11 },
  "ovo cozido": { calories: 155, carbs: 1.1, protein: 13, fat: 11 },

  // Laticínios
  leite: { calories: 61, carbs: 4.8, protein: 3.2, fat: 3.3 },
  queijo: { calories: 402, carbs: 1.3, protein: 25, fat: 33 },
  "queijo branco": { calories: 264, carbs: 3.6, protein: 17, fat: 20 },
  iogurte: { calories: 59, carbs: 3.6, protein: 10, fat: 0.4 },
  "iogurte grego": { calories: 97, carbs: 3.6, protein: 9, fat: 5 },

  // Vegetais
  alface: { calories: 15, carbs: 2.9, protein: 1.4, fat: 0.2 },
  tomate: { calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2 },
  cenoura: { calories: 41, carbs: 10, protein: 0.9, fat: 0.2 },
  brócolis: { calories: 34, carbs: 7, protein: 2.8, fat: 0.4 },
  batata: { calories: 77, carbs: 17, protein: 2, fat: 0.1 },

  // Frutas
  banana: { calories: 89, carbs: 23, protein: 1.1, fat: 0.3 },
  maçã: { calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
  laranja: { calories: 47, carbs: 12, protein: 0.9, fat: 0.1 },
  morango: { calories: 32, carbs: 7.7, protein: 0.7, fat: 0.3 },
  abacate: { calories: 160, carbs: 8.5, protein: 2, fat: 15 },

  // Leguminosas
  feijão: { calories: 127, carbs: 23, protein: 9, fat: 0.5 },
  lentilha: { calories: 116, carbs: 20, protein: 9, fat: 0.4 },
  grão: { calories: 164, carbs: 27, protein: 9, fat: 2.6 },
  "grão de bico": { calories: 164, carbs: 27, protein: 9, fat: 2.6 },
};

// Unidades de medida e suas conversões para gramas
const PORTION_CONVERSIONS: Record<string, number> = {
  // Colheres
  "colher": 15,
  "colheres": 15,
  "colher de sopa": 15,
  "colheres de sopa": 15,
  "cs": 15,
  "colher de chá": 5,
  "colheres de chá": 5,

  // Xícaras
  "xícara": 240,
  "xícaras": 240,
  "xicara": 240,
  "xicaras": 240,

  // Unidades
  "unidade": 100,
  "unidades": 100,
  "un": 100,
  "fatia": 30,
  "fatias": 30,
  "pedaço": 50,
  "pedaços": 50,

  // Prato
  "prato": 200,
  "pratos": 200,
  "prato raso": 150,
  "prato fundo": 250,
};

export function parseManualEntry(text: string): {
  foodName: string;
  quantity: number;
  unit: string;
} | null {
  const lowerText = text.toLowerCase().trim();

  // Extrair quantidade (número)
  const quantityMatch = lowerText.match(/(\d+(?:[.,]\d+)?)/);
  const quantity = quantityMatch ? parseFloat(quantityMatch[1].replace(",", ".")) : 1;

  // Extrair unidade de medida
  let unit = "g";
  let portionMultiplier = 1;

  for (const [portionName, grams] of Object.entries(PORTION_CONVERSIONS)) {
    if (lowerText.includes(portionName)) {
      unit = portionName;
      portionMultiplier = grams;
      break;
    }
  }

  // Se tem "g" ou "gramas" explícito
  if (lowerText.includes("g") || lowerText.includes("gramas")) {
    unit = "g";
    portionMultiplier = 1;
  }

  // Extrair nome do alimento
  let foodName = lowerText
    .replace(/\d+(?:[.,]\d+)?/g, "")
    .replace(new RegExp(Object.keys(PORTION_CONVERSIONS).join("|"), "gi"), "")
    .replace(/[–-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Tentar encontrar o alimento no banco de dados
  const matchedFood = Object.keys(FOOD_DATABASE).find((food) => foodName.includes(food));

  if (matchedFood) {
    foodName = matchedFood;
  }

  return {
    foodName,
    quantity: quantity * portionMultiplier,
    unit,
  };
}

export function calculateNutrition(
  foodName: string,
  quantityInGrams: number
): NutritionInfo | null {
  const baseNutrition = FOOD_DATABASE[foodName.toLowerCase()];

  if (!baseNutrition) {
    // Se não encontrar, retornar estimativa genérica
    return {
      calories: Math.round(quantityInGrams * 1.5),
      carbs: Math.round(quantityInGrams * 0.2),
      protein: Math.round(quantityInGrams * 0.1),
      fat: Math.round(quantityInGrams * 0.05),
    };
  }

  // Calcular proporcionalmente (base é por 100g)
  const multiplier = quantityInGrams / 100;

  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    carbs: Math.round(baseNutrition.carbs * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier),
    fat: Math.round(baseNutrition.fat * multiplier),
  };
}

export function estimateNutritionFromText(text: string): NutritionInfo | null {
  const parsed = parseManualEntry(text);
  if (!parsed) return null;

  return calculateNutrition(parsed.foodName, parsed.quantity);
}
