'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ParentPaymentPage() {
  const { token }           = useParams()
  const [info, setInfo]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [selected, setSelected] = useState('basic')
  const [paying, setPaying] = useState(false)
  const [msg, setMsg]       = useState(null)

  useEffect(() => {
    fetch(`/api/subscription/parent/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setInfo(d)
        setLoading(false)
      })
      .catch(() => { setError('Could not load payment page.'); setLoading(false) })
  }, [token])

  async function handlePay() {
    setPaying(true); setMsg(null)
    try {
      const res  = await fetch(`/api/subscription/parent/${token}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (data.demo_mode) {
        setMsg({ type: 'info', text: '⚡ Demo mode: Payment gateway not yet configured. The school admin has been notified of your intent.' })
      } else if (data.paynamics_url) {
        const form = document.createElement('form')
        form.method = 'POST'; form.action = data.paynamics_url
        const rb = document.createElement('input'); rb.type='hidden'; rb.name='requestdata'; rb.value=data.request_body
        const sig = document.createElement('input'); sig.type='hidden'; sig.name='signature'; sig.value=data.signature
        form.appendChild(rb); form.appendChild(sig)
        document.body.appendChild(form); form.submit()
      } else {
        setMsg({ type: 'error', text: data.error || 'Something went wrong.' })
      }
    } catch { setMsg({ type: 'error', text: 'Network error. Please try again.' }) }
    setPaying(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: "'Trebuchet MS', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: '#6b7280' }}>Loading payment page...</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: "'Trebuchet MS', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ color: '#dc2626', fontWeight: '700' }}>Invalid Link</h2>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Please ask your child to generate a new payment link from their Settings page.</p>
      </div>
    </div>
  )

  const selectedPlan = info.plans.find(p => p.id === selected) || info.plans[0]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Trebuchet MS', sans-serif" }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(124,58,237,0.25)' }}>
            <img src="/logo.png" alt="SchoolMATE AI" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'brightness(10)' }} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>SchoolMATE AI</h1>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>Parent Payment Portal</p>
        </div>

        {/* Student info */}
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>You are paying for</div>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '1.05rem' }}>{info.student_name}</div>
          <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '2px' }}>
            Grade {info.grade_level || '—'}{info.school ? ` · ${info.school}` : ''} · Currently on <strong>{info.current_plan}</strong> plan
          </div>
        </div>

        {/* Plan selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>Choose a Plan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {info.plans.map(plan => (
              <label key={plan.id} onClick={() => setSelected(plan.id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                border: `2px solid ${selected === plan.id ? (plan.id === 'pro' ? '#7c3aed' : '#2563eb') : '#e5e7eb'}`,
                background: selected === plan.id ? (plan.id === 'pro' ? '#f5f3ff' : '#eff6ff') : 'white',
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="plan" value={plan.id} checked={selected === plan.id} onChange={() => setSelected(plan.id)} style={{ display: 'none' }} />
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `3px solid ${selected === plan.id ? (plan.id === 'pro' ? '#7c3aed' : '#2563eb') : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selected === plan.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: plan.id === 'pro' ? '#7c3aed' : '#2563eb' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{plan.label}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{plan.description}</div>
                </div>
                <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>₱{plan.price}<span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '500' }}>/mo</span></div>
              </label>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1.25rem', background: msg.type==='error'?'#fef2f2':'#eff6ff', border:`1px solid ${msg.type==='error'?'#fca5a5':'#bfdbfe'}`, color: msg.type==='error'?'#dc2626':'#1d4ed8', fontSize: '0.82rem', fontWeight: '500' }}>
            {msg.text}
          </div>
        )}

        {/* Pay button */}
        <button onClick={handlePay} disabled={paying} style={{
          width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white',
          fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'all 0.15s',
        }}>
          {paying ? '⏳ Redirecting to payment...' : `Pay ₱${selectedPlan?.price}/month`}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
          🔒 Secured by Paynamics · Powered by SchoolMATE AI
        </div>
      </div>
    </div>
  )
}
