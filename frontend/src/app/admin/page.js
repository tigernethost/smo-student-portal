'use client'
import { useEffect } from 'react'

export default function AdminRedirect() {
  useEffect(() => {
    window.location.replace('/api/admin')
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Redirecting to admin panel...</div>
      </div>
    </div>
  )
}
