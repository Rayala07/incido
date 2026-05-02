import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function getSeverity(description) {
  const prompt = `
Classify severity as one of: low, medium, high.

Incident: "${description}"

Answer only: low, medium, or high.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  const result = response.text.trim().toLowerCase();

  if (!["low", "medium", "high"].includes(result)) {
    return "medium";
  }

  return result;
}