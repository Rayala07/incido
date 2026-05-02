import express from "express";
import { verifyUser, verifyAdmin } from "../middlewares/verifyuser.js";
import {
  createProject,
  getProjects,
  addMembersToProject,
} from "../controllers/project.controller.js";

const projectRoutes = express.Router();

projectRoutes.post("/create", verifyUser, verifyAdmin, createProject);
projectRoutes.get("/getprojects", verifyUser, getProjects);
projectRoutes.post(
  "/add-members",
  verifyUser,
  verifyAdmin,
  addMembersToProject,
);

export default projectRoutes;
