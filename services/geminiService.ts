
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * وظيفة ذكية لحذف الخلفية:
 * ترسل الصورة إلى Gemini وتطلب منه استخراج الكائن الأساسي على خلفية بيضاء نقية، 
 * ثم نقوم برمجياً بتحويل اللون الأبيض إلى شفافية.
 */
export const removeBackgroundAI = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const prompt = "Please segment this image and return only the main object centered on a pure solid white background (#FFFFFF). Do not add any shadows or reflections. Return ONLY the image.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from AI");
  } catch (error) {
    console.error("AI Background Removal Error:", error);
    throw error;
  }
};
