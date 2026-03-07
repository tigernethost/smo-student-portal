'use client'
import { useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const SOCIAL_PROVIDERS = [
  {
    id: 'google', label: 'Sign up with Google',
    color: '#ffffff', textColor: '#374151', border: '#d1d5db',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'facebook', label: 'Sign up with Facebook',
    color: '#1877F2', textColor: '#ffffff', border: '#1877F2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'apple', label: 'Sign up with Apple',
    color: '#000000', textColor: '#ffffff', border: '#000000',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation: confirm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || Object.values(data.errors || {})[0]?.[0] || 'Registration failed')
      localStorage.setItem('token', data.token)
      window.location.href = '/onboarding'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSocial(provider) {
    setSocialLoading(provider); setError('')
    try {
      const res = await fetch(`${API}/api/auth/redirect/${provider}`)
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error('Could not get redirect URL')
    } catch (err) {
      setError(err.message)
      setSocialLoading('')
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', color: '#111827', background: 'white', boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)',
      padding: '1.5rem', fontFamily: 'var(--font-body)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img src="/logo.png" alt="SchoolMATE AI" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '12px', background: '#000', padding: '4px', margin: '0 auto 10px', display: 'block' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827' }}>Create your account</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Free for all students — no school required</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' }}>

          {/* Social buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
            {SOCIAL_PROVIDERS.map(p => (
              <button key={p.id} onClick={() => handleSocial(p.id)} disabled={!!socialLoading || loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '11px 16px', borderRadius: '10px', border: `1.5px solid ${p.border}`,
                  background: p.color, color: p.textColor, cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '600',
                  opacity: socialLoading === p.id ? 0.7 : 1,
                  boxShadow: p.id === 'google' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                }}>
                {socialLoading === p.id ? <span>⏳</span> : p.icon}
                {socialLoading === p.id ? 'Redirecting...' : p.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>or sign up with email</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>Full Name</label>
              <input type="text" required placeholder="Juan dela Cruz" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>Email</label>
              <input type="email" required placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>Password</label>
              <input type="password" required placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>Confirm Password</label>
              <input type="password" required placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} />
            </div>

            {error && (
              <div style={{ padding: '9px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.82rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading || !!socialLoading}
              style={{
                padding: '12px', background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: loading ? '#9ca3af' : 'white', border: 'none', borderRadius: '10px',
                fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: !loading ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
              }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6b7280', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', marginTop: '1.25rem', lineHeight: 1.6 }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
