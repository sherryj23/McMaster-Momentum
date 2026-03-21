import Anthropic from "@anthropic-ai/sdk";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const MCP_SERVERS = [
  { type: "url", url: "https://gmail.mcp.claude.com/mcp", name: "gmail-mcp" },
  { type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "gcal-mcp" },
];

const extractPrompt = PromptTemplate.fromTemplate(`
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

async function fetchFromMCP() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const today = new Date().toISOString().split("T")[0];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    mcp_servers: MCP_SERVERS,
    messages: [
      {
        role: "user",
        content: `Today is ${today}. 
        
        Please do the following:
        1. Read my last 30 Gmail emails and summarize: who has emailed me, what action items exist, what needs a reply
        2. Check my Google Calendar for today and the next 7 days — list all events with their times
        
        Return a JSON object with two keys: "emails" (array of email summaries) and "calendar" (array of events).
        Return ONLY valid JSON, no markdown.`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { emails: text, calendar: "" };
  }
}

export async function runEmailCalAgent() {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-20250514",
    temperature: 0,
  });
  const chain = extractPrompt.pipe(model).pipe(new StringOutputParser());

  try {
    const mcpData = await fetchFromMCP();
    const today = new Date().toISOString().split("T")[0];

    const result = await chain.invoke({
      emailData: JSON.stringify(mcpData.emails || "No email data"),
      calendarData: JSON.stringify(mcpData.calendar || "No calendar data"),
      today,
    });

    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Email/Cal Agent error:", error.message);
    return { emailActions: [], calendarEvents: [], conflicts: [] };
  }
}