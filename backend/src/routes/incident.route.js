import express from "express";
import Incident from "../models/incident.js";
import { getSeverity } from "../services/ai.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, description, projectId, severity } = req.body;

    let finalSeverity = severity;
    let severitySource = "manual";

    if (!severity) {
      finalSeverity = await getSeverity(description);
      severitySource = "ai";
    }

    const incident = await Incident.create({
      title,
      description,
      projectId,
      severity: finalSeverity,
      severitySource,
    });

    res.json(incident);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;