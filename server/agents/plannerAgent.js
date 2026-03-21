import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(`
You are Agent 4 — the day planner. You are the final agent in a pipeline.

You have received structured data from 3 other agents:
1. A2L deadlines (academic assignments, quizzes, exams)
2. Email action items + calendar events
3. Extra personal tasks the student mentioned

Your job is to synthesize ALL of this into one clean, realistic day plan for TODAY.

Today is {today}. Current time is approximately {currentTime}.

Rules:
- Only schedule things for the remaining hours of today
- Be realistic about time — don't overschedule
- Group similar tasks together
- Put urgent academic work before personal tasks
- Leave 15-30 min buffer between blocks
- Flag anything that cannot fit today as deferred to tomorrow

Return ONLY a valid JSON object, no markdown, no explanation:
{{
  "greeting": "a short personalized good morning message (1 sentence)",
  "todayFocus": "the single most important thing to accomplish today",
  "schedule": [
    {{
      "time": "9:00 AM",
      "endTime": "10:30 AM",
      "task": "task name",
      "category": "academic | email | personal | class | break",
      "notes": "any helpful context",
      "priority": "urgent | high | medium | low"
    }}
  ],
  "actionItems": [
    {{
      "task": "quick task that takes under 10 mins",
      "urgency": "urgent | high | medium | low"
    }}
  ],
  "deferredToTomorrow": ["things that didn't fit today"],
  "onFire": ["things that are urgent and must not be forgotten"]
}}

A2L DEADLINES:
{a2lDeadlines}

EMAIL + CALENDAR DATA:
{emailCalData}

EXTRA PERSONAL TASKS:
{extraTasks}
`);

export async function runPlannerAgent(a2lDeadlines, emailCalData, extraTasks) {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
  });
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const result = await chain.invoke({
      today,
      currentTime,
      a2lDeadlines: JSON.stringify(a2lDeadlines || []),
      emailCalData: JSON.stringify(emailCalData || {}),
      extraTasks: JSON.stringify(extraTasks || []),
    });
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Planner Agent error:", error.message);
    throw error;
  }
}