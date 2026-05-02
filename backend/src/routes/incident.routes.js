import express from "express"
import { incidentValidator } from "../validation/validate.js"
import { createIncident } from "../controllers/incident.controller.js"

const incidentRouter = express.Router()

incidentRouter.post("/:projectId", incidentValidator, createIncident)

export default incidentRouter
