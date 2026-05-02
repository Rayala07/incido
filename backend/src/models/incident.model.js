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
    ref: "user",
  },

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],

  status: {
    type: String,
    enum: ["open", "progress", "resolved"],
    default: "open",
  },

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

const incidentModel = mongoose.model("incident", incidentSchema);

export default incidentModel;