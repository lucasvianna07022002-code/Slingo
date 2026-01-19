/**
 * Tabela TACO - Valores nutricionais por 100g de alimento
 * Fonte: Tabela Brasileira de Composição de Alimentos (TACO)
 */

export interface TacoFood {
  name: string;
  calories: number; // kcal por 100g
  carbs: number; // g por 100g
  protein: number; // g por 100g
  fat: number; // g por 100g
  portionReference: string; // Referência de porção comum
  portionGrams: number; // Gramas da porção de referência
}

export const TACO_TABLE: Record<string, TacoFood> = {
  // CEREAIS E DERIVADOS
  "arroz branco": {
    name: "Arroz Branco",
    calories: 130,
    carbs: 28,
    protein: 2.7,
    fat: 0.3,
    portionReference: "1 colher de sopa",
    portionGrams: 25,
  },
  "arroz integral": {
    name: "Arroz Integral",
    calories: 124,
    carbs: 25.8,
    protein: 2.6,
    fat: 1.0,
    portionReference: "1 colher de sopa",
    portionGrams: 25,
  },
  "macarrão": {
    name: "Macarrão",
    calories: 371,
    carbs: 75.1,
    protein: 12.5,
    fat: 1.3,
    portionReference: "1 pegador",
    portionGrams: 80,
  },
  "pão francês": {
    name: "Pão Francês",
    calories: 300,
    carbs: 58.6,
    protein: 8.0,
    fat: 3.1,
    portionReference: "1 unidade",
    portionGrams: 50,
  },
  "pão integral": {
    name: "Pão Integral",
    calories: 253,
    carbs: 49.0,
    protein: 9.4,
    fat: 3.5,
    portionReference: "1 fatia",
    portionGrams: 25,
  },

  // LEGUMINOSAS
  "feijão preto": {
    name: "Feijão Preto",
    calories: 77,
    carbs: 14.0,
    protein: 4.5,
    fat: 0.5,
    portionReference: "1 concha",
    portionGrams: 100,
  },
  "feijão carioca": {
    name: "Feijão Carioca",
    calories: 76,
    carbs: 13.6,
    protein: 4.8,
    fat: 0.5,
    portionReference: "1 concha",
    portionGrams: 100,
  },
  "lentilha": {
    name: "Lentilha",
    calories: 93,
    carbs: 16.3,
    protein: 6.3,
    fat: 0.4,
    portionReference: "1 concha",
    portionGrams: 100,
  },
  "grão de bico": {
    name: "Grão de Bico",
    calories: 121,
    carbs: 18.8,
    protein: 7.0,
    fat: 2.0,
    portionReference: "1 concha",
    portionGrams: 100,
  },

  // CARNES E OVOS
  "frango grelhado": {
    name: "Frango Grelhado",
    calories: 165,
    carbs: 0,
    protein: 31.0,
    fat: 3.6,
    portionReference: "1 filé",
    portionGrams: 100,
  },
  "carne bovina": {
    name: "Carne Bovina",
    calories: 250,
    carbs: 0,
    protein: 26.0,
    fat: 16.0,
    portionReference: "1 bife",
    portionGrams: 100,
  },
  "peixe grelhado": {
    name: "Peixe Grelhado",
    calories: 96,
    carbs: 0,
    protein: 20.0,
    fat: 1.3,
    portionReference: "1 filé",
    portionGrams: 100,
  },
  "ovo cozido": {
    name: "Ovo Cozido",
    calories: 155,
    carbs: 1.1,
    protein: 13.0,
    fat: 10.6,
    portionReference: "1 unidade",
    portionGrams: 50,
  },
  "ovo frito": {
    name: "Ovo Frito",
    calories: 196,
    carbs: 0.6,
    protein: 13.6,
    fat: 15.0,
    portionReference: "1 unidade",
    portionGrams: 50,
  },

  // VEGETAIS E VERDURAS
  "salada verde": {
    name: "Salada Verde",
    calories: 15,
    carbs: 3.0,
    protein: 1.2,
    fat: 0.2,
    portionReference: "1 porção",
    portionGrams: 100,
  },
  "tomate": {
    name: "Tomate",
    calories: 18,
    carbs: 3.9,
    protein: 0.9,
    fat: 0.2,
    portionReference: "1 unidade média",
    portionGrams: 80,
  },
  "cenoura": {
    name: "Cenoura",
    calories: 41,
    carbs: 9.6,
    protein: 0.9,
    fat: 0.2,
    portionReference: "1 unidade média",
    portionGrams: 100,
  },
  "brócolis": {
    name: "Brócolis",
    calories: 34,
    carbs: 6.6,
    protein: 2.8,
    fat: 0.4,
    portionReference: "1 porção",
    portionGrams: 100,
  },
  "batata": {
    name: "Batata",
    calories: 77,
    carbs: 17.0,
    protein: 2.0,
    fat: 0.1,
    portionReference: "1 unidade média",
    portionGrams: 100,
  },
  "batata doce": {
    name: "Batata Doce",
    calories: 86,
    carbs: 20.1,
    protein: 1.6,
    fat: 0.1,
    portionReference: "1 unidade média",
    portionGrams: 100,
  },

  // FRUTAS
  "banana": {
    name: "Banana",
    calories: 89,
    carbs: 22.8,
    protein: 1.1,
    fat: 0.3,
    portionReference: "1 unidade média",
    portionGrams: 100,
  },
  "maçã": {
    name: "Maçã",
    calories: 52,
    carbs: 13.8,
    protein: 0.3,
    fat: 0.2,
    portionReference: "1 unidade média",
    portionGrams: 130,
  },
  "laranja": {
    name: "Laranja",
    calories: 47,
    carbs: 11.8,
    protein: 0.9,
    fat: 0.1,
    portionReference: "1 unidade média",
    portionGrams: 180,
  },
  "morango": {
    name: "Morango",
    calories: 32,
    carbs: 7.7,
    protein: 0.7,
    fat: 0.3,
    portionReference: "1 xícara",
    portionGrams: 150,
  },

  // LATICÍNIOS
  "leite integral": {
    name: "Leite Integral",
    calories: 61,
    carbs: 4.6,
    protein: 3.2,
    fat: 3.5,
    portionReference: "1 copo",
    portionGrams: 200,
  },
  "iogurte natural": {
    name: "Iogurte Natural",
    calories: 61,
    carbs: 4.7,
    protein: 3.5,
    fat: 3.3,
    portionReference: "1 pote",
    portionGrams: 170,
  },
  "queijo minas": {
    name: "Queijo Minas",
    calories: 264,
    carbs: 3.0,
    protein: 17.4,
    fat: 20.8,
    portionReference: "1 fatia",
    portionGrams: 30,
  },

  // ÓLEOS E GORDURAS
  "azeite": {
    name: "Azeite",
    calories: 884,
    carbs: 0,
    protein: 0,
    fat: 100.0,
    portionReference: "1 colher de sopa",
    portionGrams: 13,
  },
  "manteiga": {
    name: "Manteiga",
    calories: 717,
    carbs: 0.1,
    protein: 0.6,
    fat: 81.1,
    portionReference: "1 colher de sopa",
    portionGrams: 10,
  },
};

/**
 * Busca um alimento na tabela TACO (case-insensitive)
 */
export function findTacoFood(foodName: string): TacoFood | null {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Busca exata
  if (TACO_TABLE[normalizedName]) {
    return TACO_TABLE[normalizedName];
  }
  
  // Busca parcial (contém)
  for (const [key, value] of Object.entries(TACO_TABLE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Calcula valores nutricionais para uma quantidade específica
 */
export function calculateNutrition(
  tacoFood: TacoFood,
  quantity: number,
  unit: "g" | "portion"
): {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
} {
  let grams: number;
  
  if (unit === "portion") {
    grams = tacoFood.portionGrams * quantity;
  } else {
    grams = quantity;
  }
  
  const factor = grams / 100; // TACO é por 100g
  
  return {
    calories: Math.round(tacoFood.calories * factor),
    carbs: Math.round(tacoFood.carbs * factor * 10) / 10,
    protein: Math.round(tacoFood.protein * factor * 10) / 10,
    fat: Math.round(tacoFood.fat * factor * 10) / 10,
  };
}

/**
 * Extrai a quantidade de uma string de porção
 * Ex: "2 colheres de sopa" -> 2
 */
export function extractQuantityFromPortion(portionString: string): number {
  const match = portionString.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 1;
}
