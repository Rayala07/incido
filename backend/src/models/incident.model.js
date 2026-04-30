import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open",
  },

  // 🔥 Severity system
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },

  severitySource: {
    type: String,
    enum: ["ai", "manual"],
    default: "ai",
  },

},
{ timestamps: true }
);

const incidentModel = mongoose.model("Incident", incidentSchema);

export default incidentModel;