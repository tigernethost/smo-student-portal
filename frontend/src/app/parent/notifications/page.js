'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''
const css = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing: border-box; margin:0; padding:0; } body { font-family:'Nunito',sans-serif; }`

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('parent_token') : ''
  return { Authorization: `Bearer ${t}`, Accept: 'application/json', 'Content-Type': 'application/json' }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('parent_token')
    if (!token) { router.push('/parent/login'); return }
    fetch(API + '/api/parent/notifications', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setNotifs(d.notifications || []); setLoading(false) })
  }, [])

  const readAll = async () => {
    await fetch(API + '/api/parent/notifications/read-all', { method: 'POST', headers: authHeaders() })
    setNotifs(n => n.map(x => ({...x, is_read: true})))
  }

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Nunito',sans-serif" }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #f0eefd', padding: '0 20px', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 8px rgba(108,99,255,.06)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 14 }}>
            <button onClick={() => router.push('/parent/dashboard')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>←</button>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 900, color: '#1a1a2e' }}>Notifications</h1>
              {unread > 0 && <p style={{ fontSize: 12, color: '#6c63ff', fontWeight: 700 }}>{unread} unread</p>}
            </div>
            {unread > 0 && (
              <button onClick={readAll} style={{ marginLeft: 'auto', background: '#ede9fe', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#6c63ff', cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>
        </header>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px' }}>
          {loading ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '60px 0' }}>Loading…</p>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <p style={{ color: '#9ca3af', fontSize: 15 }}>No notifications yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifs.map((n, i) => (
                <div key={i} style={{ background: n.is_read ? '#fff' : '#f5f3ff', borderRadius: 14, padding: '16px 18px', borderLeft: `3px solid ${n.is_read ? '#e5e7eb' : '#6c63ff'}`, border: '1px solid #f0eefd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af' }}>{n.created_at}</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
