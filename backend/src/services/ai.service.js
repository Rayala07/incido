import { GoogleGenAI } from "@google/genai"
import { config } from "../config/config.js"

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY })

// Fallback postmortem when API fails or is unavailable
const generatePostmortemFallback = (title, description) => {
  const trimmed = (description || "").trim()
  const whatHappened = `When '${title}', the following symptoms were observed: ${
    trimmed.length > 240 ? trimmed.slice(0, 240) + "..." : trimmed
  }`

  const whyItHappened = `Preliminary analysis suggests root causes related to configuration, resource limits, or recent deployments. Investigate logs, recent changes, and monitoring alerts.`

  const howItWasFixed = `The team rolled back the recent deployment and restarted the affected services. Monitoring returned to normal.`

  const prevention = `Add better deploy checks, increase resource limits, and add automated alerting for the failing service.`

  const sentences = trimmed
    .split(/[\.\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const actionItems = sentences.length
    ? sentences.map((s, i) => ({
        task: `Investigate: ${s}`,
        owner: null,
        status: "open",
      }))
    : [{ task: "Investigate root cause", owner: null, status: "open" }]

  return {
    whatHappened,
    whyItHappened,
    howItWasFixed,
    prevention,
    actionItems,
  }
}

// Generate postmortem using Gemini API with fallback
export const generatePostmortem = async (title, description) => {
  try {
    if (!config.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, using fallback postmortem")
      return generatePostmortemFallback(title, description)
    }

    const modelName = "gemini-3-flash-preview"

    const prompt = `You are an incident postmortem analyst. Given an incident title and description, generate a structured postmortem analysis.

Incident Title: ${title}
Incident Description: ${description}

Provide a JSON response with exactly this structure (no markdown, just raw JSON):
{
  "whatHappened": "Brief description of what occurred",
  "whyItHappened": "Root cause analysis",
  "howItWasFixed": "Steps taken to resolve",
  "prevention": "Preventive measures for future",
  "actionItems": [
    {"task": "Action item 1", "owner": null, "status": "open"},
    {"task": "Action item 2", "owner": null, "status": "open"}
  ]
}`

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    })
    const responseText = result.text || ""

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0]
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0]
    }

    const postmortem = JSON.parse(jsonStr.trim())

    // Validate structure
    if (
      !postmortem.whatHappened ||
      !postmortem.whyItHappened ||
      !postmortem.howItWasFixed ||
      !postmortem.prevention ||
      !Array.isArray(postmortem.actionItems)
    ) {
      throw new Error("Invalid postmortem structure from AI")
    }

    return postmortem
  } catch (error) {
    console.error("Error generating postmortem with Gemini:", error)
    return generatePostmortemFallback(title, description)
  }
}

// Determine incident severity using Gemini API with fallback
export const getSeverity = async (description) => {
  try {
    if (!config.GEMINI_API_KEY) {
      console.warn(
        "GEMINI_API_KEY not configured, using fallback severity detection",
      )
      return getSeverityFallback(description)
    }

    const modelName = "gemini-3-flash-preview"

    const prompt = `Analyze this incident description and classify its severity level.

Incident Description: ${description}

Respond with ONLY one word: 'critical', 'high', 'medium', or 'low'. No explanations.`

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    })
    const responseText = (result.text || "").toLowerCase().trim()

    const validSeverities = ["critical", "high", "medium", "low"]
    if (validSeverities.includes(responseText)) {
      return responseText
    }

    return getSeverityFallback(description)
  } catch (error) {
    console.error("Error determining severity with Gemini:", error)
    return getSeverityFallback(description)
  }
}

// Fallback severity detection using keyword heuristics
const getSeverityFallback = (description) => {
  const d = (description || "").toLowerCase()
  if (
    d.includes("data loss") ||
    d.includes("outage") ||
    d.includes("critical") ||
    d.includes("production down")
  ) {
    return "critical"
  }
  if (
    d.includes("error") ||
    d.includes("failure") ||
    d.includes("down") ||
    d.includes("unavailable")
  ) {
    return "high"
  }
  if (d.length < 50) {
    return "low"
  }
  return "medium"
}
