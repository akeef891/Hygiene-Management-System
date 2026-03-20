import express from "express"
import Employee from "../models/Employee.js"
import Task from "../models/Task.js"
import Inspection from "../models/Inspection.js"

const router = express.Router()

/* DASHBOARD STATS */

router.get("/stats", async (req, res) => {
 try {

  const totalEmployees = await Employee.countDocuments()

  const pendingTasks = await Task.countDocuments({
   status: "Pending"
  })

  const completedTasks = await Task.countDocuments({
   status: "Completed"
  })

  const today = new Date()
  today.setHours(0,0,0,0)

  const inspectionsToday = await Inspection.countDocuments({
   date: { $gte: today }
  })

  const inspections = await Inspection.find()

  let totalScore = 0

  inspections.forEach(i=>{
   totalScore += i.score
  })

  const averageScore =
   inspections.length > 0
   ? totalScore / inspections.length
   : 0

  res.json({
   totalEmployees,
   pendingTasks,
   completedTasks,
   inspectionsToday,
   averageScore
  })

 } catch (err) {

  res.status(500).json({ message: err.message })

 }
})


/* HYGIENE RISK ALERT */

router.get("/hygiene-alert", async (req, res) => {

 try {

  const inspections = await Inspection.find()

  let riskCount = 0

  inspections.forEach(i => {

   const percentage = (i.score / 12) * 100

   if (percentage < 60) {
    riskCount++
   }

  })

  res.json({
   riskEmployees: riskCount
  })

 } catch (err) {

  res.status(500).json({ message: err.message })

 }

})
export default router