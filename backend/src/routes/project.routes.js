import express from "express"
import { verifyUser, verifyAdmin } from "../middlewares/verifyuser.js"
import {
  createProject,
  addMembersToProject,
  getAllProjects,
  getProjectById,
} from "../controllers/project.controller.js"
import {
  projectValidator,
  addProjectMembersValidator,
} from "../validation/validate.js"

const projectRoutes = express.Router()

projectRoutes.post(
  "/create",
  verifyUser,
  verifyAdmin,
  projectValidator,
  createProject,
)
projectRoutes.get("/getprojects", verifyUser, getAllProjects)
projectRoutes.get("/:projectId", verifyUser, getProjectById)
projectRoutes.post(
  "/add-members",
  verifyUser,
  verifyAdmin,
  addProjectMembersValidator,
  addMembersToProject,
)

export default projectRoutes
