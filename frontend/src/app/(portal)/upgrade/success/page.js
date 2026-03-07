'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function SuccessContent() {
  const params = useSearchParams()
  const source = params.get('source')
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    setTimeout(() => {
      fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.quota) setQuota(d.quota) })
        .catch(() => {})
    }, 1500)
  }, [])

  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
        Payment Successful!
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        {source === 'parent'
          ? "Your parent's payment has been processed. Your plan has been upgraded!"
          : "Your subscription is now active. You're all set to learn!"}
      </p>
      {quota && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontWeight: '700', color: '#16a34a', marginBottom: '4px' }}>✅ Plan Active: {quota.plan?.toUpperCase()}</div>
          <div style={{ color: '#166534', fontSize: '0.85rem' }}>
            {quota.is_unlimited ? 'Unlimited AI actions available' : `${quota.remaining} AI actions remaining this month`}
          </div>
        </div>
      )}
      <Link href="/dashboard" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', textDecoration: 'none' }}>
        Go to Dashboard →
      </Link>
    </div>
  )
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
