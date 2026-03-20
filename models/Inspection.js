import mongoose from 'mongoose'

const inspectionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    date: {
      type: Date,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    nailsClean: Boolean,
    uniformProper: Boolean,
    gloves: Boolean,
    mask: Boolean,
    hairNet: Boolean,
    handWash: Boolean,
    shoesClean: Boolean,
    idCard: Boolean,
    apron: Boolean,
    hairTied: Boolean,
    noJewelry: Boolean,
    handsSanitized: Boolean,
  },
  { timestamps: true }
)

export default mongoose.model('Inspection', inspectionSchema)

