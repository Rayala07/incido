import express from "express";
import { verifyUser, verifyAdmin } from "../middlewares/verifyuser.js";
import {
  createProject,
  addMembersToProject,
  getAllProjects,
  getProjectById,
  deleteProject,
} from "../controllers/project.controller.js";

const projectRoutes = express.Router();

projectRoutes.post("/create", verifyUser, verifyAdmin, createProject);
projectRoutes.get("/getprojects", verifyUser, getAllProjects);
projectRoutes.get("/:projectId", verifyUser, getProjectById);
projectRoutes.delete("/:projectId", verifyUser, verifyAdmin, deleteProject);
projectRoutes.post(
  "/add-members",
  verifyUser,
  verifyAdmin,
  addMembersToProject,
);

export default projectRoutes;
