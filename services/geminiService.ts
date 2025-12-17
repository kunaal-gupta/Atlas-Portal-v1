
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export async function sendMessageToGemini(history: ChatMessage[], message: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Create a structured chat history
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  // Add the new message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: "You are the Mozaic Portal Assistant. You help real estate agents find resources, answer company policy questions, and provide market insights. Be professional, concise, and proactive. Use the Mozaic brand voice: polished, modern, and helpful.",
        thinkingConfig: {
          thinkingBudget: 32768 // Maximum thinking budget for complex agent queries
        }
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong. Please check your connection or API key.";
  }
}
