import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageFile } from '../../../types';

const POST_KEY_SELECTION_ERROR_MESSAGE = "API_KEY_UNAVAILABLE_POST_SELECTION";

/**
 * Ensures an API key is selected via the aistudio helper if available.
 * Creates a new GoogleGenAI instance to use the most up-to-date key.
 */
async function getAiClient() {
  // In the AI Studio environment, we must check for and potentially prompt for an API key.
  if (window.aistudio) {
    if (!(await window.aistudio.hasSelectedApiKey())) {
      try {
        // Prompt the user to select a key.
        await window.aistudio.openSelectKey();
        // After user interaction, check for the key. If it's not there, it's a specific race condition/environment issue.
        if (!process.env.API_KEY) {
            throw new Error(POST_KEY_SELECTION_ERROR_MESSAGE);
        }
      } catch (e: any) {
        // If it's our specific error, re-throw it to be handled by handleGeminiError.
        if (e.message === POST_KEY_SELECTION_ERROR_MESSAGE) {
            throw e;
        }
        // Otherwise, assume the user cancelled the dialog.
        throw new Error("An API key from your user settings must be selected to use AI features.");
      }
    }
  }

  // After the selection process (if any), we must have an API key.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This case now primarily handles when a key was never selected in the first place.
    throw new Error("Gemini API Key is missing. Please select a key in your user settings.");
  }

  // Initialize the client right before the API call to ensure it uses the most up-to-date API key.
  return new GoogleGenAI({ apiKey });
}

// A generic error handler for Gemini API calls
function handleGeminiError(error: unknown): never {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Handle the specific case where the key is not available immediately after selection.
        if (error.message === POST_KEY_SELECTION_ERROR_MESSAGE) {
            throw new Error("Your API key could not be confirmed after selection. This can happen due to a delay. Please try your action again.");
        }

        // This specific message indicates the key is likely invalid or has been revoked.
        if (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found")) {
             // Reset the key selection state to re-prompt the user on the next attempt.
             if (window.aistudio && typeof (window.aistudio as any).resetSelectedApiKey === 'function') {
                (window.aistudio as any).resetSelectedApiKey();
             }
             throw new Error("The selected API key is not valid. Please try again; you may be prompted to select a different key.");
        }
        
        // This is a defensive approach in case the error is a stringified JSON object.
        let errorMessage = error.message;
        try {
            // Attempt to find a JSON object within the error string and parse its message.
            const jsonMatch = errorMessage.match(/{.*}/);
            if (jsonMatch) {
                 const errorObj = JSON.parse(jsonMatch[0]);
                 errorMessage = errorObj?.error?.message || errorMessage;
            }
        } catch (e) { /* Ignore if parsing fails, use the original message */ }

        throw new Error(`Gemini API Error: ${errorMessage}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
}


export async function editImage(
  imageFile: ImageFile,
  prompt: string
): Promise<string> {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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
        return part.inlineData.data; // This is base64 string
      }
    }
    throw new Error("No image data found in the response from Gemini.");
  } catch (error) {
    handleGeminiError(error);
  }
}

/**
 * Analyzes a MeeBot prompt to determine its mood and generate a message.
 * Simulates the logic of a server-side Genkit flow on the client.
 * @param prompt The user's text prompt for designing a MeeBot.
 * @returns A promise that resolves to an object with `mood` and `message`.
 */
export async function analyzeMeeBotMood(prompt: string): Promise<{ mood: string; message: string }> {
  // Combine system instruction and user prompt into one.
  // Ask for a simple, parsable format instead of JSON to avoid beta endpoints.
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
    // Make the simplest possible API call, with no extra config.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const rawText = response.text.trim();
    
    // Use regex to parse the response, making it robust to extra whitespace.
    const moodMatch = rawText.match(/Mood:\s*(.*)/);
    const messageMatch = rawText.match(/Message:\s*(.*)/);

    const mood = moodMatch?.[1]?.trim();
    const message = messageMatch?.[1]?.trim();

    if (mood && message) {
      return { mood, message };
    } else {
      throw new Error(`Invalid response format from Gemini. Could not parse mood or message. Raw response: "${rawText}"`);
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