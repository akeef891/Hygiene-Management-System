import Employee from '../models/Employee.js'
import Task from '../models/Task.js'
import Inspection from '../models/Inspection.js'

export async function getDashboardStats(req, res) {
  try {
    const [totalEmployees, pendingTasks] = await Promise.all([
      Employee.countDocuments(),
      Task.countDocuments({ status: 'Pending' }),
    ])

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const inspectionsToday = await Inspection.countDocuments({
      date: { $gte: startOfToday },
    })

    const inspections = await Inspection.find({}, { score: 1 })

    let totalScore = 0
    inspections.forEach((i) => {
      totalScore += Number(i.score || 0)
    })

    const averageScore =
      inspections.length > 0 ? totalScore / inspections.length : 0

    return res.json({
      totalEmployees,
      pendingTasks,
      inspectionsToday,
      averageScore,
    })
  } catch (error) {
    console.error('Dashboard stats error', error)
    return res.status(500).json({ message: 'Failed to load dashboard stats' })
  }
}

