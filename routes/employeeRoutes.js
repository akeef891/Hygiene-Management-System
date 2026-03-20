import express from 'express'
import Employee from '../models/Employee.js'

const router = express.Router()

// POST /api/employees
router.post("/", async (req, res) => {
  try {
    const { name, department, status } = req.body

    const employee = new Employee({ name, department, status })
    const saved = await employee.save()

    return res.status(201).json(saved)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

// GET /api/employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 })
    return res.json(employees)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router

router.put("/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});