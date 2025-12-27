// functions/gemini.ts (ตัวอย่างสำหรับ Netlify/Vercel)
import { GoogleGenAI, Modality } from "@google/genai";

export const handler = async (event) => {
  // ดึง API Key จากเซิร์ฟเวอร์ (ปลอดภัย 100% ผู้ใช้มองไม่เห็น)
  const apiKey = process.env.VITE_GEMINI_API_KEY; 
  const ai = new GoogleGenAI({ apiKey });
  const { action, prompt, imageFile } = JSON.parse(event.body);

  try {
    let result;
    const model = ai.models.get('gemini-2.5-flash-image');

    if (action === 'generateImage') {
      const response = await model.generateContent({
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
      });
      result = response.candidates[0].content.parts[0].inlineData.data;
    }
    
    // ... เพิ่ม action อื่นๆ เช่น analyzeMood หรือ generateSpeech ...

    return { statusCode: 200, body: JSON.stringify({ result }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};