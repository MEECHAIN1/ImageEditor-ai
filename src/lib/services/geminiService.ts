
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageFile } from '../../../types';

const POST_KEY_SELECTION_ERROR_MESSAGE = "API_KEY_UNAVAILABLE_POST_SELECTION";

/**
 * Ensures an API key is selected via the aistudio helper if available.
 * Creates a new GoogleGenAI instance to use the most up-to-date key.
 */
async function getAiClient() {
  if (window.aistudio) {
    if (!(await window.aistudio.hasSelectedApiKey())) {
      try {
        await window.aistudio.openSelectKey();
        if (!process.env.API_KEY) {
            throw new Error(POST_KEY_SELECTION_ERROR_MESSAGE);
        }
      } catch (e: any) {
        if (e.message === POST_KEY_SELECTION_ERROR_MESSAGE) {
            throw e;
        }
        throw new Error("An API key from your user settings must be selected to use AI features.");
      }
    }
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please select a key in your user settings.");
  }

  return new GoogleGenAI({ apiKey });
}

function handleGeminiError(error: unknown): never {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message === POST_KEY_SELECTION_ERROR_MESSAGE) {
            throw new Error("Your API key could not be confirmed after selection. This can happen due to a delay. Please try your action again.");
        }

        if (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found")) {
             if (window.aistudio && typeof (window.aistudio as any).resetSelectedApiKey === 'function') {
                (window.aistudio as any).resetSelectedApiKey();
             }
             throw new Error("The selected API key is not valid. Please try again; you may be prompted to select a different key.");
        }
        
        let errorMessage = error.message;
        try {
            const jsonMatch = errorMessage.match(/{.*}/);
            if (jsonMatch) {
                 const errorObj = JSON.parse(jsonMatch[0]);
                 errorMessage = errorObj?.error?.message || errorMessage;
            }
        } catch (e) { }

        throw new Error(`Gemini API Error: ${errorMessage}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
}

export async function editImage(
  imageFile: ImageFile,
  prompt: string,
  imageSize: '1K' | '2K' | '4K' = '1K'
): Promise<string> {
  try {
    const ai = await getAiClient();
    
    // According to instructions: Upgrade to gemini-3-pro-image-preview if user requests high-quality (2K or 4K)
    const modelName = (imageSize === '2K' || imageSize === '4K') 
      ? 'gemini-3-pro-image-preview' 
      : 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageFile.base64,
              mimeType: imageFile.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // imageConfig is only supported for gemini-3-pro-image-preview and gemini-2.5-flash-image
        imageConfig: {
          imageSize: imageSize,
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data found in the response from Gemini.");

  } catch (error) {
    handleGeminiError(error);
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data found in the response from Gemini.");
  } catch (error) {
    handleGeminiError(error);
  }
}

export async function analyzeMeeBotMood(prompt: string): Promise<{ mood: string; message: string }> {
  const fullPrompt = `You are a MeeBot mood analyzer. Your task is to analyze a user's prompt for creating a MeeBot.
1.  Determine its primary mood. The mood must be a single English word (e.g., joyful, adventurous, mysterious, calm).
2.  Write a short, creative message in Thai from the MeeBot's perspective that reflects the prompt.

Your entire response MUST strictly follow this format, with no extra text:
Mood: [The mood you determined]
Message: [The Thai message you wrote]

---
Analyze this MeeBot prompt: "${prompt}"`;

  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
    });

    const rawText = response.text.trim();
    const moodMatch = rawText.match(/Mood:\s*(.*)/);
    const messageMatch = rawText.match(/Message:\s*(.*)/);

    const mood = moodMatch?.[1]?.trim();
    const message = messageMatch?.[1]?.trim();

    if (mood && message) {
      return { mood, message };
    } else {
      throw new Error(`Invalid response format from Gemini. Could not parse mood or message.`);
    }

  } catch (error) {
    handleGeminiError(error);
  }
}

export async function generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    
    throw new Error("No audio data found in the response from Gemini TTS.");

  } catch (error) {
    handleGeminiError(error);
  }
}
