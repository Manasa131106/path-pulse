import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzePulse(mood: string, stress: string, motivation: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following emotional state of a student:
    Mood: ${mood}
    Stress: ${stress}
    Motivation: ${motivation}

    Provide a response in JSON format with exactly three fields:
    1. analysis: A one-line emotional analysis.
    2. suggestion: A practical improvement suggestion.
    3. motivation: A short motivational sentence.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      analysis: "You're doing your best, and that's what matters.",
      suggestion: "Take a deep breath and focus on one small task.",
      motivation: "Every step forward is progress, no matter how small."
    };
  }
}
