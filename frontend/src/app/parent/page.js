'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ParentIndex() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('parent_token')
    if (token) router.replace('/parent/dashboard')
    else router.replace('/parent/login')
  }, [])
  return (
    <div style={{ minHeight:'100vh', background:'#f8f7ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#9ca3af', fontFamily:'sans-serif' }}>Loading...</p>
    </div>
  )
}
