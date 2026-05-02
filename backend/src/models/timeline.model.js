import mongoose from "mongoose"

const timelineSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "incident",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "comment",
        "status_change",
        "member_assigned",
        "severity_changed",
        "attachment_added",
        "action_item_created",
      ],
      default: "comment",
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // For tracking state changes (e.g., status_change: open -> in-progress)
    oldValue: {
      type: String,
      default: null,
    },

    newValue: {
      type: String,
      default: null,
    },

    // Optional: link to affected user (e.g., member_assigned)
    affectedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    // Optional: attachments or evidence
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

const timelineModel = mongoose.model("timeline", timelineSchema)

export default timelineModel
