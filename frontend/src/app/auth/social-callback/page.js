'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SocialCallbackInner() {
  const params = useSearchParams()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const token = params.get('token')
    const redirect = params.get('redirect') || '/dashboard'
    const error = params.get('error')

    if (error) {
      setStatus('Login failed: ' + decodeURIComponent(error))
      setTimeout(() => { window.location.href = '/login?error=' + encodeURIComponent(error) }, 2000)
      return
    }

    if (token) {
      localStorage.setItem('token', token)
      setStatus('Signed in! Redirecting...')
      window.location.href = redirect
    } else {
      setStatus('Something went wrong. Redirecting to login...')
      setTimeout(() => { window.location.href = '/login' }, 2000)
    }
  }, [params])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>{status}</p>
      </div>
    </div>
  )
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SocialCallbackInner />
    </Suspense>
  )
}
