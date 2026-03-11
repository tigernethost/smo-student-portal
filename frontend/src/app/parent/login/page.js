'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
  .parent-input {
    width: 100%; background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 12px; padding: 12px 16px; color: #1a1a2e;
    font-size: 15px; outline: none; transition: border-color .2s;
    font-family: 'Nunito', sans-serif;
  }
  .parent-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,.12); }
  .social-btn {
    width: 100%; display: flex; align-items: center; justify-content: center;
    gap: 10px; border-radius: 12px; padding: 13px 20px;
    font-size: 15px; font-weight: 700; cursor: pointer; border: none;
    transition: all .15s; font-family: 'Nunito', sans-serif;
  }
  .social-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,.12); }
  .social-btn:disabled { opacity: .6; transform: none; cursor: not-allowed; }
  .signin-btn {
    width: 100%; background: linear-gradient(135deg, #6c63ff, #a78bfa);
    border: none; border-radius: 12px; padding: 14px;
    color: #fff; font-size: 16px; font-weight: 800; cursor: pointer;
    transition: all .15s; font-family: 'Nunito', sans-serif;
  }
  .signin-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,.35); }
  .signin-btn:disabled { opacity: .6; transform: none; cursor: not-allowed; }
`

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')

  useEffect(() => {
    if (params.get('error') === 'oauth_failed') setError('Social sign-in failed. Please try again.')
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
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
    } catch { setError('Network error. Please try again.'); setLoading(false) }
  }

  const socialLogin = async (provider) => {
    setSocialLoading(provider); setError('')
    try {
      const res = await fetch(`${API}/api/parent/auth/social/${provider}`, { headers: { Accept: 'application/json' } })
      const data = await res.json()
      if (data.redirect_url) window.location.href = data.redirect_url
      else { setError('Could not start sign-in.'); setSocialLoading('') }
    } catch { setError('Network error.'); setSocialLoading('') }
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f4ff 0%, #faf5ff 50%, #fff5f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Nunito', sans-serif" }}>

        {/* Decorative blobs */}
        <div style={{ position: 'fixed', top: -120, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(108,99,255,.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: -100, left: -60, width: 350, height: 350, background: 'radial-gradient(circle, rgba(236,72,153,.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 12, boxShadow: '0 8px 24px rgba(108,99,255,.3)' }}>👨‍👩‍👧‍👦</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a2e', margin: 0, letterSpacing: '-0.5px' }}>Parent Portal</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>SchoolMATE AI · Monitor your child's progress</p>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 32px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)', border: '1px solid rgba(255,255,255,.8)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 20 }}>Welcome back 👋</h2>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Social buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <button className="social-btn" onClick={() => socialLogin('google')} disabled={!!socialLoading}
                style={{ background: '#fff', border: '1.5px solid #e5e7eb', color: '#1a1a2e', opacity: socialLoading === 'facebook' ? .5 : 1 }}>
                {socialLoading === 'google' ? '⏳ Redirecting...' : (<>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C40.9 34 44 29 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
                  Continue with Google
                </>)}
              </button>
              <button className="social-btn" onClick={() => socialLogin('facebook')} disabled={!!socialLoading}
                style={{ background: '#1877F2', color: '#fff', opacity: socialLoading === 'google' ? .5 : 1 }}>
                {socialLoading === 'facebook' ? '⏳ Redirecting...' : (<>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Continue with Facebook
                </>)}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
              <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
            </div>

            {/* Email form */}
            <form onSubmit={submit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Email Address</label>
                <input className="parent-input" type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="parent@email.com" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Password</label>
                <input className="parent-input" type="password" required value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="••••••••" />
              </div>
              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
              No account?{' '}<Link href="/parent/register" style={{ color: '#6c63ff', fontWeight: 800, textDecoration: 'none' }}>Create one</Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#9ca3af' }}>
              Are you a student?{' '}<Link href="/login" style={{ color: '#9ca3af', fontWeight: 700, textDecoration: 'none' }}>Student login →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ParentLogin() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f0f4ff', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#6b7280' }}>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
