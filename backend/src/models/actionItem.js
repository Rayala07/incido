import mongoose from "mongoose"

const actionItemSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "incident",
      required: true,
    },
    incidentDetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "incidentDetails",
    },
    task: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      default: "Unassigned",
    },
    status: {
      type: String,
      enum: ["open", "done"],
      default: "open",
    },
  },
  { timestamps: true },
)

const actionItemModel = mongoose.model("actionItem", actionItemSchema)

export default actionItemModel
