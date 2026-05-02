import express from "express"
import { verifyUser } from "../middlewares/verifyuser.js"
import {
  createIncident,
  getIncident,
  getAllIncidents,
  closeIncident,
  assignMembers,
} from "../controllers/incident.controller.js"
import {
  incidentValidator,
  assignMembersValidator,
} from "../validation/validate.js"

const incidentRoutes = express.Router()

incidentRoutes.post("/create", verifyUser, incidentValidator, createIncident)
incidentRoutes.get("/allincidents", verifyUser, getAllIncidents)
incidentRoutes.get("/:id", verifyUser, getIncident)
incidentRoutes.patch("/:id/close", verifyUser, closeIncident)
incidentRoutes.patch(
  "/:id/assign-members",
  verifyUser,
  assignMembersValidator,
  assignMembers,
)

export default incidentRoutes
