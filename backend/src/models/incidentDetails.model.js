import mongoose from "mongoose"

const actionItemSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
  },
  status: {
    type: String,
    enum: ["open", "done"],
    default: "open",
  },
})

const incidentDetailsSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "incident",
      required: true,
    },

    whatHappened: String,
    whyItHappened: String,
    howItWasFixed: String,
    prevention: String,

    actionItems: [actionItemSchema],
  },
  { timestamps: true },
)

const incidentDetailsModel = mongoose.model(
  "incidentDetails",
  incidentDetailsSchema,
)

export default incidentDetailsModel
