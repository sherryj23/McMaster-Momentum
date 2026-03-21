import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { fetchIcal } from "../lib/fetchIcal.js";

const prompt = PromptTemplate.fromTemplate(`
You are Agent 1 — the A2L (Avenue to Learn) academic deadline extractor.

You have been given raw iCal calendar data from a McMaster University student's Avenue to Learn account.

Extract ALL upcoming assignments, quizzes, tests, exams, and submissions. 
For each item return:
- title: the name of the task
- course: the course code/name if identifiable
- due: the due date and time (ISO format if possible)
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

iCal data:
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
    const result = await chain.invoke({ icalData: rawIcal.substring(0, 8000), today });
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("A2L Agent error:", error.message);
    return [];
  }
}