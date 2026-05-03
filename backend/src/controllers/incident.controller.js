import incidentModel from "../models/incident.model.js"
import projectModel from "../models/project.model.js"
import incidentDetailsModel from "../models/incidentDetails.model.js"
import userModel from "../models/user.model.js"
import { generatePostmortem, getSeverity } from "../services/ai.service.js"

const VALID_SEVERITIES = ["low", "medium", "high", "critical"]

// Role enforcement summary:
// - createIncident: admin OR project leader
// - closeIncident: incident leader only
// - assignMembers: incident leader OR admin

export const createIncident = async (req, res) => {
  try {
    const { id: userId, role } = req.user

    const {
      title,
      description,
      severity,
      projectId,
      isPublic,
      affectedUsers,
      affectedServices,
      responderEmails,   // optional — string[]
    } = req.body

    if (!title || !title.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Incident title is required",
      })
    }

    if (!description || !description.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Incident description is required",
      })
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      })
    }

    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: `Severity must be one of: ${VALID_SEVERITIES.join(", ")}`,
      })
    }

    const project = await projectModel.findById(projectId)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Allow either admin or the assigned project leader to create incidents
    const isLeader = project.members.some((member) => {
      return member?.user?.toString() === userId && member.role === "leader"
    })

    if (role !== "admin" && !isLeader) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins or the assigned project leader can create incidents",
      })
    }

    // Determine incident leader: if admin creates, prefer existing project leader, else set to creator
    const projectLeaderUserId = project.members
      .find((member) => member?.role === "leader")
      ?.user?.toString()
    const leaderToSet =
      role === "admin" ? projectLeaderUserId || userId : userId

    // ── Resolve responder emails → user ObjectIds ───────────────────────────
    // Only users who are actually project members can be responders.
    // The creator is always included (already the leader/member on the incident).
    let responderIds = []

    if (Array.isArray(responderEmails) && responderEmails.length > 0) {
      // Build a lookup of project member user-IDs for O(1) membership checks
      const projectMemberIdSet = new Set(
        project.members.map((m) => m.user.toString())
      )

      // Resolve emails in one batched query
      const resolvedUsers = await userModel
        .find({ email: { $in: responderEmails.map((e) => e.toLowerCase()) } })
        .select("_id email role")

      responderIds = resolvedUsers
        .filter(
          (u) =>
            u.role !== "admin" &&             // no admins
            projectMemberIdSet.has(u._id.toString()) // must be a project member
        )
        .map((u) => u._id.toString())
    }

    // Always seed members with the creator so they can see their own incident
    const seedMembers = [...new Set([userId, ...responderIds])]

    const aiResult = await generatePostmortem(
      title.toString().trim(),
      description.toString().trim(),
    )
    const inferredSeverity =
      severity || (await getSeverity(description.toString().trim()))

    const incident = await incidentModel.create({
      title: title.toString().trim(),
      description: description.toString().trim(),
      projectId,
      createdBy: userId,
      leader: leaderToSet,
      members: seedMembers,
      severity: inferredSeverity,
      severitySource: severity ? "manual" : "ai",
      isPublic: Boolean(isPublic),
      affectedUsers: affectedUsers || 0,
      affectedServices: Array.isArray(affectedServices) ? affectedServices : [],
      aiSummary: aiResult.whatHappened,
      aiSuggestions: Array.isArray(aiResult.actionItems)
        ? aiResult.actionItems.map((item) => item.task)
        : [],
    })

    return res.status(201).json({
      success: true,
      message: "Incident created successfully",
      incident,
    })
  } catch (error) {
    console.error("Error creating incident:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}


export const getIncident = async (req, res) => {
  try {
    const { id: userId } = req.user
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Incident ID is required",
      })
    }

    const incident = await incidentModel
      .findById(id)
      .populate("projectId", "name description")
      .populate("createdBy", "username email")
      .populate("leader", "username email")
      .populate("members", "username email")

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      })
    }

    const userIdString = userId.toString()
    const isAuthorized =
      incident.isPublic ||
      incident.createdBy?.toString() === userIdString ||
      incident.leader?.toString() === userIdString ||
      incident.members.some((member) => member.toString() === userIdString)

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this incident",
      })
    }

    return res.status(200).json({
      success: true,
      incident,
    })
  } catch (error) {
    console.error("Error fetching incident:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const getAllIncidents = async (req, res) => {
  try {
    const { id: userId } = req.user

    const incidents = await incidentModel
      .find({
        $or: [
          { createdBy: userId },
          { leader: userId },
          { members: userId },
          { isPublic: true },
        ],
      })
      .populate("projectId", "name description")
      .populate("createdBy", "username email")
      .populate("leader", "username email")
      .populate("members", "username email")
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    })
  } catch (error) {
    console.error("Error fetching incidents:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const closeIncident = async (req, res) => {
  try {
    const { id: userId } = req.user
    const { id } = req.params // incident id

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Incident ID is required" })
    }

    const incident = await incidentModel.findById(id)
    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" })
    }

    // Only incident leader can close
    if (!incident.leader || incident.leader.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the incident leader can close this incident",
      })
    }

    if (incident.status === "resolved") {
      return res
        .status(400)
        .json({ success: false, message: "Incident already resolved" })
    }

    // Mark resolved
    incident.status = "resolved"
    incident.resolvedAt = new Date()
    await incident.save()

    // Generate postmortem and persist incident details
    const aiResult = await generatePostmortem(
      incident.title,
      incident.description,
    )

    const incidentDetails = await incidentDetailsModel.create({
      incidentId: incident._id,
      whatHappened: aiResult.whatHappened,
      whyItHappened: aiResult.whyItHappened,
      howItWasFixed: aiResult.howItWasFixed,
      prevention: aiResult.prevention,
      actionItems: aiResult.actionItems,
    })

    return res
      .status(200)
      .json({ success: true, message: "Incident closed", incidentDetails })
  } catch (error) {
    console.error("Error closing incident:", error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" })
  }
}

export const assignMembers = async (req, res) => {
  try {
    const { id: userId, role } = req.user
    const { id } = req.params // incident id
    const { memberIds } = req.body // array of user IDs to add

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Incident ID is required" })
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Member IDs must be a non-empty array",
      })
    }

    const incident = await incidentModel.findById(id)
    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" })
    }

    // Only incident leader or admin can assign members
    const isLeader = incident.leader?.toString() === userId
    const isAdmin = role === "admin"

    if (!isLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the incident leader or admin can assign members",
      })
    }

    // Verify all member IDs exist
    const existingUsers = await userModel.find({ _id: { $in: memberIds } })
    if (existingUsers.length !== memberIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "Some user IDs do not exist" })
    }

    // Add members (avoid duplicates)
    const uniqueMembers = [
      ...new Set([...incident.members.map((m) => m.toString()), ...memberIds]),
    ]
    incident.members = uniqueMembers
    await incident.save()

    const updated = await incidentModel
      .findById(id)
      .populate("projectId", "name description")
      .populate("createdBy", "username email")
      .populate("leader", "username email")
      .populate("members", "username email")

    return res.status(200).json({
      success: true,
      message: "Members assigned to incident",
      incident: updated,
    })
  } catch (error) {
    console.error("Error assigning members:", error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" })
  }
}

export const updateIncident = async (req, res) => {
  try {
    const { id: userId, role } = req.user
    const { id } = req.params
    const {
      title,
      description,
      severity,
      status,
      isPublic,
      affectedUsers,
      affectedServices,
    } = req.body

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Incident ID is required" })
    }

    const incident = await incidentModel.findById(id)
    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" })
    }

    const isLeader = incident.leader?.toString() === userId
    const isAdmin = role === "admin"

    if (!isLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the incident leader or admin can update incidents",
      })
    }

    if (title) incident.title = title.toString().trim()
    if (description) incident.description = description.toString().trim()
    if (severity) {
      incident.severity = severity
      incident.severitySource = "manual"
    }
    if (status) incident.status = status
    if (typeof isPublic === "boolean") incident.isPublic = isPublic
    if (typeof affectedUsers === "number")
      incident.affectedUsers = affectedUsers
    if (Array.isArray(affectedServices))
      incident.affectedServices = affectedServices

    await incident.save()

    const updated = await incidentModel
      .findById(id)
      .populate("projectId", "name description")
      .populate("createdBy", "username email")
      .populate("leader", "username email")
      .populate("members", "username email")

    return res.status(200).json({
      success: true,
      message: "Incident updated successfully",
      incident: updated,
    })
  } catch (error) {
    console.error("Error updating incident:", error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" })
  }
}

export const deleteIncident = async (req, res) => {
  try {
    const { id: userId, role } = req.user
    const { id } = req.params

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Incident ID is required" })
    }

    const incident = await incidentModel.findById(id)
    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" })
    }

    const isLeader = incident.leader?.toString() === userId
    const isAdmin = role === "admin"

    if (!isLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the incident leader or admin can delete incidents",
      })
    }

    await incidentDetailsModel.deleteMany({ incidentId: incident._id })
    await incident.deleteOne()

    return res.status(200).json({
      success: true,
      message: "Incident deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting incident:", error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" })
  }
}
