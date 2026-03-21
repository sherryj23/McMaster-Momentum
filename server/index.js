import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import icalRouter from "./routes/ical.js";
import agentsRouter from "./routes/agents.js";
 
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 3001;
 
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
 
app.use("/api/ical", icalRouter);
app.use("/api/agents", agentsRouter);
 
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Day planner server running" });
});
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});