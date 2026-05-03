import incidentModel from "../models/incident.model.js";
import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import timelineModel from "../models/timeline.model.js";

const VALID_TIMELINE_TYPES = [
  "comment",
  "status_change",
  "member_assigned",
  "severity_changed",
  "attachment_added",
  "action_item_created",
];

const isIncidentAuthorized = async (user, incident) => {
  if (!incident) return false;

  if (user.role === "admin") return true;

  const userIdString = user.id.toString();
  const isDirectlyInvolved =
    incident.createdBy?.toString() === userIdString ||
    incident.leader?.toString() === userIdString ||
    incident.members.some((member) => member.toString() === userIdString);

  if (incident.isPublic || isDirectlyInvolved) return true;

  const project = await projectModel
    .findById(incident.projectId)
    .select("members");
  if (!project) return false;

  return project.members.some(
    (member) => member.user.toString() === userIdString,
  );
};

export const createTimelineEntry = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;
    const {
      type = "comment",
      message,
      oldValue,
      newValue,
      affectedUser,
      attachments,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Incident ID is required",
      });
    }

    if (!message || !message.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Timeline message is required",
      });
    }

    if (!VALID_TIMELINE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Timeline type must be one of: ${VALID_TIMELINE_TYPES.join(", ")}`,
      });
    }

    const incident = await incidentModel.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const authorized = await isIncidentAuthorized(req.user, incident);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to add timeline entries for this incident",
      });
    }

    let affectedUserId = null;
    if (affectedUser) {
      const userRecord = await userModel.findById(affectedUser);
      if (!userRecord) {
        return res.status(400).json({
          success: false,
          message: "Affected user not found",
        });
      }
      affectedUserId = userRecord._id;
    }

    const normalizedAttachments = Array.isArray(attachments)
      ? attachments
          .filter(
            (attachment) =>
              attachment &&
              typeof attachment.name === "string" &&
              typeof attachment.url === "string",
          )
          .map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            uploadedAt: attachment.uploadedAt
              ? new Date(attachment.uploadedAt)
              : undefined,
          }))
      : [];

    const timelineEntry = await timelineModel.create({
      incidentId: id,
      createdBy: userId,
      type,
      message: message.toString().trim(),
      oldValue: oldValue ? oldValue.toString() : undefined,
      newValue: newValue ? newValue.toString() : undefined,
      affectedUser: affectedUserId,
      attachments: normalizedAttachments,
    });

    const populatedEntry = await timelineModel
      .findById(timelineEntry._id)
      .populate("createdBy", "username email")
      .populate("affectedUser", "username email");

    return res.status(201).json({
      success: true,
      message: "Timeline entry created",
      timeline: populatedEntry,
    });
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTimelineForIncident = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Incident ID is required",
      });
    }

    const incident = await incidentModel.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const authorized = await isIncidentAuthorized(req.user, incident);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this incident timeline",
      });
    }

    const timelineEntries = await timelineModel
      .find({ incidentId: id })
      .sort({ createdAt: 1 })
      .populate("createdBy", "username email")
      .populate("affectedUser", "username email");

    return res.status(200).json({
      success: true,
      count: timelineEntries.length,
      timeline: timelineEntries,
    });
  } catch (error) {
    console.error("Error fetching incident timeline:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
