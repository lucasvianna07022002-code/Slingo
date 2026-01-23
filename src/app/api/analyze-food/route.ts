import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializa o cliente OpenAI no servidor (seguro)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Agora usando a variável correta do servidor
});

export async function POST(request: NextRequest) {
  try {
    // Validar se a API key está configurada
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('***')) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada. Configure OPENAI_API_KEY no arquivo .env' },
        { status: 500 }
      );
    }

    // Receber a imagem em base64 do cliente
    const body = await request.json();
    const { image, analysisType = 'full' } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    // Análise completa ou apenas calorias
    if (analysisType === 'calories') {
      const calories = await analyzeCaloriesOnly(image);
      return NextResponse.json({ calories });
    } else {
      const result = await analyzeFoodImage(image);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error('Erro na API de análise de alimentos:', error);

    // Retornar mensagem de erro mais detalhada
    return NextResponse.json(
      {
        error: 'Falha ao analisar a imagem',
        details: error?.message || 'Erro desconhecido',
        status: error?.status || 500
      },
      { status: error?.status || 500 }
    );
  }
}

/**
 * Analisa uma imagem de alimento usando OpenAI Vision API
 */
async function analyzeFoodImage(base64Image: string) {
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
    max_tokens: 1000,
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Nenhuma resposta recebida da API");
  }

  // Limpar markdown do JSON
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  const result = JSON.parse(cleanContent);

  // Validar estrutura
  if (!result.foods || !Array.isArray(result.foods)) {
    throw new Error("Formato de resposta inválido");
  }

  // Calcular totais nutricionais
  const totalNutrition = result.foods.reduce(
    (acc: any, food: any) => ({
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
}

/**
 * Análise rápida apenas de calorias
 */
async function analyzeCaloriesOnly(base64Image: string) {
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
}
