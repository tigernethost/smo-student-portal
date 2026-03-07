'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UpgradeSuccessPage() {
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    // Small delay to let webhook process
    setTimeout(() => {
      fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.quota) setQuota(d.quota) })
        .catch(() => {})
    }, 2000)
  }, [])

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: '0 0 12px 0' }}>Payment Successful!</h1>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Your plan has been upgraded. You now have access to more AI actions to power your learning.
      </p>
      {quota && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '700' }}>
            {quota.is_unlimited ? '✨ Unlimited AI Actions activated!' : `⚡ ${quota.limit} AI actions / month activated`}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/dashboard" style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
          Go to Dashboard
        </Link>
        <Link href="/quiz" style={{ padding: '11px 22px', background: '#f3f4f6', color: '#374151', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
          Start AI Quiz 🧠
        </Link>
      </div>
    </div>
  )
}
