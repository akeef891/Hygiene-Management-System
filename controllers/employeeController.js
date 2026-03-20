const Employee = require('../models/Employee')

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Public (adjust later as needed)
const addEmployee = async (req, res) => {
  try {
    const { employeeId, name, department, phone, joiningDate, photo } = req.body

    const employee = await Employee.create({
      employeeId,
      name,
      department,
      phone,
      joiningDate,
      photo,
    })

    return res.status(201).json({
      success: true,
      data: employee,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create employee',
    })
  }
}

// @desc    Get all employees
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 })
    return res.json({
      success: true,
      data: employees,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
    })
  }
}

// @desc    Get single employee by MongoDB ID
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    return res.json({
      success: true,
      data: employee,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID',
    })
  }
}

// @desc    Update employee by ID
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { employeeId, name, department, phone, joiningDate, photo } = req.body

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { employeeId, name, department, phone, joiningDate, photo },
      { new: true, runValidators: true }
    )

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    return res.json({
      success: true,
      data: employee,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update employee',
    })
  }
}

// @desc    Delete employee by ID
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    return res.json({
      success: true,
      data: employee,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID',
    })
  }
}

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
}

