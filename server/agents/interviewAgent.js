import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(`
You are Agent 3 — the task extractor.

A student was asked "what else do you have on your plate today?" and responded with free text.

Extract any tasks, errands, appointments, or commitments they mentioned.
For each item return:
- task: what needs to be done
- time: specific time if mentioned, null if not
- duration: estimated duration in minutes if inferable, null if not
- category: personal | academic | social | health | chores | other

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {{
    "task": "gym session",
    "time": "18:00",
    "duration": 60,
    "category": "health"
  }}
]

Student's response:
{userInput}
`);

export async function runInterviewAgent(userInput) {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-20250514",
    temperature: 0.3,
  });
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  try {
    if (!userInput || userInput.trim() === "") return [];
    const result = await chain.invoke({ userInput });
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Interview Agent error:", error.message);
    return [];
  }
}