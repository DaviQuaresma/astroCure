import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import profileRoutes from "./routes/profile.js"
import schedulerRoutes from "./routes/scheduler.js"
import videoRoutes from "./routes/video.js"
import usersRoutes from "./routes/users.js"
import authRoutes from "./routes/authRoutes.js"
import agentRoutes from "./routes/agent.js"

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // ou: "http://localhost:3000"
  credentials: true,
}))

app.use(express.json())

app.use("/api", profileRoutes)
app.use("/api", schedulerRoutes)
app.use("/api", videoRoutes)
app.use("/api", usersRoutes)
app.use('/api/auth', authRoutes);
app.use('/api', agentRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("API Middleware online")
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Middleware rodando na porta ${PORT}`)
})
