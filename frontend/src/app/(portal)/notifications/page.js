'use client'
import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/api'

const TYPE_STYLES = {
  alert:             { bg: '#fef2f2', border: '#fecaca', icon: '⚠️', color: '#dc2626' },
  achievement:       { bg: '#f0fdf4', border: '#bbf7d0', icon: '🏆', color: '#16a34a' },
  recommendation:    { bg: '#eff6ff', border: '#bfdbfe', icon: '💡', color: '#2563eb' },
  upload_done:       { bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', color: '#16a34a' },
  upload_processing: { bg: '#fffbeb', border: '#fde68a', icon: '🔍', color: '#d97706' },
  upload_failed:     { bg: '#fef2f2', border: '#fecaca', icon: '❌', color: '#dc2626' },
  quiz_ready:        { bg: '#eff6ff', border: '#bfdbfe', icon: '📚', color: '#2563eb' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const d = await apiGet('/student/notifications')
      setNotifs(d.data || [])
      setUnread((d.data || []).filter(n => !n.is_read).length)
    } catch {} finally { setLoading(false) }
  }

  async function markRead(id) {
    await apiPost(`/student/notifications/${id}/read`, {}).catch(() => {})
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(u => Math.max(0, u - 1))
  }

  async function markAllRead() {
    await apiPost('/student/notifications/read-all', {}).catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>
            Notifications {unread > 0 && <span style={{ fontSize: '0.9rem', background: '#dc2626', color: 'white', borderRadius: '20px', padding: '2px 9px', marginLeft: '6px', fontWeight: '700' }}>{unread}</span>}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>Alerts, achievements, and recommendations</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding: '7px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px', background: 'white', color: '#374151', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading...</div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', color: '#9ca3af' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔔</div>
          <div style={{ fontWeight: '600' }}>No notifications yet</div>
          <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Start taking quizzes or upload documents to get personalized alerts.</div>
        </div>
      ) : notifs.map(n => {
        const st = TYPE_STYLES[n.type] || TYPE_STYLES.recommendation
        return (
          <div key={n.id} onClick={() => { if (!n.is_read) markRead(n.id); if (n.link) window.location.href = n.link }}
            style={{
              display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
              padding: '1rem 1.125rem', marginBottom: '8px', borderRadius: '12px',
              background: n.is_read ? 'white' : st.bg,
              border: `1px solid ${n.is_read ? '#f3f4f6' : st.border}`,
              cursor: n.link ? 'pointer' : 'default',
              opacity: n.is_read ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: st.bg, border: `1px solid ${st.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
              {n.icon || st.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: n.is_read ? '500' : '700', color: '#111827' }}>{n.title}</div>
                {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color, marginTop: '4px', flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#374151', marginTop: '2px', lineHeight: 1.5 }}>{n.message}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>{n.created_at}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
