import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";

export const createProject = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create projects",
      });
    }

    const existingProject = await projectModel.findOne({
      name: name.trim(),
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "Project already exists",
      });
    }

    const newProject = await projectModel.create({
      name: name.trim(),
      description,
      createdBy: id,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await projectModel
      .find()
      .populate("createdBy", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addMembersToProject = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { projectId, members } = req.body;

    // 🔐 Only admin allowed
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can add members to projects",
      });
    }

    // 🆔 Validate projectId
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required",
      });
    }

    // 📦 Validate members array
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members array is required and must not be empty",
      });
    }

    // 🧹 Remove duplicates (keep last occurrence)
    const uniqueMembers = [
      ...new Map(members.map((m) => [m.userId, m])).values(),
    ];

    // ✅ Validate each member
    for (let member of uniqueMembers) {
      if (!member.userId || !mongoose.Types.ObjectId.isValid(member.userId)) {
        return res.status(400).json({
          success: false,
          message: "Each member must have a valid userId",
        });
      }

      if (!member.role || !["leader", "member"].includes(member.role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'leader' or 'member'",
        });
      }

      // Optional rule (skip instead of blocking)
      if (member.userId === id) continue;
    }

    // 👤 Check users exist
    const userIds = uniqueMembers.map((m) => m.userId);

    const existingUsers = await userModel.find({
      _id: { $in: userIds },
    });

    const existingUserIds = existingUsers.map((u) => u._id.toString());

    const invalidUserIds = userIds.filter(
      (uid) => !existingUserIds.includes(uid),
    );

    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid user IDs: ${invalidUserIds.join(", ")}`,
      });
    }

    // 📁 Get project
    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // 👑 Leader validation (FIXED — no double count)
    const currentLeaders = project.members.filter((m) => m.role === "leader");

    const incomingLeaders = uniqueMembers.filter((m) => m.role === "leader");

    const filteredCurrentLeaders = currentLeaders.filter(
      (existing) =>
        !uniqueMembers.some((m) => m.userId === existing.user.toString()),
    );

    const leaderCount = filteredCurrentLeaders.length + incomingLeaders.length;

    if (leaderCount > 1) {
      return res.status(400).json({
        success: false,
        message: "Only one leader allowed per project",
      });
    }

    // 🔄 Add / Update members efficiently
    const memberMap = new Map(
      project.members.map((m) => [m.user.toString(), m]),
    );

    for (let member of uniqueMembers) {
      // skip self if needed
      if (member.userId === id) continue;

      if (!memberMap.has(member.userId)) {
        project.members.push({
          user: member.userId,
          role: member.role,
        });
      } else {
        memberMap.get(member.userId).role = member.role;
      }
    }

    // 💾 Save
    await project.save();

    // 🔄 Populate updated project
    const updatedProject = await projectModel
      .findById(projectId)
      .populate("createdBy", "name email")
      .populate("members.user", "name email");

    return res.status(200).json({
      success: true,
      message: "Members added to project successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error adding members to project:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
