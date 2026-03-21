import express from "express";
import { runA2LAgent } from "../agents/a2lAgent.js";
import { runEmailCalAgent } from "../agents/emailCalAgent.js";
import { runInterviewAgent } from "../agents/interviewAgent.js";
import { runPlannerAgent } from "../agents/plannerAgent.js";
import { fetchIcal } from "../lib/fetchIcal.js";

const router = express.Router();

function isValidIcalUrl(url) {
  if (!url) return false;
  if (!url.startsWith("http")) return false;
  if (
    !url.includes("avenue.mcmaster.ca") &&
    !url.includes(".ics") &&
    !url.includes("calendar/feed") &&
    !url.includes("calendar/ical")
  ) return false;
  return true;
}

router.post("/run", async (req, res) => {
  const { a2lUrl, extraTasks } = req.body;

  if (!a2lUrl || !isValidIcalUrl(a2lUrl)) {
    return res.status(400).json({ error: "A valid A2L iCal URL is required." });
  }

  try {
    await fetchIcal(a2lUrl);
  } catch (err) {
    return res.status(400).json({ error: "Could not fetch your A2L iCal URL. Make sure it is correct and try again." });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send("status", { agent: 1, label: "Reading A2L deadlines", status: "running" });
    const a2lDeadlines = await runA2LAgent(a2lUrl);
    send("status", { agent: 1, label: "Reading A2L deadlines", status: "done", data: a2lDeadlines });

    send("status", { agent: 2, label: "Scanning email + calendar", status: "running" });
    const emailCalData = await runEmailCalAgent();
    send("status", { agent: 2, label: "Scanning email + calendar", status: "done", data: emailCalData });

    send("status", { agent: 3, label: "Extracting extra tasks", status: "running" });
    const extractedTasks = await runInterviewAgent(extraTasks || "");
    send("status", { agent: 3, label: "Extracting extra tasks", status: "done", data: extractedTasks });

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