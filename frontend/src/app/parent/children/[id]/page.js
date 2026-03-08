'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ChildPerformance() {
  const router = useRouter()
  const { id } = useParams()
  const [token, setToken] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState(null)
  const [tab, setTab] = useState('subjects') // subjects | history

  useEffect(() => {
    const t = localStorage.getItem('parent_token')
    if (!t) { router.push('/parent/login'); return }
    setToken(t)
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/parent/children/${id}/performance`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token, id])

  if (loading) return <Screen><div style={{ color: '#64748b', textAlign: 'center', paddingTop: '4rem' }}>Loading performance data…</div></Screen>
  if (!data) return <Screen><div style={{ color: '#ef4444', textAlign: 'center', paddingTop: '4rem' }}>Unable to load data.</div></Screen>

  const { student, subjects, quiz_history } = data
  const selected = activeSubject ? subjects.find(s => s.id === activeSubject) : null

  return (
    <Screen>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', height: 60 }}>
        <Link href="/parent/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{student.name} — Performance</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Detailed subject & topic breakdown</div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[['subjects','📚 Subjects'], ['history','📈 Quiz History']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ background: tab === k ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)', border: `1px solid ${tab === k ? 'transparent' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '0.5rem 1rem', color: tab === k ? '#fff' : '#94a3b8', fontSize: '0.875rem', cursor: 'pointer', fontWeight: tab === k ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'subjects' && (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '320px 1fr' : '1fr', gap: '1.5rem' }}>

            {/* Subject list */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {subjects.map(s => (
                  <SubjectCard key={s.id} subject={s} selected={activeSubject === s.id}
                    onClick={() => setActiveSubject(activeSubject === s.id ? null : s.id)} />
                ))}
              </div>
            </div>

            {/* Topic drill-down */}
            {selected && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{selected.icon} {selected.name} — Topics</h3>
                  <button onClick={() => setActiveSubject(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                {/* Status summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Mastered', val: selected.status.mastered, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'In Progress', val: selected.status.in_progress, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'At Risk', val: selected.status.at_risk, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                    { label: 'Not Started', val: selected.status.not_started, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
                  ].map(item => (
                    <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.color}30`, borderRadius: 8, padding: '0.6rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color }}>{item.val}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quarter grouping */}
                {[1,2,3,4].map(q => {
                  const qTopics = selected.topics.filter(t => t.quarter === q)
                  if (!qTopics.length) return null
                  return (
                    <div key={q} style={{ marginBottom: '1rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Quarter {q}</div>
                      {qTopics.map((t, i) => <TopicRow key={i} topic={t} />)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>📈 Quiz Score History</h3>
            {quiz_history.length === 0 && <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No quiz history yet</div>}

            {/* Mini chart */}
            {quiz_history.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <MiniChart data={quiz_history} />
              </div>
            )}

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Date','Subject','Score'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#64748b', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...quiz_history].reverse().map((q, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8' }}>{q.date}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#e2e8f0' }}>{q.subject}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span style={{ background: q.pct >= 75 ? 'rgba(16,185,129,0.15)' : q.pct >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: q.pct >= 75 ? '#10b981' : q.pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 12, padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        {q.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Screen>
  )
}

function SubjectCard({ subject, selected, onClick }) {
  const pct = subject.avg_mastery
  const color = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div onClick={onClick} style={{ background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{subject.icon}</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>{subject.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{subject.total} topics</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{pct}%</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>avg mastery</div>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
        {subject.status.mastered > 0 && <Pill val={subject.status.mastered} label="✅" color="#10b981" />}
        {subject.status.in_progress > 0 && <Pill val={subject.status.in_progress} label="🟡" color="#f59e0b" />}
        {subject.status.at_risk > 0 && <Pill val={subject.status.at_risk} label="⚠️" color="#ef4444" />}
      </div>
    </div>
  )
}

function Pill({ val, label, color }) {
  return <span style={{ fontSize: '0.7rem', color, background: `${color}15`, borderRadius: 10, padding: '0.1rem 0.4rem' }}>{label} {val}</span>
}

function TopicRow({ topic }) {
  const pct = topic.mastery
  const color = topic.attempts === 0 ? '#475569' : pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const status = topic.attempts === 0 ? '⭕ Not started' : pct >= 75 ? '✅ Mastered' : pct >= 40 ? '🟡 In progress' : '⚠️ At risk'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{topic.name}</div>
        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{status} · {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}</div>
      </div>
      {topic.attempts > 0 && (
        <div style={{ textAlign: 'right', minWidth: 60 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{pct}%</div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 4, width: 60, overflow: 'hidden', marginTop: 2 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
          </div>
        </div>
      )}
    </div>
  )
}

function MiniChart({ data }) {
  if (!data.length) return null
  const max = 100
  const h = 80
  const w = 600
  const step = w / (data.length - 1 || 1)
  const points = data.map((d, i) => `${i * step},${h - (d.pct / max) * h}`).join(' ')

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', maxWidth: 700, display: 'block' }}>
        {/* Grid lines */}
        {[25, 50, 75].map(v => (
          <line key={v} x1={0} y1={h - (v / max) * h} x2={w} y2={h - (v / max) * h}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}
        {/* Score line */}
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={i * step} cy={h - (d.pct / max) * h} r={3}
            fill={d.pct >= 75 ? '#10b981' : d.pct >= 50 ? '#f59e0b' : '#ef4444'} />
        ))}
        {/* Labels */}
        {data.map((d, i) => i % Math.max(1, Math.floor(data.length / 8)) === 0 && (
          <text key={i} x={i * step} y={h + 14} textAnchor="middle" fill="#64748b" fontSize={9}>{d.date}</text>
        ))}
        {/* 75% passing line */}
        <line x1={0} y1={h - 0.75 * h} x2={w} y2={h - 0.75 * h} stroke="#10b981" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
        <text x={4} y={h - 0.75 * h - 3} fill="#10b981" fontSize={8} opacity={0.6}>75%</text>
      </svg>
    </div>
  )
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {children}
    </div>
  )
}
