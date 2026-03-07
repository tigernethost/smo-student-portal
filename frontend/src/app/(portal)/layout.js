'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { href: '/subjects',      icon: '📚', label: 'My Subjects' },
  { href: '/upload',        icon: '📤', label: 'Upload',        highlight: true },
  { href: '/quiz',          icon: '🧠', label: 'AI Quiz',        highlight: true },
  { href: '/learning-path', icon: '🗺️', label: 'Learning Path' },
  { href: '/analytics',     icon: '📊', label: 'Analytics' },
  { href: '/goals',         icon: '🎯', label: 'My Goals' },
  { href: '/notifications', icon: '🔔', label: 'Notifications',  badge: true },
  { href: '/settings',      icon: '⚙️', label: 'Settings' },
]

const PLAN_BADGE = {
  free:      { label: 'Free',    bg: '#f3f4f6', color: '#6b7280' },
  basic:     { label: 'Basic',   bg: '#eff6ff', color: '#2563eb' },
  pro:       { label: 'Pro',     bg: '#f5f3ff', color: '#7c3aed' },
  b2b_basic: { label: 'B2B',    bg: '#f0fdf4', color: '#16a34a' },
  b2b_ai:    { label: 'B2B AI', bg: '#f0fdf4', color: '#16a34a' },
}

export default function PortalLayout({ children }) {
  const pathname  = usePathname()
  const [user,   setUser]   = useState({ name: 'Student', grade_level: 8 })
  const [unread, setUnread] = useState(0)
  const [quota,  setQuota]  = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.name) setUser(d)
        if (d.quota) setQuota(d.quota)
      }).catch(() => {})

    fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setUnread(d.unread_notifications || 0)
        if (d.quota) setQuota(d.quota)
      }).catch(() => {})
  }, [])

  function logout() {
    const token = localStorage.getItem('token')
    fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const initials  = user.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'ST'
  const plan      = user.plan || 'free'
  const planBadge = PLAN_BADGE[plan] || PLAN_BADGE.free
  const quotaWarn = quota && !quota.is_unlimited && quota.pct_used >= 80

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: 'white', borderRight: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50,
        boxShadow: '0 0 20px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="SchoolMATE AI" style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', background: '#000', padding: '2px' }} />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#111827', fontFamily: "'Source Code Pro', monospace", letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                SchoolMATE <span style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Student Intelligent Platform</div>
            </div>
          </div>
        </div>

        {/* Student card */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>Grade {user.grade_level || '—'} {user.strand ? `· ${user.strand}` : ''}</div>
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: '700', padding: '2px 6px', borderRadius: '6px', background: planBadge.bg, color: planBadge.color, flexShrink: 0 }}>{planBadge.label}</span>
          </div>

          {/* Quota bar */}
          {quota && !quota.is_unlimited && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>AI Actions</span>
                <span style={{ fontSize: '0.62rem', color: quotaWarn ? '#dc2626' : '#6b7280', fontWeight: '600' }}>
                  {quota.used}/{quota.limit}
                </span>
              </div>
              <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, quota.pct_used)}%`,
                  background: quota.pct_used >= 90 ? '#dc2626' : quota.pct_used >= 70 ? '#f59e0b' : '#2563eb',
                  borderRadius: '2px', transition: 'width 0.5s'
                }} />
              </div>
              {quotaWarn && (
                <Link href="/upgrade" style={{ display: 'block', marginTop: '5px', fontSize: '0.62rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600', textAlign: 'center', padding: '3px 0', background: '#eff6ff', borderRadius: '5px' }}>
                  ⚡ Upgrade for more AI actions
                </Link>
              )}
            </div>
          )}
          {quota && quota.is_unlimited && (
            <div style={{ marginTop: '6px', fontSize: '0.62rem', color: '#7c3aed', fontWeight: '600', textAlign: 'center' }}>✨ Unlimited AI Actions</div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '9px', marginBottom: '2px',
                textDecoration: 'none',
                background: active ? 'linear-gradient(135deg,#eff6ff,#f5f3ff)' : item.highlight ? '#fafafa' : 'transparent',
                border: active ? '1px solid #e0e7ff' : item.highlight ? '1px solid #f3f4f6' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: active ? '700' : '500', color: active ? '#2563eb' : '#374151', flex: 1 }}>{item.label}</span>
                {item.badge && unread > 0 && (
                  <span style={{ background: '#dc2626', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' }}>{unread}</span>
                )}
                {item.highlight && !active && (
                  <span style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', fontSize: '0.6rem', fontWeight: '700', padding: '1px 5px', borderRadius: '4px' }}>AI</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={logout} style={{ width: '100%', padding: '8px', border: '1px solid #f3f4f6', borderRadius: '9px', background: 'white', color: '#6b7280', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span>👋</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '2rem', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
