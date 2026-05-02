import express from "express";
import { verifyUser, verifyAdmin } from "../middlewares/verifyuser.js";
import {
  createIncident,
  getIncident,
  getAllIncidents,
} from "../controllers/incident.controller.js";

const incidentRoutes = express.Router();

incidentRoutes.post("/create", verifyUser, verifyAdmin, createIncident);
incidentRoutes.get("/allincidents", verifyUser, getAllIncidents);
incidentRoutes.get("/:id", verifyUser, getIncident);

export default incidentRoutes;
