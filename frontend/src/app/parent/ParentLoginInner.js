'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ParentLoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode]       = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ name:'', email:'', password:'', link_code:'', relationship:'Guardian' })

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) { setForm(f=>({...f, link_code:code})); setMode('register') }
    const token = localStorage.getItem('parent_token')
    if (token) router.replace('/parent/dashboard')
  }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const endpoint = mode==='login' ? '/api/parent/auth/login' : '/api/parent/auth/register'
      const body = mode==='login' ? {email:form.email,password:form.password} : form
      const res  = await fetch(API+endpoint, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error||data.message||'Something went wrong')
      localStorage.setItem('parent_token', data.token)
      localStorage.setItem('parent_data', JSON.stringify(data.parent))
      router.replace('/parent/dashboard')
    } catch(err) { setError(err.message) } finally { setLoading(false) }
  }

  const inp = { style:{ width:'100%', padding:'12px 16px', background:'#1e293b', border:'1px solid #334155', borderRadius:10, color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box' } }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>👨‍👩‍👧‍👦</div>
          <div style={{ fontSize:24, fontWeight:700, color:'#f1f5f9' }}>SchoolMATE</div>
          <div style={{ fontSize:14, color:'#64748b', marginTop:4 }}>Parent Portal</div>
        </div>
        <div style={{ background:'#1e293b', borderRadius:16, padding:32, border:'1px solid #334155' }}>
          <div style={{ display:'flex', gap:0, marginBottom:28, background:'#0f172a', borderRadius:10, padding:4 }}>
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('')}}
                style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer', fontSize:14, fontWeight:600,
                  background:mode===m?'#3b82f6':'transparent', color:mode===m?'#fff':'#64748b' }}>
                {m==='login'?'Sign In':'Register'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode==='register' && <input {...inp} placeholder="Full Name" value={form.name} onChange={e=>set('name',e.target.value)} required />}
            <input {...inp} type="email" placeholder="Email Address" value={form.email} onChange={e=>set('email',e.target.value)} required />
            <input {...inp} type="password" placeholder="Password" value={form.password} onChange={e=>set('password',e.target.value)} required />
            {mode==='register' && (<>
              <div>
                <input {...inp} placeholder="Student Link Code (e.g. AB12CD34)" value={form.link_code}
                  onChange={e=>set('link_code',e.target.value.toUpperCase())} required
                  style={{...inp.style, fontFamily:'monospace', letterSpacing:2}} />
                <div style={{ fontSize:12, color:'#64748b', marginTop:6 }}>💡 Ask your child for their code from Settings → Parent Access</div>
              </div>
              <select value={form.relationship} onChange={e=>set('relationship',e.target.value)} style={inp.style}>
                {['Mother','Father','Guardian','Grandparent','Other'].map(r=><option key={r}>{r}</option>)}
              </select>
            </>)}
            {error && <div style={{ background:'#450a0a', border:'1px solid #dc2626', borderRadius:8, padding:'10px 14px', color:'#fca5a5', fontSize:13 }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ padding:13, background:loading?'#1e40af':'#3b82f6', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:loading?'not-allowed':'pointer', marginTop:4 }}>
              {loading ? '...' : mode==='login' ? 'Sign In' : 'Create Account & Link Child'}
            </button>
          </form>
        </div>
        <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#475569' }}>
          Are you a student? <a href="/" style={{ color:'#3b82f6', textDecoration:'none' }}>Go to Student Portal →</a>
        </div>
      </div>
    </div>
  )
}
