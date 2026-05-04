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

export const getAllProjects = async (req, res) => {
  try {
    const { id, role } = req.user;

    // Filter: Admins see everything. Others see only projects they belong to.
    let query = {};
    if (role !== "admin") {
      query = { "members.user": id };
    }

    const projects = await projectModel
      .find(query)
      .populate("createdBy", "username email profile")
      .populate("members.user", "username email profile")
      .sort({ createdAt: -1 });

    const projectsObj = projects.map(p => {
      const obj = p.toObject();
      if (obj.members) {
        obj.members = obj.members.filter(m => m.user != null);
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: projectsObj.length,
      projects: projectsObj,
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

    // 🧹 Remove duplicates (keep last occurrence by email)
    const uniqueMembers = [
      ...new Map(members.map((m) => [m.email?.toLowerCase(), m])).values(),
    ];

    // ✅ Validate roles
    for (let member of uniqueMembers) {
      if (!member.email) {
        return res.status(400).json({
          success: false,
          message: "Each member must have a valid email",
        });
      }

      if (!member.role || !["leader", "member"].includes(member.role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'leader' or 'member'",
        });
      }
    }

    // 👤 Check users exist by email efficiently (Indexing)
    const emails = uniqueMembers.map((m) => m.email.toLowerCase());

    const existingUsers = await userModel.find({
      email: { $in: emails },
    });

    const existingEmails = existingUsers.map((u) => u.email.toLowerCase());

    const invalidEmails = emails.filter((e) => !existingEmails.includes(e));

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `These emails do not exist in the system: ${invalidEmails.join(", ")}`,
      });
    }

    // 🛑 Block Admins from being assigned
    const adminUsers = existingUsers.filter((u) => u.role === "admin");
    if (adminUsers.length > 0) {
      const adminEmails = adminUsers.map((u) => u.email);
      return res.status(400).json({
        success: false,
        message: `Cannot assign system Admins to projects. Invalid emails: ${adminEmails.join(", ")}`,
      });
    }

    // Map emails to User IDs for further processing
    const userMapByEmail = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u._id.toString()]));
    
    const mappedMembers = uniqueMembers.map((m) => ({
      userId: userMapByEmail.get(m.email.toLowerCase()),
      role: m.role
    }));

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

    const incomingLeaders = mappedMembers.filter((m) => m.role === "leader");

    const filteredCurrentLeaders = currentLeaders.filter(
      (existing) =>
        !mappedMembers.some((m) => m.userId === existing.user.toString()),
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

    for (let member of mappedMembers) {
      // skip self if needed (admins shouldn't be added anyway, but just in case)
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
      .populate("createdBy", "username email profile")
      .populate("members.user", "username email profile");

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

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await projectModel
      .findById(projectId)
      .populate("createdBy", "username email profile")
      .populate("members.user", "username email profile");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const projectObj = project.toObject();
    if (projectObj.members) {
      projectObj.members = projectObj.members.filter(m => m.user != null);
    }

    return res.status(200).json({
      success: true,
      project: projectObj,
    });
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update projects",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await projectModel
      .findById(projectId)
      .populate("createdBy", "username email profile")
      .populate("members.user", "username email profile");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (name && name.trim()) {
      const existingProject = await projectModel.findOne({
        name: name.trim(),
        _id: { $ne: projectId },
      });
      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: "Another project with the same name already exists",
        });
      }
      project.name = name.trim();
    }

    if (description) {
      project.description = description;
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { projectId } = req.params;

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete projects",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    /* Use findByIdAndDelete — project.remove() is deprecated in Mongoose 7+ */
    await projectModel.findByIdAndDelete(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Remove a single member from a project. Admin-only.
 * The userId is taken from the URL param, so no body parsing needed.
 * After removal the updated project is re-populated and returned so the
 * frontend can update its state without a separate GET call.
 */
export const removeProjectMember = async (req, res) => {
  try {
    const { role } = req.user;
    const { projectId, userId } = req.params;

    // Only admins may remove members
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can remove project members",
      });
    }

    // Validate both IDs before hitting the database
    if (
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project or user ID",
      });
    }

    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Find the member inside the embedded array
    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this project",
      });
    }

    // Remove the member in-place and persist
    project.members.splice(memberIndex, 1);
    await project.save();

    // Return the fully populated updated project
    const updatedProject = await projectModel
      .findById(projectId)
      .populate("createdBy", "username email profile")
      .populate("members.user", "username email profile");

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error removing project member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
