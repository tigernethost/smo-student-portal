'use client'
import { Suspense } from 'react'
import ParentLoginInner from './ParentLoginInner'

export default function ParentLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'#64748b' }}>Loading...</div>
      </div>
    }>
      <ParentLoginInner />
    </Suspense>
  )
}
