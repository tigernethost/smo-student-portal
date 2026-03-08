'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { href: '/subjects',      icon: '📚', label: 'My Subjects' },
  { href: '/upload',        icon: '📤', label: 'Upload',       highlight: true },
  { href: '/quiz',          icon: '🧠', label: 'AI Quiz',      highlight: true },
  { href: '/learning-path', icon: '🗺️', label: 'Learning Path' },
  { href: '/analytics',     icon: '📊', label: 'Analytics' },
  { href: '/goals',         icon: '🎯', label: 'My Goals' },
  { href: '/notifications', icon: '🔔', label: 'Notifications', badge: true },
  { href: '/settings',      icon: '⚙️', label: 'Settings' },
]

const PLAN_BADGE = {
  free:      { label: 'Free',   bg: '#f3f4f6', color: '#6b7280' },
  basic:     { label: 'Basic',  bg: '#eff6ff', color: '#2563eb' },
  pro:       { label: 'Pro',    bg: '#f5f3ff', color: '#7c3aed' },
  b2b_basic: { label: 'B2B',   bg: '#f0fdf4', color: '#16a34a' },
  b2b_ai:    { label: 'B2B AI',bg: '#f0fdf4', color: '#16a34a' },
}

// Bottom nav items for mobile (most important 5)
const BOTTOM_NAV = [
  { href: '/dashboard',  icon: '🏠', label: 'Home' },
  { href: '/upload',     icon: '📤', label: 'Upload' },
  { href: '/quiz',       icon: '🧠', label: 'Quiz' },
  { href: '/analytics',  icon: '📊', label: 'Stats' },
  { href: '/settings',   icon: '⚙️', label: 'More' },
]

export default function PortalLayout({ children }) {
  const pathname       = usePathname()
  const [user,   setUser]   = useState({ name: 'Student', grade_level: 8 })
  const [unread, setUnread] = useState(0)
  const [quota,  setQuota]  = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.name) setUser(d); if (d.quota) setQuota(d.quota) }).catch(() => {})

    fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setUnread(d.unread_notifications || 0); if (d.quota) setQuota(d.quota) }).catch(() => {})
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Close sidebar on outside click
  useEffect(() => {
    function handler(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setSidebarOpen(false)
    }
    if (sidebarOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sidebarOpen])

  function logout() {
    const token = localStorage.getItem('token')
    fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const initials   = user.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'ST'
  const plan       = user.plan || 'free'
  const planBadge  = PLAN_BADGE[plan] || PLAN_BADGE.free
  const quotaWarn  = quota && !quota.is_unlimited && quota.pct_used >= 80

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="SchoolMATE AI" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', background: '#000', padding: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', fontFamily: "'Source Code Pro', monospace", lineHeight: 1.2 }}>
              SchoolMATE <span style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.58rem', color: '#9ca3af', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Student Platform</div>
          </div>
        </div>
      </div>

      {/* Student card */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>Grade {user.grade_level || '—'}{user.strand ? ` · ${user.strand}` : ''}</div>
          </div>
          <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '2px 6px', borderRadius: '6px', background: planBadge.bg, color: planBadge.color, flexShrink: 0 }}>{planBadge.label}</span>
        </div>
        {quota && !quota.is_unlimited && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>AI Actions</span>
              <span style={{ fontSize: '0.62rem', color: quotaWarn ? '#dc2626' : '#6b7280', fontWeight: '600' }}>{quota.used}/{quota.limit}</span>
            </div>
            <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, quota.pct_used)}%`, background: quota.pct_used >= 90 ? '#dc2626' : quota.pct_used >= 70 ? '#f59e0b' : '#2563eb', borderRadius: '2px', transition: 'width 0.5s' }} />
            </div>
            {quotaWarn && (
              <Link href="/upgrade" style={{ display: 'block', marginTop: '5px', fontSize: '0.62rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600', textAlign: 'center', padding: '3px 0', background: '#eff6ff', borderRadius: '5px' }}>⚡ Upgrade for more AI actions</Link>
            )}
          </div>
        )}
        {quota && quota.is_unlimited && (
          <div style={{ marginTop: '6px', fontSize: '0.62rem', color: '#7c3aed', fontWeight: '600', textAlign: 'center' }}>✨ Unlimited AI Actions</div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '9px', marginBottom: '2px', textDecoration: 'none', background: active ? 'linear-gradient(135deg,#eff6ff,#f5f3ff)' : item.highlight ? '#fafafa' : 'transparent', border: active ? '1px solid #e0e7ff' : item.highlight ? '1px solid #f3f4f6' : '1px solid transparent', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '0.83rem', fontWeight: active ? '700' : '500', color: active ? '#2563eb' : '#374151', flex: 1 }}>{item.label}</span>
              {item.badge && unread > 0 && <span style={{ background: '#dc2626', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' }}>{unread}</span>}
              {item.highlight && !active && <span style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', fontSize: '0.58rem', fontWeight: '700', padding: '1px 5px', borderRadius: '4px' }}>AI</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
        <button onClick={logout} style={{ width: '100%', padding: '8px', border: '1px solid #f3f4f6', borderRadius: '9px', background: 'white', color: '#6b7280', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <span>👋</span> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .portal-sidebar { display: none !important; }
          .portal-main { margin-left: 0 !important; padding: 4.5rem 1rem 6rem !important; }
          .portal-topbar { display: flex !important; }
          .portal-bottomnav { display: flex !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .portal-sidebar { width: 200px !important; }
          .portal-main { margin-left: 200px !important; padding: 1.5rem !important; }
        }
        @media (min-width: 1025px) {
          .portal-topbar { display: none !important; }
          .portal-bottomnav { display: none !important; }
          .portal-overlay { display: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'var(--font-body)' }}>

        {/* ── Desktop/Tablet Sidebar ── */}
        <aside className="portal-sidebar" style={{ width: '240px', background: 'white', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50, boxShadow: '0 0 20px rgba(0,0,0,0.06)' }}>
          <SidebarContent />
        </aside>

        {/* ── Mobile Overlay Sidebar ── */}
        {sidebarOpen && (
          <div className="portal-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 98, display: 'none' }} />
        )}
        <aside ref={sidebarRef} style={{ width: '260px', background: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 99, top: 0, left: 0, boxShadow: '4px 0 24px rgba(0,0,0,0.15)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)' }}>
          <SidebarContent />
        </aside>

        {/* ── Mobile Top Bar ── */}
        <div className="portal-topbar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: '54px', background: 'white', borderBottom: '1px solid #f3f4f6', zIndex: 90, alignItems: 'center', padding: '0 1rem', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #f3f4f6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#000', padding: '2px', objectFit: 'contain' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: '800', fontFamily: "'Source Code Pro', monospace" }}>
              SchoolMATE <span style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
            </span>
          </div>
          {unread > 0 && (
            <Link href="/notifications" style={{ position: 'relative', padding: '6px', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.1rem' }}>🔔</span>
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '14px', height: '14px', background: '#dc2626', color: 'white', fontSize: '0.6rem', fontWeight: '700', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
            </Link>
          )}
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.78rem', flexShrink: 0 }}>{initials}</div>
        </div>

        {/* ── Main Content ── */}
        <main className="portal-main" style={{ marginLeft: '240px', flex: 1, padding: '2rem', minHeight: '100vh' }}>
          {children}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="portal-bottomnav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', background: 'white', borderTop: '1px solid #f3f4f6', zIndex: 90, alignItems: 'center', justifyContent: 'space-around', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}>
          {BOTTOM_NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none', padding: '6px 12px', borderRadius: '10px', background: active ? '#eff6ff' : 'transparent', minWidth: '54px', position: 'relative' }}>
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: active ? '700' : '500', color: active ? '#2563eb' : '#6b7280' }}>{item.label}</span>
                {item.badge && unread > 0 && <span style={{ position: 'absolute', top: '4px', right: '10px', width: '14px', height: '14px', background: '#dc2626', color: 'white', fontSize: '0.58rem', fontWeight: '700', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
