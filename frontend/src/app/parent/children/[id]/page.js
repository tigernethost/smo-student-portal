'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ChildPerformance() {
  const { id } = useParams()
  const router = useRouter()
  const [token, setToken] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState(null)
  const [activeQuarter, setActiveQuarter] = useState('All')

  useEffect(() => {
    const t = localStorage.getItem('parent_token')
    if (!t) { router.push('/parent/login'); return }
    setToken(t)
  }, [])

  useEffect(() => {
    if (!token || !id) return
    fetch(`${API}/api/parent/children/${id}/performance`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    }).then(r => r.json()).then(d => {
      setPerformance(d)
      if (d.subjects?.length > 0) setActiveSubject(d.subjects[0])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [token, id])

  if (loading) return <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'system-ui' }}>Loading…</div>
  if (!performance) return null

  const { student, subjects, quiz_history } = performance
  const quarters = ['All', 'Q1', 'Q2', 'Q3', 'Q4']
  const filteredTopics = activeSubject?.topics?.filter(t => activeQuarter === 'All' || t.quarter === activeQuarter) || []

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', height: 60 }}>
        <Link href="/parent/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <div style={{ fontWeight: 700 }}>Performance Details</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{student?.name}</div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>

        {/* Subject list sidebar */}
        <div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Subjects</div>
          {subjects.map(s => {
            const isActive = activeSubject?.id === s.id
            const color = s.avg_mastery >= 75 ? '#10b981' : s.avg_mastery >= 40 ? '#f59e0b' : '#ef4444'
            return (
              <button key={s.id} onClick={() => setActiveSubject(s)}
                style={{ width: '100%', textAlign: 'left', background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent', border: `1px solid ${isActive ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '0.875rem', marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: isActive ? '#e2e8f0' : '#94a3b8', fontWeight: isActive ? 600 : 400 }}>{s.icon} {s.name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{s.avg_mastery}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, height: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.avg_mastery}%`, background: color, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ {s.status.mastered}</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⟳ {s.status.in_progress}</span>
                  <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>⚠ {s.status.at_risk}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Topic detail */}
        <div>
          {activeSubject && (
            <>
              {/* Subject header */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{activeSubject.icon} {activeSubject.name}</h2>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{activeSubject.total} topics · Avg mastery: {activeSubject.avg_mastery}%</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[{n:'Mastered', v:activeSubject.status.mastered, c:'#10b981'},{n:'In Progress', v:activeSubject.status.in_progress, c:'#f59e0b'},{n:'At Risk', v:activeSubject.status.at_risk, c:'#ef4444'},{n:'Not Started', v:activeSubject.status.not_started, c:'#64748b'}].map(s => (
                    <div key={s.n} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.4rem 0.6rem' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.n}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quarter filter */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {quarters.map(q => (
                  <button key={q} onClick={() => setActiveQuarter(q)}
                    style={{ background: activeQuarter === q ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activeQuarter === q ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: '0.3rem 0.85rem', color: activeQuarter === q ? '#a5b4fc' : '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: activeQuarter === q ? 600 : 400 }}>
                    {q}
                  </button>
                ))}
              </div>

              {/* Topics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {filteredTopics.map((t, i) => {
                  const color = t.mastery >= 75 ? '#10b981' : t.attempts > 0 && t.mastery < 40 ? '#ef4444' : t.mastery >= 40 ? '#f59e0b' : '#64748b'
                  const emoji = t.mastery >= 75 ? '✅' : t.attempts > 0 && t.mastery < 40 ? '⚠️' : t.mastery >= 40 ? '🟡' : t.attempts === 0 ? '⭕' : '🔒'
                  return (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.mastery >= 75 ? 'rgba(16,185,129,0.2)' : t.attempts > 0 && t.mastery < 40 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#e2e8f0', flex: 1, lineHeight: 1.3 }}>{t.name}</span>
                        <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>{emoji}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, height: 5, overflow: 'hidden', marginBottom: '0.4rem' }}>
                        <div style={{ height: '100%', width: `${t.mastery}%`, background: color, borderRadius: 3 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color }}>{t.mastery}% mastery</span>
                        <span style={{ color: '#64748b' }}>{t.attempts} {t.attempts === 1 ? 'attempt' : 'attempts'}</span>
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.2rem' }}>{t.quarter}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Quiz history */}
          {quiz_history?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', marginTop: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>📊 Recent Quiz Scores</h3>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end', height: 80, overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {quiz_history.map((q, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: 36 }}>
                    <div style={{ width: 28, height: `${q.pct * 0.6}px`, minHeight: 4, background: q.pct >= 75 ? '#10b981' : q.pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '3px 3px 0 0', position: 'relative', cursor: 'default' }} title={`${q.subject}: ${q.pct}%`} />
                    <div style={{ color: '#64748b', fontSize: '0.6rem', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{q.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
