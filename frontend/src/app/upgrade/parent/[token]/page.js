'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ParentPaymentPage() {
  const params    = useParams()
  const token     = params.token
  const [info,    setInfo]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [paying,  setPaying]  = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/subscription/parent/${token}`)
      .then(r => r.json())
      .then(d => { setInfo(d); setLoading(false) })
      .catch(() => { setError('Invalid or expired link.'); setLoading(false) })
  }, [token])

  async function handlePay(planId) {
    setPaying(planId)
    try {
      const res = await fetch(`/api/subscription/parent/${token}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.demo_mode) {
        alert(`Demo: Payment gateway not yet configured. In production, you'd be redirected to pay ₱${data.amount} for ${data.plan} plan.`)
        setPaying(null)
        return
      }
      if (data.paynamics_url) {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.paynamics_url
        const rb  = document.createElement('input')
        rb.type = 'hidden'; rb.name = 'requestdata'; rb.value = data.request_body
        const sig = document.createElement('input')
        sig.type = 'hidden'; sig.name = 'signature'; sig.value = data.signature
        form.appendChild(rb); form.appendChild(sig)
        document.body.appendChild(form)
        form.submit()
      }
    } catch { setPaying(null) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Trebuchet MS, sans-serif', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
        <div>Loading payment details...</div>
      </div>
    </div>
  )

  if (error || info?.error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Trebuchet MS, sans-serif', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center', color: '#dc2626', maxWidth: '320px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
        <div style={{ fontWeight: '700', marginBottom: '8px' }}>Invalid Link</div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{error || info?.error}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', fontFamily: 'Trebuchet MS, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
            <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>SchoolMATE AI</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
            Upgrade your child's plan
          </h1>
          <div style={{ background: 'white', borderRadius: '12px', padding: '12px 16px', display: 'inline-block', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '0.85rem', color: '#374151' }}>
              Student: <strong>{info.student_name}</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
              Grade {info.grade_level} · {info.school || 'Student'} · Currently on <strong>{info.current_plan}</strong> plan
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
          {(info.plans || []).map(plan => (
            <div key={plan.id} style={{
              background: 'white', border: plan.id === 'pro' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
              borderRadius: '14px', padding: '1.25rem',
              boxShadow: plan.id === 'pro' ? '0 4px 20px rgba(124,58,237,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div>
                {plan.id === 'pro' && (
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    ✨ Most Popular
                  </div>
                )}
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{plan.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{plan.description}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>₱{plan.price}<span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '400' }}>/mo</span></div>
                <button
                  disabled={!!paying}
                  onClick={() => handlePay(plan.id)}
                  style={{
                    padding: '9px 18px', borderRadius: '9px', border: 'none',
                    background: plan.id === 'pro' ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#2563eb',
                    color: 'white', fontWeight: '700', fontSize: '0.82rem',
                    cursor: paying ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', opacity: paying && paying !== plan.id ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {paying === plan.id ? '⏳ Loading...' : `Pay ₱${plan.price}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.6 }}>
          Secure payment powered by Paynamics · GCash, Credit/Debit Card accepted<br />
          Subscription is monthly and can be cancelled anytime.
        </div>
      </div>
    </div>
  )
}
