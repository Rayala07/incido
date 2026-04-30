import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },

  description: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
},
{ timestamps: true }
);

const projectModel = mongoose.model('project', projectSchema);

export default projectModel;