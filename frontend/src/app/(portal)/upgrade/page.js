'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: 0,
    quota: 10,
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    features: [
      '10 AI actions / month',
      'AI Quiz generation',
      'Document upload & analysis',
      'Learning path tracker',
      'Goals & analytics',
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    id: 'basic',
    label: 'Basic',
    price: 99,
    quota: 75,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    popular: false,
    features: [
      '75 AI actions / month',
      'Everything in Free',
      'Priority AI response',
      'Detailed topic mastery tracking',
      'Parent payment link',
    ],
    cta: 'Upgrade to Basic',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 199,
    quota: 999,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    popular: true,
    features: [
      'Unlimited AI actions',
      'Everything in Basic',
      'Advanced analytics & insights',
      'Fastest AI response',
      'Early access to new features',
    ],
    cta: 'Upgrade to Pro',
  },
]

export default function UpgradePage() {
  const [currentPlan, setCurrentPlan] = useState('free')
  const [quota,       setQuota]       = useState(null)
  const [loading,     setLoading]     = useState(null)
  const [error,       setError]       = useState('')
  const [parentLink,  setParentLink]  = useState('')
  const [copied,      setCopied]      = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.quota) { setQuota(d.quota); setCurrentPlan(d.quota.plan) }
      }).catch(() => {})
  }, [])

  async function handleUpgrade(planId) {
    if (planId === 'free' || planId === currentPlan) return
    setLoading(planId)
    setError('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.demo_mode) {
        setError(`Demo mode: Paynamics not yet configured. In production, you would be redirected to the payment page. Ref: ${data.internal_ref}`)
        setLoading(null)
        return
      }
      if (data.paynamics_url) {
        // Submit form to Paynamics
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.paynamics_url
        const rb = document.createElement('input')
        rb.type = 'hidden'; rb.name = 'requestdata'; rb.value = data.request_body
        const sig = document.createElement('input')
        sig.type = 'hidden'; sig.name = 'signature'; sig.value = data.signature
        form.appendChild(rb); form.appendChild(sig)
        document.body.appendChild(form)
        form.submit()
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  async function generateParentLink() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/subscription/generate-parent-link', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setParentLink(data.payment_url || '')
    } catch (e) {}
  }

  function copyLink() {
    navigator.clipboard.writeText(parentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: 0 }}>Upgrade Your Plan</h1>
        <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '0.95rem' }}>
          More AI actions = more learning. Pick the plan that works for you.
        </p>
        {quota && !quota.is_unlimited && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: quota.pct_used >= 80 ? '#fef2f2' : '#f3f4f6', border: `1px solid ${quota.pct_used >= 80 ? '#fecaca' : '#e5e7eb'}`, borderRadius: '10px', padding: '6px 14px', marginTop: '12px', fontSize: '0.82rem', color: quota.pct_used >= 80 ? '#dc2626' : '#374151' }}>
            <span>{quota.pct_used >= 80 ? '⚠️' : 'ℹ️'}</span>
            <span>You've used <strong>{quota.used}</strong> of <strong>{quota.limit}</strong> AI actions this month</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#92400e' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id
          const isUpgrade = !isCurrent && plan.price > 0
          return (
            <div key={plan.id} style={{
              background: isCurrent ? plan.bg : 'white',
              border: `2px solid ${isCurrent ? plan.color : plan.border}`,
              borderRadius: '16px', padding: '1.5rem',
              position: 'relative',
              boxShadow: plan.popular ? '0 8px 25px rgba(124,58,237,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  ✨ MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: '-12px', right: '1rem', background: plan.color, color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
                  CURRENT
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: plan.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{plan.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: '#111827' }}>
                    {plan.price === 0 ? 'Free' : `₱${plan.price}`}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>/month</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>
                  {plan.quota >= 999 ? 'Unlimited AI actions' : `${plan.quota} AI actions / month`}
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: '0 0 1.25rem 0', padding: 0 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '7px', fontSize: '0.8rem', color: '#374151' }}>
                    <span style={{ color: plan.color, fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent || loading === plan.id}
                onClick={() => handleUpgrade(plan.id)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px',
                  border: isCurrent ? `1px solid ${plan.color}` : 'none',
                  background: isCurrent ? 'transparent' : isUpgrade ? `linear-gradient(135deg,${plan.color},${plan.color}dd)` : '#f3f4f6',
                  color: isCurrent ? plan.color : isUpgrade ? 'white' : '#9ca3af',
                  fontWeight: '700', fontSize: '0.85rem', cursor: isCurrent ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'opacity 0.2s',
                  opacity: loading && loading !== plan.id ? 0.6 : 1,
                }}
              >
                {loading === plan.id ? '⏳ Processing...' : isCurrent ? '✓ Current Plan' : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* B2B section */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ fontSize: '2rem', flexShrink: 0 }}>🏫</div>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '800', color: '#166534' }}>Are you a school or teacher?</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
              SchoolMATE AI B2B plans start at <strong>₱1,000/student/year</strong> — that's less than ₱84/month per student.
              Includes school admin dashboard, class management, and bulk enrollment. No AI? Go B2B Basic at ₱1,000/yr.
              With AI? B2B AI at ₱1,500/yr.
            </p>
            <a href="mailto:hello@schoolmate-online.net?subject=B2B%20Inquiry" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#16a34a', color: 'white', padding: '9px 16px', borderRadius: '9px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '700' }}>
              📧 Contact us for a B2B quote
            </a>
          </div>
        </div>
      </div>

      {/* Parent payment link */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#111827' }}>💌 Send payment link to your parent</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#6b7280' }}>
          Generate a shareable link — your parent can pay directly without logging in.
        </p>
        {!parentLink ? (
          <button onClick={generateParentLink} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Generate Parent Payment Link
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input readOnly value={parentLink} style={{ flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.8rem', color: '#374151', background: '#f9fafb' }} />
            <button onClick={copyLink} style={{ padding: '9px 16px', background: copied ? '#16a34a' : '#2563eb', color: 'white', border: 'none', borderRadius: '9px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
