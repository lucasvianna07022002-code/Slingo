import OpenAI from 'openai';

// No Next.js, variáveis de ambiente públicas precisam começar com NEXT_PUBLIC_
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found. Food image analysis will not work.');
}

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key', // Fallback para evitar erro de inicialização
  dangerouslyAllowBrowser: true, // Permitir uso no navegador
});

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
 * Analisa uma imagem de alimento usando OpenAI Vision API
 * @param imageFile Arquivo de imagem (File ou Blob)
 * @returns Resultado da análise com informações nutricionais
 */
export async function analyzeFoodImage(imageFile: File | Blob): Promise<FoodAnalysisResult> {
  try {
    // Converter imagem para base64
    const base64Image = await fileToBase64(imageFile);

    // Criar prompt detalhado para análise nutricional
    const prompt = `Analise esta imagem de alimento e retorne um JSON com as seguintes informações:

{
  "foods": [
    {
      "name": "Nome do alimento em português",
      "estimatedPortion": "Porção estimada (ex: 1 prato, 2 colheres de sopa, 100g)",
      "calories": número_de_calorias_estimadas,
      "protein": gramas_de_proteína,
      "carbs": gramas_de_carboidratos,
      "fat": gramas_de_gordura,
      "confidence": nível_de_confiança_0_a_1
    }
  ]
}

Instruções importantes:
1. Identifique TODOS os alimentos visíveis na imagem
2. Estime a porção de cada alimento baseado no tamanho visual
3. Forneça valores nutricionais precisos baseados em tabelas nutricionais brasileiras (TACO)
4. Se houver múltiplos alimentos, liste todos separadamente
5. O campo "confidence" deve refletir o quão certo você está da identificação (0.0 a 1.0)
6. Use porções comuns brasileiras (colher de sopa, xícara, prato, unidade, etc)
7. Seja preciso e conservador nas estimativas calóricas

Retorne APENAS o JSON, sem texto adicional.`;

    // Chamar OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo com visão
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2, // Baixa temperatura para respostas mais consistentes
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Nenhuma resposta recebida da API");
    }

    console.log("Resposta da OpenAI:", content);

    // Limpar markdown do JSON (remover ```json e ```)
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    console.log("JSON limpo:", cleanContent);

    // Parse do JSON retornado
    const result = JSON.parse(cleanContent);

    // Validar estrutura da resposta
    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error("Formato de resposta inválido");
    }

    // Calcular totais nutricionais
    const totalNutrition = result.foods.reduce(
      (acc: any, food: FoodItem) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      foods: result.foods,
      totalNutrition,
    };
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    throw new Error("Falha ao analisar a imagem. Tente novamente.");
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
 * Análise rápida apenas de calorias (mais barato)
 */
export async function analyzeCaloriesOnly(imageFile: File | Blob): Promise<number> {
  try {
    const base64Image = await fileToBase64(imageFile);

    const prompt = `Analise esta imagem de alimento e retorne APENAS um número: a quantidade total estimada de calorias.
Seja preciso e conservador na estimativa. Retorne apenas o número, sem texto adicional.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 10,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Nenhuma resposta recebida");
    }

    const calories = parseInt(content, 10);
    if (isNaN(calories)) {
      throw new Error("Resposta inválida");
    }

    return calories;
  } catch (error) {
    console.error("Erro ao analisar calorias:", error);
    throw new Error("Falha ao analisar calorias");
  }
}
