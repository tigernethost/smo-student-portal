'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LearningPathPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    fetch('/api/student/learning-path', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading learning path...</div>

  const subjects = data?.subjects || []
  const recommendations = data?.recommendations || []

  return (
    <>
      <style>{`
        .lp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 700px) { .lp-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>🗺️ Learning Path</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Your personalized study roadmap based on performance data</p>

        {recommendations.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '700', color: '#4c1d95', fontSize: '0.9rem', marginBottom: '0.75rem' }}>✨ AI Recommendations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recommendations.slice(0, 5).map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 12px', background: 'white', borderRadius: '9px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{r.type === 'review' ? '🔄' : r.type === 'quiz' ? '🧠' : '📚'}</span>
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: '600', color: '#111827' }}>{r.title || r.message}</div>
                    {r.subject && <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{r.subject}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="lp-grid">
          {subjects.length > 0 ? subjects.map(s => (
            <div key={s.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{s.name}</div>
                  {s.track && <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '8px', background: '#f3f4f6', color: '#6b7280', fontWeight: '600' }}>{s.track}</span>}
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: (s.mastery_score||0) >= 75 ? '#16a34a' : (s.mastery_score||0) >= 50 ? '#d97706' : '#dc2626' }}>{s.mastery_score||0}%</span>
              </div>
              <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ height: '100%', width: `${s.mastery_score||0}%`, background: (s.mastery_score||0) >= 75 ? '#16a34a' : (s.mastery_score||0) >= 50 ? '#f59e0b' : '#2563eb', borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
              {s.weak_topics?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>FOCUS AREAS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {s.weak_topics.slice(0, 4).map((t, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: '500' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <Link href={`/quiz?subject_id=${s.id}`} style={{ flex: 1, padding: '7px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>🧠 Quiz</Link>
                <Link href="/upload" style={{ flex: 1, padding: '7px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>📤 Upload</Link>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🗺️</div>
              <div style={{ fontWeight: '600', marginBottom: '6px' }}>No learning path yet</div>
              <div style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>Enroll in subjects and upload exams to generate your path.</div>
              <Link href="/subjects" style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>Add Subjects →</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
