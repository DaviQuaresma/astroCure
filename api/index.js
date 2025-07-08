import express from "express";
import dotenv from "dotenv";
import profileRoutes from "./routes/profile.js";
import schedulerRoutes from "./routes/scheduler.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", profileRoutes);
app.use("/api", schedulerRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("API Middleware online");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Middleware rodando na porta ${PORT}`);
});
