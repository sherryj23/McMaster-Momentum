import { useState } from 'react'

export default function TaskInterview({ onSubmit }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    setSubmitted(true)
    onSubmit(input)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: 'var(--text)' }}>Got it! Building your plan...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: '60px 20px' }}>
      <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 8 }}>
        One quick question
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 24 }}>
        Besides what I found in your email and calendar — anything else on your plate today?
      </p>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="e.g. gym at 6pm, call mom, pick up groceries, finish that report..."
        rows={4}
        style={{
          width: '100%', padding: '12px 14px',
          border: '1px solid var(--border)', borderRadius: 12,
          fontSize: 15, color: 'var(--text-h)',
          background: '#fafaf8', resize: 'vertical',
          fontFamily: 'var(--sans)', lineHeight: 1.5,
          boxSizing: 'border-box', marginBottom: 12,
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: '100%', padding: 16,
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 14, fontSize: 16, fontWeight: 500,
          cursor: 'pointer', color: 'var(--text-h)',
        }}
      >
        Build my day →
      </button>

      <button
        onClick={() => onSubmit('')}
        style={{
          width: '100%', padding: 12, marginTop: 8,
          background: 'transparent', border: 'none',
          fontSize: 14, color: 'var(--text)', cursor: 'pointer',
        }}
      >
        Skip, nothing else
      </button>
    </div>
  )
}