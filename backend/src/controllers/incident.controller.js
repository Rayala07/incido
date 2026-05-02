import Incident from "../models/incident.js"
import { getSeverity } from "../services/ai.service.js"

export const createIncident = async (req, res) => {
  try {
    const { title, description, severity } = req.body
    const { projectId } = req.params

    let finalSeverity = severity
    let severitySource = "manual"

    if (!severity) {
      finalSeverity = await getSeverity(description)
      severitySource = "ai"
    }

    const incident = await Incident.create({
      title,
      description,
      projectId,
      severity: finalSeverity,
      severitySource,
    })

    res.status(201).json(incident)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Something went wrong" })
  }
}
