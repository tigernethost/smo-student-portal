'use client'
import { useState, useEffect } from 'react'

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  function load() {
    fetch('/api/student/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d : d.data || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function markRead(id) {
    await fetch(`/api/student/notifications/${id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setNotifs(ns => ns.map(n => n.id === id ? {...n, is_read: true} : n))
  }

  async function markAll() {
    await fetch('/api/student/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setNotifs(ns => ns.map(n => ({...n, is_read: true})))
  }

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>🔔 Notifications</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '9px', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading...</div> : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔔</div>
          <div style={{ fontWeight: '600' }}>All caught up!</div>
          <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>No notifications yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: n.is_read ? 'white' : '#eff6ff', borderRadius: '12px', border: `1px solid ${n.is_read ? '#f3f4f6' : '#bfdbfe'}`, cursor: n.is_read ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{n.icon || '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: n.is_read ? '500' : '700', color: '#111827' }}>{n.title}</div>
                  {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: '4px' }} />}
                </div>
                {n.message && <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px', lineHeight: 1.4 }}>{n.message}</div>}
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>{new Date(n.created_at).toLocaleDateString('en-PH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
