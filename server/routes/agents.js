import express from "express";
import { runA2LAgent } from "../agents/a2lAgent.js";
import { runEmailCalAgent } from "../agents/emailCalAgent.js";
import { runInterviewAgent } from "../agents/interviewAgent.js";
import { runPlannerAgent } from "../agents/plannerAgent.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { a2lUrl, extraTasks } = req.body;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Agent 1 — A2L
    send("status", { agent: 1, label: "Reading A2L deadlines", status: "running" });
    const a2lDeadlines = a2lUrl ? await runA2LAgent(a2lUrl) : [];
    send("status", { agent: 1, label: "Reading A2L deadlines", status: "done", data: a2lDeadlines });

    // Agent 2 — Gmail + Google Calendar via MCP
    send("status", { agent: 2, label: "Scanning email + calendar", status: "running" });
    const emailCalData = await runEmailCalAgent();
    send("status", { agent: 2, label: "Scanning email + calendar", status: "done", data: emailCalData });

    // Agent 3 — Interview / extra tasks
    send("status", { agent: 3, label: "Extracting extra tasks", status: "running" });
    const extractedTasks = await runInterviewAgent(extraTasks || "");
    send("status", { agent: 3, label: "Extracting extra tasks", status: "done", data: extractedTasks });

    // Agent 4 — Day planner
    send("status", { agent: 4, label: "Building your day plan", status: "running" });
    const dayPlan = await runPlannerAgent(a2lDeadlines, emailCalData, extractedTasks);
    send("status", { agent: 4, label: "Building your day plan", status: "done", data: dayPlan });

    send("complete", { dayPlan });
    res.end();
  } catch (error) {
    console.error("Agent pipeline error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;