'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/subjects', icon: '📚', label: 'My Subjects' },
  { href: '/upload', icon: '📤', label: 'Upload', highlight: true },
  { href: '/quiz', icon: '🧠', label: 'AI Quiz', highlight: true },
  { href: '/learning-path', icon: '🗺️', label: 'Learning Path' },
  { href: '/analytics', icon: '📊', label: 'Analytics' },
  { href: '/goals', icon: '🎯', label: 'My Goals' },
  { href: '/notifications', icon: '🔔', label: 'Notifications', badge: true },
]

export default function PortalLayout({ children }) {
  const pathname = usePathname()
  const [user, setUser] = useState({ name: 'Student', grade_level: 8 })
  const [unread, setUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
    fetch('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).then(r => r.json()).then(d => {
      setUnread(d.unread_notifications || 0)
      if (d.name) setUser(d)
    }).catch(() => {})
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      if (d.name) setUser(d)
    }).catch(() => {})
  }, [])

  function logout() {
    const token = localStorage.getItem('token')
    fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: 'white', borderRight: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50,
        boxShadow: '0 0 20px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '0.9rem' }}>S</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111827' }}>SchoolMATE</div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: '500' }}>Student Portal</div>
            </div>
          </div>
        </div>

        {/* Student card */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>{initials}</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111827' }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>Grade {user.grade_level || '—'} {user.strand ? `· ${user.strand}` : ''}</div>
            </div>
          </div>
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
