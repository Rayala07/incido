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
      required: true,
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    severitySource: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    // Time tracking
    startedAt: Date,
    resolvedAt: Date,

    // Impact
    affectedUsers: Number,
    affectedServices: [String],

    // AI fields
    aiSummary: String,
    aiSuggestions: [String],
  },
  { timestamps: true },
);

// Indexes
incidentSchema.index({ status: 1 });
incidentSchema.index({ projectId: 1 });

const incidentModel = mongoose.model("incident", incidentSchema);

export default incidentModel;
