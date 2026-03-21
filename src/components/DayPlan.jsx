export default function DayPlan({ plan, onReset }) {
    if (!plan) return null
  
    const priorityColor = {
      urgent: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#16a34a',
    }
  
    const categoryEmoji = {
      academic: '📚',
      email: '📧',
      personal: '🙂',
      class: '🎓',
      break: '☕',
    }
  
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '40px 20px 60px' }}>
  
        {/* Greeting */}
        <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{plan.greeting}</p>
        <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 4 }}>Your day plan</h2>
        <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 28 }}>
          Focus: <strong>{plan.todayFocus}</strong>
        </p>
  
        {/* On fire */}
        {plan.onFire?.length > 0 && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
          }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#dc2626', marginBottom: 8 }}>🔥 Don't forget</p>
            {plan.onFire.map((item, i) => (
              <p key={i} style={{ fontSize: 14, color: '#7f1d1d', margin: '4px 0' }}>• {item}</p>
            ))}
          </div>
        )}
  
        {/* Schedule */}
        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', letterSpacing: '0.05em', marginBottom: 10 }}>
          SCHEDULE
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {plan.schedule?.map((block, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 3px' }}>
                    {block.time} — {block.endTime}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-h)', margin: '0 0 3px' }}>
                    {categoryEmoji[block.category] || '•'} {block.task}
                  </p>
                  {block.notes && (
                    <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{block.notes}</p>
                  )}
                </div>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 99,
                  background: priorityColor[block.priority] + '20',
                  color: priorityColor[block.priority],
                  fontWeight: 500, marginLeft: 10, flexShrink: 0,
                }}>
                  {block.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Quick action items */}
        {plan.actionItems?.length > 0 && (
          <>
            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', letterSpacing: '0.05em', marginBottom: 10 }}>
              QUICK ACTIONS
            </p>
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 24,
            }}>
              {plan.actionItems.map((item, i) => (
                <p key={i} style={{ fontSize: 14, color: 'var(--text-h)', margin: '4px 0' }}>
                  • {item.task}
                </p>
              ))}
            </div>
          </>
        )}
  
        {/* Deferred */}
        {plan.deferredToTomorrow?.length > 0 && (
          <>
            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', letterSpacing: '0.05em', marginBottom: 10 }}>
              TOMORROW
            </p>
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 24,
            }}>
              {plan.deferredToTomorrow.map((item, i) => (
                <p key={i} style={{ fontSize: 14, color: 'var(--text)', margin: '4px 0' }}>• {item}</p>
              ))}
            </div>
          </>
        )}
  
        {/* Reset */}
        <button onClick={onReset} style={{
          width: '100%', padding: 16, background: '#fff',
          border: '1px solid var(--border)', borderRadius: 14,
          fontSize: 15, fontWeight: 500, cursor: 'pointer',
          color: 'var(--text-h)',
        }}>
          ← Plan again
        </button>
  
      </div>
    )
  }