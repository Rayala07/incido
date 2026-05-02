import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"
import { config } from "../config/config.js"
dotenv.config()

const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
})

export async function getSeverity(description) {
  const prompt = `
Classify severity as one of: low, medium, high.

Incident: "${description}"

Answer only: low, medium, or high.
`

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  })

  const result = response.text.trim().toLowerCase()

  if (!["low", "medium", "high"].includes(result)) {
    return "medium"
  }

  return result
}

export async function generatePostmortem(description) {
  const prompt = `
Write a professional incident postmortem using only the information in the incident description.

Goals:
- Produce a clear root-cause analysis, not a generic summary.
- Keep the language concise, factual, and useful for engineering and leadership.
- Do not invent details that are not supported by the description.
- If a detail is unknown, say so explicitly.
- Include practical prevention steps and realistic follow-up items.

Return JSON only in this exact shape:
{
  "whatHappened": "2-4 sentences describing the incident symptoms, scope, and impact.",
  "whyItHappened": "A root-cause analysis explaining the direct cause and any contributing factors.",
  "howItWasFixed": "The immediate remediation steps taken to restore service or resolve the issue.",
  "prevention": "Specific actions that would reduce the chance of this happening again.",
  "actionItems": [
    { "task": "Concrete follow-up task", "owner": "Relevant team or role, or Unassigned if unknown" }
  ]
}

Rules for actionItems:
- Return 1 to 3 items.
- Keep tasks actionable and specific.
- Use role-based owners when a named owner is not known.

Incident description:
${description}
`

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  })

  const rawText = response.text.trim()
  const cleanedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")

  const parsed = JSON.parse(cleanedText)

  return {
    whatHappened: parsed.whatHappened || "",
    whyItHappened: parsed.whyItHappened || "",
    howItWasFixed: parsed.howItWasFixed || "",
    prevention: parsed.prevention || "",
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
  }
}
