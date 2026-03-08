'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const ICONS = {
  quiz_completed: '📝',
  at_risk: '⚠️',
  goal_achieved: '🏆',
  grade_alert: '📉',
  attendance: '📅',
  default: '🔔',
}

export default function ParentNotifications() {
  const router = useRouter()
  const [token, setToken] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('parent_token')
    if (!t) { router.push('/parent/login'); return }
    setToken(t)
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/parent/notifications`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
      .then(r => r.json())
      .then(d => { setNotes(d.notifications || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const markAllRead = async () => {
    await fetch(`${API}/api/parent/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
    setNotes(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unread = notes.filter(n => !n.is_read).length

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/parent/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</div>
            {unread > 0 && <div style={{ color: '#818cf8', fontSize: '0.75rem' }}>{unread} unread</div>}
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '0.35rem 0.75rem', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>
            Mark all read
          </button>
        )}
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
        {loading && <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Loading…</div>}
        {!loading && notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔔</div>
            <div>No notifications yet</div>
          </div>
        )}
        {notes.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '0.5rem', background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.08)', border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.25)'}`, borderRadius: 10 }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{ICONS[n.type] || ICONS.default}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: '0.9rem', color: '#e2e8f0' }}>{n.title}</div>
                {!n.is_read && <span style={{ background: '#6366f1', borderRadius: 10, padding: '0.1rem 0.5rem', fontSize: '0.65rem', color: '#fff', fontWeight: 600, flexShrink: 0 }}>NEW</span>}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0' }}>{n.body}</div>
              <div style={{ color: '#475569', fontSize: '0.75rem' }}>
                {n.student && <span style={{ color: '#818cf8', marginRight: '0.5rem' }}>👤 {n.student}</span>}
                {n.created_at}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
