import { Client } from 'langsmith'

export const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
})

export function tracingEnabled() {
  return Boolean(process.env.LANGCHAIN_API_KEY)
}