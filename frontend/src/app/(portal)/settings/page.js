'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [user,    setUser]    = useState(null)
  const [quota,   setQuota]   = useState(null)
  const [history, setHistory] = useState([])
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({ name: '', school_name: '', grade_level: '', strand: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setUser(d)
        setQuota(d.quota)
        setForm({ name: d.name || '', school_name: d.school_name || '', grade_level: d.grade_level || '', strand: d.strand || '' })
      })

    fetch('/api/subscription/history', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { setSaved(true); setUser(prev => ({ ...prev, ...data.user })) }
      else setError(data.message || 'Failed to save')
    } catch { setError('Network error') }
    setSaving(false)
  }

  const PLAN_INFO = {
    free:      { label: 'Free Plan',    color: '#6b7280', desc: '10 AI actions/month' },
    basic:     { label: 'Basic Plan',   color: '#2563eb', desc: '75 AI actions/month' },
    pro:       { label: 'Pro Plan',     color: '#7c3aed', desc: 'Unlimited AI actions' },
    b2b_basic: { label: 'B2B Basic',    color: '#16a34a', desc: 'School plan — no AI' },
    b2b_ai:    { label: 'B2B AI Plan',  color: '#16a34a', desc: '100 AI actions/month' },
  }
  const planInfo = PLAN_INFO[quota?.plan || 'free']

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0 }}>⚙️ Settings</h1>
        <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '0.88rem' }}>Manage your account and subscription</p>
      </div>

      {/* Plan status card */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>Subscription Plan</h2>
          <Link href="/upgrade" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600', background: '#eff6ff', padding: '4px 10px', borderRadius: '7px' }}>
            Manage Plan
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: planInfo?.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            {quota?.plan === 'pro' ? '✨' : quota?.plan?.startsWith('b2b') ? '🏫' : '⚡'}
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: planInfo?.color }}>{planInfo?.label}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{planInfo?.desc}</div>
          </div>
        </div>

        {quota && !quota.is_unlimited && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>AI Actions This Month</span>
              <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: '700' }}>{quota.used} / {quota.limit}</span>
            </div>
            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, quota.pct_used)}%`, background: quota.pct_used >= 90 ? '#dc2626' : quota.pct_used >= 70 ? '#f59e0b' : '#2563eb', borderRadius: '4px', transition: 'width 0.5s' }} />
            </div>
            {quota.resets_at && (
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '5px' }}>
                Resets {new Date(quota.resets_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>
        )}
        {quota?.is_unlimited && (
          <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f5f3ff', borderRadius: '8px', fontSize: '0.8rem', color: '#7c3aed', fontWeight: '600' }}>
            ✨ Unlimited AI actions — no limits on your learning!
          </div>
        )}
      </div>

      {/* Account info form */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>Account Information</h2>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>School</label>
              <input value={form.school_name} onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))}
                placeholder="School name" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Grade Level</label>
              <select value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}>
                <option value="">Select grade</option>
                {[7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Strand</label>
              <select value={form.strand} onChange={e => setForm(f => ({ ...f, strand: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}>
                <option value="">Select strand</option>
                {['STEM','ABM','HUMSS','TVL','GAS','Sports','Arts & Design'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Email</label>
              <input value={user?.email || ''} disabled style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.85rem', background: '#f9fafb', color: '#6b7280', fontFamily: 'inherit', width: '260px' }} />
            </div>
          </div>

          {error && <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#dc2626' }}>⚠️ {error}</div>}
          {saved && <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#16a34a' }}>✓ Profile updated successfully</div>}

          <button type="submit" disabled={saving} style={{ marginTop: '14px', padding: '10px 22px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {/* Billing history */}
      {history.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>Billing History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.slice(0, 8).map((sub, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f9fafb', borderRadius: '9px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>{sub.plan}</span>
                  <span style={{ color: '#9ca3af', marginLeft: '8px' }}>{sub.gateway || 'paynamics'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#374151', fontWeight: '600' }}>₱{Number(sub.amount).toLocaleString()}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '2px 7px', borderRadius: '6px', background: sub.status === 'active' ? '#f0fdf4' : sub.status === 'pending' ? '#fef9c3' : '#fef2f2', color: sub.status === 'active' ? '#16a34a' : sub.status === 'pending' ? '#ca8a04' : '#dc2626' }}>
                    {sub.status}
                  </span>
                  <span style={{ color: '#9ca3af' }}>{sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
