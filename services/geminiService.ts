import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";
import type { Question, AIAnalysisResult, GroundingSource } from '../types';

// FIX: Per coding guidelines, API key must be obtained exclusively from process.env.API_KEY.
// The key's availability is a hard requirement, so no fallbacks or warnings are needed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestQuestions = async (topic: string): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Ты — эксперт по созданию эффективных опросов. Для темы опроса "${topic}" предложи 3-5 релевантных вопросов. Вопросы должны быть разных типов: один вариант (radio), несколько вариантов (checkbox), шкала (scale), и открытый текстовый ответ (text). Для radio и checkbox добавь 3-4 варианта ответа в поле 'options'. Для scale и text поле 'options' должно быть пустым. Предоставь результат в виде JSON, соответствующего следующей схеме.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Уникальный ID вопроса" },
              text: { type: Type.STRING, description: "Текст вопроса" },
              type: { type: Type.STRING, description: "Тип вопроса: 'radio', 'checkbox', 'scale', 'text'" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Варианты ответов для 'radio' и 'checkbox'"
              },
            },
            required: ["id", "text", "type"],
          },
        },
      },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error suggesting questions:", error);
    throw new Error("Не удалось сгенерировать вопросы. Попробуйте снова.");
  }
};

export const analyzeTextResponses = async (responses: string[]): Promise<AIAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Ты — профессиональный аналитик данных. Проанализируй следующий массив текстовых ответов из опроса. Ответы: ${JSON.stringify(responses)}. Твоя задача — предоставить глубокий анализ в формате JSON, соответствующем следующей схеме.
Вот что должно быть в результате:
1.  **sentiment**: Анализ тональности. Укажи процентное соотношение "positive", "negative", "neutral". Сумма должна быть равна 100.
2.  **keyThemes**: Список из 5-7 ключевых тем, затронутых в ответах. Для каждой темы дай краткое описание.
3.  **summary**: Краткая сводка (1-2 абзаца), обобщающая главные выводы, проблемы и предложения.
4.  **quotes**: Для каждой ключевой темы подбери 2-3 яркие цитаты из ответов, которые её иллюстрируют.`,
        config: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 32768 },
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentiment: {
                        type: Type.OBJECT,
                        properties: {
                            positive: { type: Type.NUMBER },
                            neutral: { type: Type.NUMBER },
                            negative: { type: Type.NUMBER },
                        },
                        required: ["positive", "neutral", "negative"],
                    },
                    keyThemes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                theme: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                            required: ["theme", "description"],
                        },
                    },
                    summary: { type: Type.STRING },
                    quotes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                theme: { type: Type.STRING },
                                quotes: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                            },
                            required: ["theme", "quotes"],
                        },
                    },
                },
                required: ["sentiment", "keyThemes", "summary", "quotes"],
            },
        },
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AIAnalysisResult;
  } catch (error) {
    console.error("Error analyzing responses:", error);
    throw new Error("Не удалось проанализировать ответы. Попробуйте снова.");
  }
};

interface EditResult {
    text: string;
    sources: GroundingSource[];
}

export const editReportSummary = async (
    originalSummary: string,
    instruction: string,
    contextualResponses: string[],
    useSearch: boolean
): Promise<EditResult> => {
    try {
        const prompt = `Ты — опытный редактор-аналитик. Тебе предоставлена текущая сводка по результатам опроса, сами ответы для контекста и инструкция по редактированию.
        
        **Текущая сводка:**
        ${originalSummary}

        **Контекст (ответы пользователей):**
        ${JSON.stringify(contextualResponses)}

        **Инструкция по редактированию:**
        "${instruction}"

        Твоя задача — переписать сводку согласно инструкции. ${useSearch ? "Используй поиск Google для обогащения ответа актуальной информацией, если это релевантно (например, для сравнения с рыночными стандартами, поиска статистики и т.д.)." : ""}
        Верни только отредактированный текст сводки. Будь лаконичен и профессионален.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: useSearch ? [{ googleSearch: {} }] : [],
            },
        });

        const text = response.text;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        
        let sources: GroundingSource[] = [];
        if (groundingMetadata?.groundingChunks) {
            sources = groundingMetadata.groundingChunks
                .filter((chunk: GroundingChunk) => chunk.web)
                .map((chunk: GroundingChunk) => ({
                    uri: chunk.web.uri,
                    title: chunk.web.title || chunk.web.uri,
                }));
        }

        return { text, sources };

    } catch (error) {
        console.error("Error editing summary:", error);
        throw new Error("Не удалось отредактировать сводку. Попробуйте снова.");
    }
};