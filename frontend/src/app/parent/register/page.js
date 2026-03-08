'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ParentRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', link_code: '', relationship: 'Guardian' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/parent/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, link_code: form.link_code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || data.message || 'Registration failed'); setLoading(false); return }
      localStorage.setItem('parent_token', data.token)
      localStorage.setItem('parent_data', JSON.stringify(data.parent))
      router.push('/parent/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Create Parent Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>You'll need your child's Parent Link Code to register</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '2rem', backdropFilter: 'blur(12px)' }}>

          {/* Info banner */}
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem' }}>💡</span>
            <div style={{ color: '#a5b4fc', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Ask your child to open their SchoolMATE app, go to <strong>Settings → Generate Parent Link Code</strong>, then share the 8-character code with you.
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <Field label="Full Name">
              <input type="text" required placeholder="Maria Santos" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Email Address">
              <input type="email" required placeholder="parent@email.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Password">
              <input type="password" required placeholder="Minimum 8 characters" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Relationship to Child">
              <select value={form.relationship} onChange={e => set('relationship', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Child's Parent Link Code">
              <input
                type="text" required
                placeholder="e.g. AB12CD34"
                value={form.link_code}
                onChange={e => set('link_code', e.target.value.toUpperCase())}
                maxLength={12}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              />
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem' }}>Enter the code exactly as shown on your child's app</div>
            </Field>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#475569' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, padding: '0.875rem', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
              {loading ? 'Creating account…' : 'Create Account & Link Child'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/parent/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}
