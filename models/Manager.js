import mongoose from 'mongoose'

const managerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpire: Date,
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Manager', managerSchema)

