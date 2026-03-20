import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import employeeRoutes from "./routes/employeeRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import inspectionRoutes from "./routes/inspectionRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import dashboardRoutes from "./routes/dashboard.js"
console.log("EMAIL_USER:", process.env.EMAIL_USER)
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/employees", employeeRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/inspections", inspectionRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB connection error:", err))

app.get("/", (req, res) => {
    res.json({ message: "Hygiene Management API Running" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})