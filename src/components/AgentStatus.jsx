import { useEffect, useState } from 'react'
import { runAgents } from '../lib/anthropic'

const AGENTS = [
  { id: 1, label: 'Reading A2L deadlines' },
  { id: 2, label: 'Scanning email + calendar' },
  { id: 3, label: 'Extracting extra tasks' },
  { id: 4, label: 'Building your day plan' },
]

export default function AgentStatus({ setupData, onComplete }) {
  const [statuses, setStatuses] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    runAgents(setupData, (event) => {
      if (event.agent) {
        setStatuses(prev => ({ ...prev, [event.agent]: event.status }))
      }
      if (event.dayPlan) {
        onComplete(event.dayPlan)
      }
    }).catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 500, marginBottom: 8 }}>Something went wrong</p>
        <p style={{ fontSize: 14, color: '#6b7280' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: '60px 20px' }}>
      <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Sorting out your day...</h2>
      <p style={{ color: 'var(--text)', marginBottom: 32, fontSize: 15 }}>
        4 agents are working on it right now.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {AGENTS.map(agent => {
          const status = statuses[agent.id]
          return (
            <div key={agent.id} style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: status === 'done' ? '#22c55e' : status === 'running' ? '#a855f7' : '#e5e7eb',
                animation: status === 'running' ? 'pulse 1s infinite' : 'none',
              }} />
              <span style={{
                fontSize: 15,
                color: status ? 'var(--text-h)' : 'var(--text)',
                fontWeight: status === 'running' ? 500 : 400,
              }}>
                {agent.label}
              </span>
              {status === 'done' && (
                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#22c55e' }}>done</span>
              )}
              {status === 'running' && (
                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#a855f7' }}>running...</span>
              )}
            </div>
          )
        })}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}