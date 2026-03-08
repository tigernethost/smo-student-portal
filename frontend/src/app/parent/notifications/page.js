'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const TYPE_ICONS = {
  quiz_completed: '📝',
  at_risk: '⚠️',
  goal_achieved: '🏆',
  mastered: '✅',
  low_score: '📉',
  default: '🔔',
}

export default function ParentNotifications() {
  const router = useRouter()
  const [token, setToken] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
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
    }).then(r => r.json()).then(d => {
      setNotifications(d.notifications || [])
      setUnread(d.unread_count || 0)
    }).finally(() => setLoading(false))
  }, [token])

  const markAllRead = async () => {
    await fetch(`${API}/api/parent/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/parent/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <div>
            <div style={{ fontWeight: 700 }}>Notifications</div>
            {unread > 0 && <div style={{ color: '#818cf8', fontSize: '0.75rem' }}>{unread} unread</div>}
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.4rem 0.85rem', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>
            Mark all read
          </button>
        )}
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem' }}>
        {loading && <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading…</div>}

        {!loading && notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <div style={{ color: '#64748b' }}>No notifications yet</div>
          </div>
        )}

        {notifications.map(n => (
          <div key={n.id} style={{ background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.08)', border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.25)'}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{TYPE_ICONS[n.type] || TYPE_ICONS.default}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: '0.9rem', color: n.is_read ? '#94a3b8' : '#e2e8f0' }}>{n.title}</div>
                {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 4 }} />}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem', lineHeight: 1.5 }}>{n.body}</div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                {n.student && <span style={{ color: '#475569', fontSize: '0.75rem' }}>👤 {n.student}</span>}
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>🕐 {n.created_at}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
