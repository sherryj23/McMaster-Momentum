import express from "express";
import { runA2LAgent } from "../agents/a2lAgent.js";
import { runEmailCalAgent } from "../agents/emailCalAgent.js";
import { runInterviewAgent } from "../agents/interviewAgent.js";
import { runPlannerAgent } from "../agents/plannerAgent.js";
import { fetchIcal } from "../lib/fetchIcal.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { a2lUrl, outlookUrl, extraTasks, emailData, calendarData } = req.body;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send("status", { agent: 1, label: "A2L agent running", status: "running" });
    const a2lDeadlines = a2lUrl ? await runA2LAgent(a2lUrl) : [];
    send("status", { agent: 1, label: "A2L agent done", status: "done", data: a2lDeadlines });

    send("status", { agent: 2, label: "Email + calendar agent running", status: "running" });
    let outlookEvents = [];
    if (outlookUrl) {
      try {
        const rawOutlook = await fetchIcal(outlookUrl);
        outlookEvents = rawOutlook;
      } catch (e) {
        console.error("Outlook fetch failed:", e.message);
      }
    }
    const emailCalData = await runEmailCalAgent(
      emailData || "No email data provided.",
      calendarData || "No calendar data provided.",
      outlookEvents
    );
    send("status", { agent: 2, label: "Email + calendar agent done", status: "done", data: emailCalData });

    send("status", { agent: 3, label: "Interview agent running", status: "running" });
    const extractedTasks = await runInterviewAgent(extraTasks || "");
    send("status", { agent: 3, label: "Interview agent done", status: "done", data: extractedTasks });

    send("status", { agent: 4, label: "Planner agent running", status: "running" });
    const dayPlan = await runPlannerAgent(a2lDeadlines, emailCalData, extractedTasks);
    send("status", { agent: 4, label: "Planner agent done", status: "done", data: dayPlan });

    send("complete", { dayPlan });
    res.end();
  } catch (error) {
    console.error("Agent pipeline error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;