import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
{
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "incident",
  },

  message: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
},
{ timestamps: true }
);

const timelineModel = mongoose.model("timeline", timelineSchema);

export default timelineModel;