'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Nunito', sans-serif; }
  .reg-input {
    width: 100%; background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 12px; padding: 12px 16px; color: #1a1a2e;
    font-size: 15px; outline: none; transition: border-color .2s;
    font-family: 'Nunito', sans-serif;
  }
  .reg-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,.12); }
  .social-btn2 {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: 8px; border-radius: 12px; padding: 12px 8px;
    font-size: 14px; font-weight: 700; cursor: pointer; border: none;
    transition: all .15s; font-family: 'Nunito', sans-serif;
  }
  .social-btn2:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
  .social-btn2:disabled { opacity: .6; transform: none; cursor: not-allowed; }
  .submit-btn {
    width: 100%; background: linear-gradient(135deg, #6c63ff, #a78bfa);
    border: none; border-radius: 12px; padding: 14px;
    color: #fff; font-size: 16px; font-weight: 800; cursor: pointer;
    transition: all .15s; font-family: 'Nunito', sans-serif; margin-top: 4px;
  }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,.35); }
  .submit-btn:disabled { opacity: .6; transform: none; cursor: not-allowed; }
`

function RegisterContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '', link_code: params.get('code') || '', relationship: 'Guardian' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
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
    } catch { setError('Network error.'); setLoading(false) }
  }

  const socialSignUp = async (provider) => {
    setSocialLoading(provider); setError('')
    try {
      const res = await fetch(`${API}/api/parent/auth/social/${provider}`, { headers: { Accept: 'application/json' } })
      const data = await res.json()
      if (data.redirect_url) window.location.href = data.redirect_url
      else { setError('Could not start sign-up.'); setSocialLoading('') }
    } catch { setError('Network error.'); setSocialLoading('') }
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f4ff 0%, #faf5ff 50%, #fff5f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ position: 'fixed', top: -80, right: -60, width: 320, height: 320, background: 'radial-gradient(circle,rgba(108,99,255,.12) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: -80, left: -40, width: 300, height: 300, background: 'radial-gradient(circle,rgba(167,139,250,.1) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10, boxShadow: '0 8px 24px rgba(108,99,255,.3)' }}>👨‍👩‍👧‍👦</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a2e', margin: 0 }}>Create Parent Account</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Stay connected with your child's learning</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 4px 32px rgba(0,0,0,.08)', border: '1px solid rgba(255,255,255,.8)' }}>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>⚠️ {error}</div>
            )}

            {/* Social */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Quick sign up</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="social-btn2" onClick={() => socialSignUp('google')} disabled={!!socialLoading}
                  style={{ background: '#fff', border: '1.5px solid #e5e7eb', color: '#1a1a2e', opacity: socialLoading === 'facebook' ? .5 : 1 }}>
                  {socialLoading === 'google' ? '⏳' : <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C40.9 34 44 29 44 24c0-1.3-.1-2.7-.4-4z"/></svg>}
                  {socialLoading === 'google' ? 'Wait...' : 'Google'}
                </button>
                <button className="social-btn2" onClick={() => socialSignUp('facebook')} disabled={!!socialLoading}
                  style={{ background: '#1877F2', color: '#fff', opacity: socialLoading === 'google' ? .5 : 1 }}>
                  {socialLoading === 'facebook' ? '⏳' : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                  {socialLoading === 'facebook' ? 'Wait...' : 'Facebook'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Social sign-up creates your account — link your child from dashboard</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
              <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>or register with email</span>
              <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
            </div>

            {/* Info banner */}
            <div style={{ background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)', border: '1px solid #c4b5fd', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <p style={{ color: '#5b21b6', fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>
                Ask your child to go to <strong>Settings → Generate Parent Link Code</strong> in their SchoolMATE app.
              </p>
            </div>

            <form onSubmit={submit}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Maria Santos' },
                { key: 'email', label: 'Email Address', type: 'email', placeholder: 'parent@email.com' },
                { key: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 8 characters' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{f.label}</label>
                  <input className="reg-input" type={f.type} required value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Relationship to Child</label>
                <select className="reg-input" value={form.relationship} onChange={e => set('relationship', e.target.value)} style={{ cursor: 'pointer' }}>
                  {['Mother','Father','Guardian','Grandparent','Other'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Child's Parent Link Code</label>
                <input className="reg-input" type="text" required placeholder="e.g. AB12CD34"
                  value={form.link_code} onChange={e => set('link_code', e.target.value.toUpperCase())} maxLength={12}
                  style={{ fontFamily: 'monospace', fontSize: 17, letterSpacing: '0.12em' }} />
                <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Enter exactly as shown on your child's app</p>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account & Link Child →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
              Already have an account?{' '}<Link href="/parent/login" style={{ color: '#6c63ff', fontWeight: 800, textDecoration: 'none' }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ParentRegister() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f0f4ff', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#6b7280' }}>Loading...</p></div>}>
      <RegisterContent />
    </Suspense>
  )
}
