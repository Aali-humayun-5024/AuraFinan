// AuraFinance OS — Universal Gemini Client Service
import { GoogleGenAI } from '@google/genai';
import { getActiveGeminiKey } from './geminiKeyConfig';

// Initialize SDK with pre-configured system key
const apiKey = getActiveGeminiKey();
export const aiClient = new GoogleGenAI({ apiKey });

/**
 * Universal Wrapper for Gemini Calls
 * Ensures visitors get uninterrupted zero-configuration AI processing
 */
export async function executeGeminiRequest(prompt: string, model = 'gemini-2.0-flash'): Promise<string> {
  try {
    const response = await aiClient.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error('Gemini execution error:', error);
    throw error;
  }
}
