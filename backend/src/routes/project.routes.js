import express from "express"
import { verifyUser, verifyAdmin } from "../middlewares/verifyuser.js"
import {
  createProject,
  addMembersToProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  removeProjectMember,
} from "../controllers/project.controller.js"
import {
  projectValidator,
  updateProjectValidator,
  addProjectMembersValidator,
} from "../validation/validate.js"

const projectRoutes = express.Router()

/* ── Specific routes first (always before the /:projectId wildcard) ── */

/* Create a new project (Admin only) */
projectRoutes.post("/create", verifyUser, verifyAdmin, projectValidator, createProject)

/* List all projects visible to the current user */
projectRoutes.get("/getprojects", verifyUser, getAllProjects)

/* Add or update members on a project (Admin only) */
projectRoutes.post("/add-members", verifyUser, verifyAdmin, addProjectMembersValidator, addMembersToProject)

/* ── Parameterised routes — member sub-resource before project wildcard ── */

/* Remove a single member from a project (Admin only) */
projectRoutes.delete("/:projectId/members/:userId", verifyUser, verifyAdmin, removeProjectMember)

/* ── Project CRUD by ID ─────────────────────────────────────────────── */

/* Get a single project by ID */
projectRoutes.get("/:projectId", verifyUser, getProjectById)

/* Update a project's name / description (Admin only) */
projectRoutes.put("/:projectId", verifyUser, verifyAdmin, updateProjectValidator, updateProject)

/* Delete a project permanently (Admin only) */
projectRoutes.delete("/:projectId", verifyUser, verifyAdmin, deleteProject)

export default projectRoutes
