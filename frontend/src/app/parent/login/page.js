'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ParentLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/parent/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
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
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Parent Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>SchoolMATE AI — Monitor your child's progress</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '2rem', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1.5rem' }}>Sign in to your account</h2>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="parent@email.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#475569' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, padding: '0.875rem', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link href="/parent/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Register here</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
            Are you a student?{' '}
            <Link href="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Student login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
