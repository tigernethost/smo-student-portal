'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }

function RegisterContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '', link_code: params.get('code') || '', relationship: 'Guardian' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')

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

  const socialSignUp = async (provider) => {
    setSocialLoading(provider)
    setError('')
    try {
      const res = await fetch(`${API}/api/parent/auth/social/${provider}`, {
        headers: { Accept: 'application/json' },
      })
      const data = await res.json()
      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        setError('Could not start social sign-up. Please try again.')
        setSocialLoading('')
      }
    } catch {
      setError('Network error. Please try again.')
      setSocialLoading('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Create Parent Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Monitor your child's learning journey</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '2rem', backdropFilter: 'blur(12px)' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Social Sign Up */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick sign up with</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => socialSignUp('google')}
                disabled={!!socialLoading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem', color: '#111', fontSize: '0.9rem', fontWeight: 600, cursor: socialLoading ? 'not-allowed' : 'pointer', opacity: socialLoading === 'facebook' ? 0.5 : 1 }}
              >
                {socialLoading === 'google' ? '⏳' : (
                  <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                )}
                {socialLoading === 'google' ? 'Wait...' : 'Google'}
              </button>

              <button
                onClick={() => socialSignUp('facebook')}
                disabled={!!socialLoading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1877F2', border: 'none', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: socialLoading ? 'not-allowed' : 'pointer', opacity: socialLoading === 'google' ? 0.5 : 1 }}
              >
                {socialLoading === 'facebook' ? '⏳' : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                )}
                {socialLoading === 'facebook' ? 'Wait...' : 'Facebook'}
              </button>
            </div>
            <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
              Social sign-up creates your account — link your child later from the dashboard
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: '#475569', fontSize: '0.8rem' }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Info banner */}
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem' }}>💡</span>
            <div style={{ color: '#a5b4fc', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Ask your child to open SchoolMATE, go to <strong>Settings → Generate Parent Link Code</strong>, and share the 8-character code with you.
            </div>
          </div>

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

export default function ParentRegister() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'#94a3b8' }}>Loading...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}
