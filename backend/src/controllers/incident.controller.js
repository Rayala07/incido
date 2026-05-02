import Incident from "../models/incident.js"
import ActionItem from "../models/actionItem.js"
import IncidentDetails from "../models/incidentDetails.js"
import { getSeverity, generatePostmortem } from "../services/ai.service.js"

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

export const closeIncident = async (req, res) => {
  try {
    const { id, projectId } = req.params

    const incident = await Incident.findOne({ _id: id, projectId })

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" })
    }

    incident.status = "resolved"
    await incident.save()

    const aiData = await generatePostmortem(incident.description)

    const incidentDetails = await IncidentDetails.create({
      incidentId: incident._id,
      whatHappened: aiData.whatHappened,
      whyItHappened: aiData.whyItHappened,
      howItWasFixed: aiData.howItWasFixed,
      prevention: aiData.prevention,
      actionItems: aiData.actionItems,
    })

    const savedActionItems = Array.isArray(aiData.actionItems)
      ? await ActionItem.insertMany(
          aiData.actionItems.map((item) => ({
            incidentId: incident._id,
            incidentDetailsId: incidentDetails._id,
            task: item.task,
            owner: item.owner || "Unassigned",
            status: "open",
          })),
        )
      : []

    res.json({
      success: true,
      incident,
      incidentDetails,
      actionItems: savedActionItems,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to close incident" })
  }
}