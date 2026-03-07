'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    border: '1px solid rgba(0,0,0,0.06)',
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    color: '#111827',
    background: 'white',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    letterSpacing: '0.01em',
  }

  return (
    <div style={cardStyle}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '52px', height: '52px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          borderRadius: '14px',
          margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', fontWeight: '800', color: 'white',
          boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
        }}>S</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Sign in to your student portal
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '10px 14px',
          color: '#dc2626', fontSize: '0.85rem',
          marginBottom: '1.25rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="student@school.edu.ph"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            id="remember"
            checked={form.remember}
            onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
            style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <label htmlFor="remember" style={{ fontSize: '0.85rem', color: '#6b7280', cursor: 'pointer' }}>
            Keep me signed in
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'opacity 0.2s, transform 0.1s',
            boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f0f9ff',
        borderRadius: '10px',
        border: '1px solid #bae6fd',
      }}>
        <p style={{ fontSize: '0.8rem', color: '#0369a1', textAlign: 'center' }}>
          🔒 Your account is managed by your school. Contact your teacher if you need access.
        </p>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af', marginTop: '1.25rem' }}>
        New student?{' '}
        <Link href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
          Create account
        </Link>
      </p>
    </div>
  )
}
