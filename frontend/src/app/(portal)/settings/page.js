'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser]         = useState({})
  const [quota, setQuota]       = useState(null)
  const [sub, setSub]           = useState(null)
  const [history, setHistory]   = useState([])
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState(null)
  const [tab, setTab]           = useState('account')
  const [form, setForm]         = useState({ name: '', school_name: '' })
  const [pwForm, setPwForm]     = useState({ current: '', password: '', confirm: '' })
  const [parentLink, setParentLink] = useState(null)
  const [token, setToken]           = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setToken(token)
    if (!token) return
    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/subscription/history', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([me, status, hist]) => {
      setUser(me)
      setForm({ name: me.name || '', school_name: me.school_name || '' })
      if (status.quota) setQuota(status.quota)
      if (status.subscription) setSub(status.subscription)
      if (Array.isArray(hist)) setHistory(hist)
    }).catch(() => {})
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    const token = localStorage.getItem('token')
    try {
      const res  = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { setMsg({ type: 'success', text: '✅ Profile updated.' }); setUser(data.user || user) }
      else setMsg({ type: 'error', text: data.message || 'Update failed.' })
    } catch { setMsg({ type: 'error', text: 'Network error.' }) }
    setSaving(false)
  }

  async function generateParentLink() {
    const token = localStorage.getItem('token')
    const res  = await fetch('/api/subscription/generate-parent-link', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setParentLink(data.payment_url)
  }

  const PLAN_COLOR = { free:'#6b7280', basic:'#2563eb', pro:'#7c3aed', b2b_basic:'#16a34a', b2b_ai:'#16a34a' }
  const plan = quota?.plan || 'free'
  const planColor = PLAN_COLOR[plan] || '#6b7280'

  const TABS = [
    { id: 'account', label: '👤 Account' },
    { id: 'plan',    label: '⚡ Plan & Billing' },
  ]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>Settings</h1>
      <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.75rem' }}>Manage your account and subscription</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.75rem', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 18px', borderRadius: '8px', border: 'none', fontFamily: 'inherit',
            fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
            background: tab === t.id ? 'white' : 'transparent',
            color: tab === t.id ? '#111827' : '#6b7280',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1.25rem', background: msg.type==='error'?'#fef2f2':'#f0fdf4', border:`1px solid ${msg.type==='error'?'#fca5a5':'#bbf7d0'}`, color: msg.type==='error'?'#dc2626':'#16a34a', fontSize: '0.85rem', fontWeight: '500' }}>
          {msg.text}
        </div>
      )}

      {tab === 'account' && (
        <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>Account Information</h2>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', fontWeight: '800', flexShrink: 0 }}>
              {user.name ? user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#111827' }}>{user.name || '—'}</div>
              <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{user.email}</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}>
                  Grade {user.grade_level || '—'}
                </span>
                {user.strand && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', fontWeight: '600' }}>{user.strand}</span>}
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontWeight: '600' }}>
                  {plan.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())} Plan
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile}>
            <style>{'.settings-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; } @media(max-width:500px){.settings-form-grid{grid-template-columns:1fr;}}'}</style>
            <div className="settings-form-grid">
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Full Name</label>
                <input
                  value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>School Name</label>
                <input
                  value={form.school_name} onChange={e => setForm(f => ({...f, school_name: e.target.value}))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px', marginBottom: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
              <strong style={{ color: '#374151' }}>Email: </strong>{user.email} &nbsp;·&nbsp;
              <strong style={{ color: '#374151' }}>Provider: </strong>{user.social_provider || 'Email/Password'}
            </div>

            <button type="submit" disabled={saving} style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
              {saving ? '⏳ Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Current plan */}
          <div style={{ background: 'white', border: `2px solid ${planColor}20`, borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', margin: 0 }}>Current Plan</h2>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: `${planColor}15`, color: planColor }}>
                {plan.replace('_',' ').toUpperCase()}
              </span>
            </div>

            {/* Quota usage */}
            {quota && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: '600' }}>AI Actions Used</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: quota.pct_used >= 80 ? '#dc2626' : '#374151' }}>
                    {quota.is_unlimited ? '∞ Unlimited' : `${quota.used} / ${quota.limit}`}
                  </span>
                </div>
                {!quota.is_unlimited && (
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, quota.pct_used)}%`, background: quota.pct_used >= 90 ? '#dc2626' : quota.pct_used >= 70 ? '#f59e0b' : planColor, borderRadius: '4px', transition: 'width 0.5s' }} />
                  </div>
                )}
                {quota.resets_at && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                    Resets {new Date(quota.resets_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}
                  </div>
                )}
              </div>
            )}

            {sub && (
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px', fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Subscribed: </strong>{new Date(sub.started_at).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })}
                {sub.expires_at && <> &nbsp;·&nbsp; <strong style={{ color: '#374151' }}>Expires: </strong>{new Date(sub.expires_at).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })}</>}
                &nbsp;·&nbsp; <strong style={{ color: '#374151' }}>Paid: </strong>₱{sub.amount}
              </div>
            )}

            {plan !== 'pro' && (
              <Link href="/upgrade" style={{ display: 'inline-block', padding: '9px 20px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', borderRadius: '9px', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}>
                ⚡ Upgrade Plan →
              </Link>
            )}
          </div>

          {/* Parent payment link */}
          <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', marginBottom: '0.5rem' }}>👨‍👩‍👧 Parent Payment Link</h2>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Let your parent pay for your subscription without needing to log in.
            </p>
            {parentLink ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input readOnly value={parentLink} style={{ flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.78rem', color: '#374151', background: '#f9fafb', fontFamily: 'monospace' }} />
                <button onClick={() => { navigator.clipboard.writeText(parentLink); setMsg({ type: 'success', text: '✅ Link copied!' }) }}
                  style={{ padding: '9px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Copy</button>
              </div>
            ) : (
              <button onClick={generateParentLink}
                style={{ padding: '9px 18px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                🔗 Generate Link
              </button>
            )}
          </div>


          {/* Parent Link Code */}
          <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', marginBottom: '0.25rem' }}>👨‍👩‍👧 Parent Access</h2>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>Share your link code so a parent can monitor your progress in the Parent Portal.</p>
            <ParentLinkCode token={token} />
          </div>

          {/* Billing history */}
          {history.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', marginBottom: '1rem' }}>Billing History</h2>
              <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '400px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Date','Plan','Amount','Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#9ca3af', fontWeight: '600', fontSize: '0.75rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '8px', color: '#374151' }}>{new Date(item.created_at).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })}</td>
                      <td style={{ padding: '8px', color: '#374151', textTransform: 'capitalize' }}>{item.plan}</td>
                      <td style={{ padding: '8px', color: '#374151', fontWeight: '600' }}>₱{item.amount}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: '600',
                          background: item.status==='active'?'#f0fdf4':item.status==='pending'?'#fef3c7':'#fef2f2',
                          color: item.status==='active'?'#16a34a':item.status==='pending'?'#92400e':'#dc2626' }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ParentLinkCode({ token }) {
  const [code, setCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const API = process.env.NEXT_PUBLIC_API_URL || ''

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/student/parent-link-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      setCode(data.link_code)
    } catch {}
    setLoading(false)
  }

  const copy = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      {!code ? (
        <button onClick={generate} disabled={loading}
          style={{ background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '0.65rem 1.25rem', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Generating…' : '🔑 Generate Parent Link Code'}
        </button>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#f8fafc', border: '2px dashed #c7d2fe', borderRadius: 10, padding: '0.75rem 1.5rem', fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.15em', color: '#4f46e5' }}>
              {code}
            </div>
            <button onClick={copy}
              style={{ background: copied ? '#10b981' : '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.65rem 1rem', color: copied ? '#fff' : '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Share this code with your parent. They can use it when registering at{' '}
            <a href="/parent/register" target="_blank" style={{ color: '#6366f1' }}>portal.schoolmate-online.net/parent/register</a>
          </p>
          <p style={{ color: '#d1d5db', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
            This code is permanent — your parent only needs it once when registering.
          </p>
        </div>
      )}
    </div>
  )
}
