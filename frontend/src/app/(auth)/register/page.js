'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', schoolCode: '', studentId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const inp = { width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'9px', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', color:'#111827', background:'white' }
  const lbl = { display:'block', fontSize:'0.78rem', fontWeight:'600', color:'#374151', marginBottom:'5px' }

  return (
    <div style={{ background:'white', borderRadius:'20px', padding:'2rem 2.25rem', width:'100%', maxWidth:'460px', boxShadow:'0 20px 60px rgba(0,0,0,0.1)', border:'1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
        <div style={{ width:'48px', height:'48px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius:'13px', margin:'0 auto 0.875rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', fontWeight:'800', color:'white', boxShadow:'0 6px 18px rgba(37,99,235,0.3)' }}>S</div>
        <h1 style={{ fontSize:'1.3rem', fontWeight:'700', color:'#111827', marginBottom:'3px' }}>Create your account</h1>
        <p style={{ fontSize:'0.82rem', color:'#6b7280' }}>Join your school's student portal</p>
      </div>

      {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'9px 13px', color:'#dc2626', fontSize:'0.82rem', marginBottom:'1rem' }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem', marginBottom:'0.875rem' }}>
          {[['Full Name','name','text','Juan dela Cruz'],['Student ID','studentId','text','2025-08-001'],['School Code','schoolCode','text','SCHOOL-001'],['Email','email','email','student@school.edu.ph']].map(([label,key,type,ph]) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <input type={type} required placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom:'0.875rem' }}>
          <label style={lbl}>Password</label>
          <input type="password" required placeholder="Min. 8 characters" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
        </div>
        <div style={{ marginBottom:'1.25rem' }}>
          <label style={lbl}>Confirm Password</label>
          <input type="password" required placeholder="Re-enter password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
        </div>
        <button type="submit" disabled={loading} style={{ width:'100%', padding:'11px', background:loading?'#93c5fd':'linear-gradient(135deg,#2563eb,#7c3aed)', color:'white', border:'none', borderRadius:'10px', fontSize:'0.9rem', fontWeight:'600', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(37,99,235,0.3)' }}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
      </form>

      <p style={{ textAlign:'center', fontSize:'0.78rem', color:'#9ca3af', marginTop:'1.25rem' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color:'#2563eb', textDecoration:'none', fontWeight:'600' }}>Sign in</Link>
      </p>
    </div>
  )
}
