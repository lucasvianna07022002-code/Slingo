/**
 * Cliente para análise de alimentos usando OpenAI Vision API
 * SEGURANÇA: Este arquivo faz chamadas para a API Route do Next.js,
 * que mantém a API key da OpenAI protegida no servidor.
 * NUNCA exponha a OPENAI_API_KEY no navegador!
 */

export interface FoodItem {
  name: string;
  estimatedPortion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export interface FoodAnalysisResult {
  foods: FoodItem[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * Analisa uma imagem de alimento usando OpenAI Vision API (via API Route segura)
 * @param imageFile Arquivo de imagem (File ou Blob)
 * @returns Resultado da análise com informações nutricionais
 */
export async function analyzeFoodImage(imageFile: File | Blob): Promise<FoodAnalysisResult> {
  try {
    // Converter imagem para base64
    const base64Image = await fileToBase64(imageFile);

    // Chamar a API Route do Next.js (server-side, segura)
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        analysisType: 'full',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao analisar imagem');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Erro ao analisar imagem:", error);
    throw new Error(error.message || "Falha ao analisar a imagem. Tente novamente.");
  }
}

/**
 * Converte File/Blob para base64
 */
function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remover o prefixo "data:image/...;base64," se existir
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

      // Log para debug
      console.log("Tipo do arquivo:", file.type);
      console.log("Tamanho do arquivo:", file.size);
      console.log("Primeiros caracteres do base64:", base64Data.substring(0, 50));

      resolve(base64Data);
    };
    reader.onerror = (error) => {
      console.error("Erro ao ler arquivo:", error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Análise rápida apenas de calorias (mais barato e rápido)
 */
export async function analyzeCaloriesOnly(imageFile: File | Blob): Promise<number> {
  try {
    const base64Image = await fileToBase64(imageFile);

    // Chamar a API Route com análise de calorias apenas
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        analysisType: 'calories',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao analisar calorias');
    }

    const result = await response.json();
    return result.calories;
  } catch (error: any) {
    console.error("Erro ao analisar calorias:", error);
    throw new Error(error.message || "Falha ao analisar calorias");
  }
}
