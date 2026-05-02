import express from "express"
import {
  createIncident,
  closeIncident,
} from "../controllers/incident.controller.js"
import { incidentValidator } from "../validation/validate.js"

const incidentRouter = express.Router()

incidentRouter.post("/:projectId", incidentValidator, createIncident)
incidentRouter.patch("/:projectId/:id/close", closeIncident)

export default incidentRouter
