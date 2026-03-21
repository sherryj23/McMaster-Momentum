const BASE_URL = 'http://localhost:3001'

export async function runAgents(setupData, onStatus) {
  const res = await fetch(`${BASE_URL}/api/agents/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setupData),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Something went wrong')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          onStatus(data)
        } catch {}
      }
    }
  }
}