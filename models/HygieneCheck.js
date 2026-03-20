const mongoose = require('mongoose')

const hygieneCheckSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  gloves: {
    type: Boolean,
    default: false,
  },
  headCap: {
    type: Boolean,
    default: false,
  },
  mask: {
    type: Boolean,
    default: false,
  },
  nails: {
    type: Boolean,
    default: false,
  },
  uniform: {
    type: Boolean,
    default: false,
  },
  sanitized: {
    type: Boolean,
    default: false,
  },
  shoes: {
    type: Boolean,
    default: false,
  },
  jewelry: {
    type: Boolean,
    default: false,
  },
  hairCover: {
    type: Boolean,
    default: false,
  },
  idCard: {
    type: Boolean,
    default: false,
  },
  apron: {
    type: Boolean,
    default: false,
  },
  workstation: {
    type: Boolean,
    default: false,
  },
  handWash: {
    type: Boolean,
    default: false,
  },
  foodSafety: {
    type: Boolean,
    default: false,
  },
  posture: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pass', 'warning'],
    default: 'pass',
  },
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('HygieneCheck', hygieneCheckSchema)

