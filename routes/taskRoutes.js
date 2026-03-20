import express from 'express'
import Task from '../models/Task.js'

const router = express.Router()

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { employeeId, location, task, status, date } = req.body

    const createdTask = await Task.create({
      employeeId,
      location,
      task,
      status,
      date,
    })

    return res.status(201).json({ success: true, data: createdTask })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create task',
    })
  }
})

// GET /api/tasks (populate employee details)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('employeeId', '_id name')
      .sort({ createdAt: -1 })

    const formattedTasks = tasks.map((task) => ({
      _id: task._id,
      task: task.task,
      location: task.location,
      employeeId: task.employeeId ? task.employeeId._id : null,
      date: task.date,
      status: task.status,
    }))

    return res.json({ success: true, data: formattedTasks })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tasks',
    })
  }
})

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    return res.json({ success: true, data: updatedTask })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update task',
    })
  }
})

// PUT /api/tasks/:id/status (mark completed)
router.put('/:id/status', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    )

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' })
    }

    return res.json(updatedTask)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id)

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    return res.json({ success: true, data: deletedTask })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete task',
    })
  }
})

export default router

