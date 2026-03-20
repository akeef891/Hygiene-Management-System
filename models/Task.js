import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Task', taskSchema)

