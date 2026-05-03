import express from "express"
import { verifyUser } from "../middlewares/verifyuser.js"
import {
  createIncident,
  getRagStatus,
  searchSimilarIncidents,
  getIncident,
  getAllIncidents,
  closeIncident,
  assignMembers,
  updateIncident,
  deleteIncident,
} from "../controllers/incident.controller.js"
import {
  createTimelineEntry,
  getTimelineForIncident,
} from "../controllers/timeline.controller.js"
import {
  incidentValidator,
  assignMembersValidator,
  updateIncidentValidator,
} from "../validation/validate.js"

const incidentRoutes = express.Router()

incidentRoutes.post("/create", verifyUser, incidentValidator, createIncident)
incidentRoutes.get("/allincidents", verifyUser, getAllIncidents)
incidentRoutes.get("/search", verifyUser, searchSimilarIncidents)
incidentRoutes.get("/rag/status", verifyUser, getRagStatus)
incidentRoutes.get("/:id", verifyUser, getIncident)
incidentRoutes.patch("/:id/close", verifyUser, closeIncident)
incidentRoutes.patch("/:id/assign-members", verifyUser, assignMembersValidator, assignMembers)
incidentRoutes.patch("/:id", verifyUser, updateIncidentValidator, updateIncident)

incidentRoutes.post("/:id/timeline", verifyUser, createTimelineEntry)
incidentRoutes.get("/:id/timeline", verifyUser, getTimelineForIncident)

incidentRoutes.delete("/:id", verifyUser, deleteIncident)

export default incidentRoutes

