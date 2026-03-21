import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(`
You are Agent 2 — the email and calendar action extractor.

From the EMAIL DATA extract:
- Unanswered emails that need a reply
- Action items or tasks mentioned in emails
- Deadlines or meetings mentioned in email threads

From the CALENDAR DATA extract:
- All events for today
- Any conflicts or back-to-back meetings
- Events in the next 7 days that need preparation

Return ONLY a valid JSON object, no markdown, no explanation:
{{
  "emailActions": [
    {{
      "from": "sender name",
      "subject": "email subject",
      "action": "what needs to be done",
      "urgency": "urgent | high | medium | low"
    }}
  ],
  "calendarEvents": [
    {{
      "title": "event name",
      "start": "ISO datetime",
      "end": "ISO datetime",
      "needsPrep": true
    }}
  ],
  "conflicts": ["description of any scheduling conflicts"]
}}

Today's date is {today}.

EMAIL DATA:
{emailData}

CALENDAR DATA:
{calendarData}
`);

export async function runEmailCalAgent(emailData, calendarData) {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-20250514",
    temperature: 0,
  });
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await chain.invoke({
      emailData: emailData || "No email data provided.",
      calendarData: calendarData || "No calendar data provided.",
      today,
    });
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Email/Cal Agent error:", error.message);
    return { emailActions: [], calendarEvents: [], conflicts: [] };
  }
}