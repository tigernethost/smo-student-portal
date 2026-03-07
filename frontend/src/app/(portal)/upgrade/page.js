'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: 0,
    priceLabel: '₱0',
    period: 'forever',
    quota: 10,
    features: [
      '10 AI actions per month',
      'Quiz generation',
      'Document upload & analysis',
      'Learning path',
      'Basic analytics',
    ],
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'basic',
    label: 'Basic',
    price: 99,
    priceLabel: '₱99',
    period: '/month',
    quota: 75,
    features: [
      '75 AI actions per month',
      'Everything in Free',
      'Priority AI responses',
      'Full analytics dashboard',
      'Goal tracking',
      'Parent payment link',
    ],
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    cta: 'Upgrade to Basic',
    popular: false,
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 199,
    priceLabel: '₱199',
    period: '/month',
    quota: 999,
    features: [
      'Unlimited AI actions',
      'Everything in Basic',
      'Fastest AI responses',
      'Advanced insights & reports',
      'Study streak tracking',
      'Priority support',
    ],
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    cta: 'Upgrade to Pro',
    popular: true,
  },
]

export default function UpgradePage() {
  const [quota, setQuota]       = useState(null)
  const [currentPlan, setCurrent] = useState('free')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState(null)
  const [parentLink, setParentLink] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.quota) { setQuota(d.quota); setCurrent(d.quota.plan || 'free') }
      }).catch(() => {})
  }, [])

  async function handleUpgrade(planId) {
    if (planId === currentPlan) return
    setLoading(planId)
    setMsg(null)
    const token = localStorage.getItem('token')
    try {
      const res  = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()

      if (data.demo_mode) {
        setMsg({ type: 'info', text: '⚡ Demo mode: Paynamics payment gateway is not yet configured. Your plan has been noted. Contact us to arrange payment.' })
      } else if (data.paynamics_url) {
        // Submit to Paynamics hosted payment page
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.paynamics_url
        const rb = document.createElement('input'); rb.type='hidden'; rb.name='requestdata'; rb.value=data.request_body
        const sig = document.createElement('input'); sig.type='hidden'; sig.name='signature'; sig.value=data.signature
        form.appendChild(rb); form.appendChild(sig)
        document.body.appendChild(form); form.submit()
      } else {
        setMsg({ type: 'error', text: data.message || 'Something went wrong.' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' })
    }
    setLoading(false)
  }

  async function generateParentLink() {
    setLoading('parent')
    const token = localStorage.getItem('token')
    try {
      const res  = await fetch('/api/subscription/generate-parent-link', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setParentLink(data.payment_url)
    } catch {}
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem' }}>
          Unlock More AI Actions
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
          Choose a plan that fits your study needs. Cancel anytime.
        </p>
        {quota && !quota.is_unlimited && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1rem', padding: '8px 16px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '20px', fontSize: '0.82rem', color: '#92400e', fontWeight: '600' }}>
            📊 You've used {quota.used}/{quota.limit} AI actions this month
          </div>
        )}
      </div>

      {/* Alert */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '1.5rem', background: msg.type === 'error' ? '#fef2f2' : '#eff6ff', border: `1px solid ${msg.type === 'error' ? '#fca5a5' : '#bfdbfe'}`, color: msg.type === 'error' ? '#dc2626' : '#1d4ed8', fontSize: '0.875rem', fontWeight: '500' }}>
          {msg.text}
        </div>
      )}

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {PLANS.map(plan => {
          const isCurrentPlan = currentPlan === plan.id
          return (
            <div key={plan.id} style={{
              background: plan.popular ? `linear-gradient(145deg, ${plan.bg}, white)` : 'white',
              border: `2px solid ${isCurrentPlan ? plan.color : plan.popular ? plan.border : '#f3f4f6'}`,
              borderRadius: '16px', padding: '1.5rem', position: 'relative',
              boxShadow: plan.popular ? '0 8px 24px rgba(124,58,237,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', color: 'white', fontSize: '0.68rem', fontWeight: '700', padding: '3px 14px', borderRadius: '12px', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                  ✨ MOST POPULAR
                </div>
              )}
              {isCurrentPlan && (
                <div style={{ position: 'absolute', top: '-12px', right: '16px', background: plan.color, color: 'white', fontSize: '0.68rem', fontWeight: '700', padding: '3px 10px', borderRadius: '12px' }}>
                  ✓ CURRENT
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: plan.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{plan.label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: '#111827' }}>{plan.priceLabel}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>
                  {plan.quota === 999 ? '∞ Unlimited' : `${plan.quota} AI actions`}/month
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: '0 0 1.25rem', padding: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: '#374151', marginBottom: '6px' }}>
                    <span style={{ color: plan.color, fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan || loading === plan.id}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px', fontFamily: 'inherit',
                  fontSize: '0.85rem', fontWeight: '700', cursor: isCurrentPlan ? 'default' : 'pointer',
                  border: 'none', transition: 'all 0.15s',
                  background: isCurrentPlan ? '#f3f4f6' : plan.popular ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : plan.color,
                  color: isCurrentPlan ? '#9ca3af' : 'white',
                  opacity: loading && loading !== plan.id ? 0.6 : 1,
                }}>
                {loading === plan.id ? '⏳ Processing...' : isCurrentPlan ? '✓ Current Plan' : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* B2B Banner */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem' }}>🏫</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: '800', fontSize: '1.05rem', marginBottom: '4px' }}>School-wide plan? Ask your admin.</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>If your school signs up for SchoolMATE AI B2B, all students get access at ₱1,000–₱1,500/student/year — even cheaper than individual plans.</div>
        </div>
        <a href="mailto:hello@schoolmate-online.net?subject=B2B Inquiry" style={{ padding: '10px 20px', background: 'white', color: '#0f172a', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Contact Sales →
        </a>
      </div>

      {/* Parent payment link */}
      <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>👨‍👩‍👧</span>
          <div>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>Ask your parent to pay for you</div>
            <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>Generate a shareable payment link — no parent login needed</div>
          </div>
        </div>
        {parentLink ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input readOnly value={parentLink} style={{ flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.8rem', color: '#374151', background: '#f9fafb', fontFamily: 'monospace' }} />
            <button onClick={() => { navigator.clipboard.writeText(parentLink); setMsg({ type: 'info', text: '✅ Link copied to clipboard!' }) }}
              style={{ padding: '9px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
              Copy
            </button>
          </div>
        ) : (
          <button onClick={generateParentLink} disabled={loading === 'parent'}
            style={{ padding: '9px 18px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
            {loading === 'parent' ? '⏳ Generating...' : '🔗 Generate Parent Payment Link'}
          </button>
        )}
      </div>
    </div>
  )
}
