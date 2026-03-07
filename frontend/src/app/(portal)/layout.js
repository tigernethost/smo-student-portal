'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/subjects', icon: '📚', label: 'My Subjects' },
  { href: '/learning-path', icon: '🌳', label: 'Learning Path' },
  { href: '/analytics', icon: '📊', label: 'Analytics' },
  { href: '/goals', icon: '🎯', label: 'My Goals' },
]

export default function PortalLayout({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarStyle = {
    position: 'fixed', top: 0, left: 0,
    height: '100vh', width: '256px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column',
    zIndex: 50,
    transition: 'transform 0.3s ease',
    transform: sidebarOpen ? 'translateX(0)' : undefined,
    boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: '800', color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
          }}>S</div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', lineHeight: 1.2 }}>SchoolMATE</div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '500' }}>Student Portal</div>
          </div>
        </div>

        {/* Student card */}
        <div style={{
          margin: '1rem',
          padding: '0.875rem',
          background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
          borderRadius: '12px',
          border: '1px solid #e0e7ff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0,
            }}>J</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Juan dela Cruz
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Grade 8 — Section A</div>
            </div>
          </div>
          <div style={{
            marginTop: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Overall Avg</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb' }}>87.4%</span>
          </div>
          <div style={{
            height: '4px', background: '#e0e7ff', borderRadius: '2px', marginTop: '4px',
          }}>
            <div style={{ width: '87.4%', height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.375rem' }}>
            MENU
          </p>
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px',
                textDecoration: 'none', marginBottom: '2px',
                background: active ? 'linear-gradient(135deg, #eff6ff, #f5f3ff)' : 'transparent',
                color: active ? '#2563eb' : '#4b5563',
                fontWeight: active ? '600' : '500',
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                border: active ? '1px solid #e0e7ff' : '1px solid transparent',
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                {label}
                {active && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', background: '#2563eb', borderRadius: '50%' }} />}
              </Link>
            )
          })}

          <div style={{ height: '1px', background: '#f3f4f6', margin: '0.75rem 0.75rem' }} />
          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.375rem' }}>
            ACCOUNT
          </p>
          {[
            { href: '/notifications', icon: '🔔', label: 'Notifications' },
            { href: '/settings', icon: '⚙️', label: 'Settings' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px',
              textDecoration: 'none', marginBottom: '2px',
              color: '#4b5563', fontWeight: '500', fontSize: '0.875rem',
            }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #f3f4f6' }}>
          <button style={{
            width: '100%', padding: '9px 12px',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', color: '#dc2626',
            fontSize: '0.875rem', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: '64px',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center',
          padding: '0 1.75rem',
          gap: '1rem',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#f9fafb', border: '1px solid #e5e7eb',
              borderRadius: '10px', padding: '8px 14px',
              maxWidth: '320px',
            }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Search subjects, topics..."
                style={{
                  border: 'none', background: 'none', outline: 'none',
                  fontSize: '0.85rem', color: '#374151', fontFamily: 'inherit',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* School year badge */}
            <div style={{
              padding: '5px 12px', background: '#eff6ff',
              borderRadius: '8px', border: '1px solid #bfdbfe',
              fontSize: '0.75rem', fontWeight: '600', color: '#1d4ed8',
            }}>
              S.Y. 2025–2026 · Q3
            </div>

            {/* Notifications */}
            <button style={{
              position: 'relative', width: '38px', height: '38px',
              background: '#f9fafb', border: '1px solid #e5e7eb',
              borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}>
              🔔
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%',
                border: '2px solid white',
              }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
            }}>J</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.75rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
