import express from 'express'
import Inspection from '../models/Inspection.js'

const router = express.Router()

// GET ALL INSPECTIONS
router.get('/', async (req, res) => {
  try {
    const inspections = await Inspection.find()
      .populate('employeeId')
      .sort({ createdAt: -1 })

    res.json(inspections)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// CREATE INSPECTION
router.post('/', async (req, res) => {
  try {
    const inspection = new Inspection(req.body)
    const savedInspection = await inspection.save()

    res.status(201).json(savedInspection)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// UPDATE INSPECTION
router.put('/:id', async (req, res) => {
  try {
    const updatedInspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!updatedInspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    res.json(updatedInspection)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE INSPECTION
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Inspection.findByIdAndDelete(req.params.id)

    if (!deleted) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    res.json({ message: 'Inspection deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

