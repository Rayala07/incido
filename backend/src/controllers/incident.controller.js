import incidentModel from "../models/incident.model.js";
import projectModel from "../models/project.model.js";

const VALID_SEVERITIES = ["low", "medium", "high", "critical"];

export const createIncident = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create incidents",
      });
    }

    const {
      title,
      description,
      severity,
      projectId,
      isPublic,
      affectedUsers,
      affectedServices,
    } = req.body;

    if (!title || !title.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Incident title is required",
      });
    }

    if (!description || !description.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Incident description is required",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: `Severity must be one of: ${VALID_SEVERITIES.join(", ")}`,
      });
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isProjectMember =
      project.createdBy?.toString() === userId ||
      project.members.some((member) => {
        if (member?.user) {
          return member.user.toString() === userId;
        }
        return member?.toString() === userId;
      });

    if (!isProjectMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    const projectLeader = project.members.find((member) => {
      if (member?.role) {
        return member.role === "leader";
      }
      return false;
    })?.user;

    const incident = await incidentModel.create({
      title: title.toString().trim(),
      description: description.toString().trim(),
      projectId,
      createdBy: userId,
      leader: projectLeader ? projectLeader : userId,
      members: [userId],
      severity: severity || "low",
      severitySource: "manual",
      isPublic: Boolean(isPublic),
      affectedUsers: affectedUsers || 0,
      affectedServices: Array.isArray(affectedServices) ? affectedServices : [],
    });

    return res.status(201).json({
      success: true,
      message: "Incident created successfully",
      incident,
    });
  } catch (error) {
    console.error("Error creating incident:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getIncident = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Incident ID is required",
      });
    }

    const incident = await incidentModel
      .findById(id)
      .populate("projectId", "name description")
      .populate("createdBy", "username email")
      .populate("leader", "username email")
      .populate("members", "username email");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const userIdString = userId.toString();
    const isAuthorized =
      incident.isPublic ||
      incident.createdBy?.toString() === userIdString ||
      incident.leader?.toString() === userIdString ||
      incident.members.some((member) => member.toString() === userIdString);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this incident",
      });
    }

    return res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error("Error fetching incident:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllIncidents = async (req, res) => {
  try {
    const { id: userId } = req.user;

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
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
