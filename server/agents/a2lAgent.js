import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { fetchIcal } from "../lib/fetchIcal.js";

// Parse raw iCal text into an array of event objects
function parseIcalEvents(rawIcal) {
  const events = [];
  const blocks = rawIcal.split("BEGIN:VEVENT");
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const get = (key) => {
      // Handle folded lines (lines starting with space/tab are continuations)
      const unfolded = block.replace(/\r?\n[ \t]/g, "");
      const match = unfolded.match(new RegExp(`${key}[^:;]*[;:][^\r\n]*`, "i"));
      if (!match) return null;
      return match[0].replace(/^[^:]+:/, "").trim();
    };
    const dtstart = get("DTSTART");
    const summary = get("SUMMARY")?.replace(/\\,/g, ",").replace(/\\n/g, " ");
    const description = get("DESCRIPTION")
      ?.replace(/\\,/g, ",")
      .replace(/\\n/g, "\n");
    const location = get("LOCATION");
    if (dtstart && summary) {
      events.push({ dtstart, summary, description, location });
    }
  }
  return events;
}

// Parse a DTSTART value (handles DATE-only and DATE-TIME with/without TZID)
function parseDtstart(dtstart) {
  if (!dtstart) return null;
  // Strip timezone prefix like "TZID=America/Toronto:" — already stripped by get()
  // Format: 20260323T235900 or 20260323T235900Z or 20260323
  const clean = dtstart.replace(/[TZ]/g, (m, i, s) =>
    m === "T" ? "T" : m === "Z" ? "" : m,
  );
  // Normalize: 20260323T235900 → 2026-03-23T23:59:00
  const m = dtstart.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "00", min = "00", s = "00"] = m;
  return `${y}-${mo}-${d}T${h}:${min}:${s}`;
}

const prompt = PromptTemplate.fromTemplate(`
You are Agent 1 — the A2L (Avenue to Learn) academic deadline extractor.

You have been given a list of upcoming calendar events from a McMaster University student's Avenue to Learn account.
Each event has: dtstart (due date/time), summary (title), description, and location.

Extract ALL assignments, quizzes, tests, exams, and submissions. 
For each item return:
- title: the name of the task
- course: the course code/name if identifiable
- due: the due date and time (ISO format)
- type: assignment | quiz | exam | lab | other
- priority: urgent (due within 2 days) | high (due within 7 days) | medium (due within 14 days) | low (due later)

Today's date is {today}.

Return ONLY a valid JSON array, no markdown, no explanation. Example:
[
  {{
    "title": "Assignment 2",
    "course": "COMPSCI 1JC3",
    "due": "2026-03-23T23:59:00",
    "type": "assignment",
    "priority": "urgent"
  }}
]

Upcoming events (JSON):
{icalData}
`);

export async function runA2LAgent(a2lUrl) {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-20250514",
    temperature: 0,
  });
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  try {
    const rawIcal = await fetchIcal(a2lUrl);
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);

    // Parse all events and filter to today + future only (by DTSTART)
    const allEvents = parseIcalEvents(rawIcal);
    const upcomingEvents = allEvents.filter((e) => {
      const iso = parseDtstart(e.dtstart);
      if (!iso) return false;
      return new Date(iso) >= todayDate;
    });

    console.log(
      `Parsed ${allEvents.length} total events, ${upcomingEvents.length} upcoming`,
    );

    const result = await chain.invoke({
      icalData: JSON.stringify(upcomingEvents, null, 2),
      today,
    });
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("A2L Agent error:", error.message);
    return [];
  }
}
