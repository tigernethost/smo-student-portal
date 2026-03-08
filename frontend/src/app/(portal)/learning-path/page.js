'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STATUS_CONFIG = {
  mastered:    { icon: '✅', color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Mastered',     ring: '#16a34a' },
  in_progress: { icon: '🟡', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'In Progress',  ring: '#d97706' },
  at_risk:     { icon: '⚠️', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'At Risk',      ring: '#dc2626' },
  available:   { icon: '⭕', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Not Started',  ring: '#93c5fd' },
  locked:      { icon: '🔒', color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', label: 'Locked',       ring: '#d1d5db' },
}

function getStatus(topic) {
  const score = parseFloat(topic.mastery_score || 0)
  if (topic.status === 'locked') return 'locked'
  if (score >= 75) return 'mastered'
  if (score >= 40) return 'in_progress'
  if (topic.attempts > 0 && score < 40) return 'at_risk'
  return topic.status || 'available'
}

function TopicNode({ topic, subjectId, onQuiz, isMobile }) {
  const [expanded, setExpanded] = useState(false)
  const status = getStatus(topic)
  const cfg    = STATUS_CONFIG[status]
  const score  = parseFloat(topic.mastery_score || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Node */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          width: isMobile ? '72px' : '88px',
          height: isMobile ? '72px' : '88px',
          borderRadius: '50%',
          background: cfg.bg,
          border: `3px solid ${expanded ? cfg.ring : cfg.border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
          boxShadow: expanded ? `0 0 0 4px ${cfg.ring}30` : '0 2px 6px rgba(0,0,0,0.08)',
          transform: expanded ? 'scale(1.08)' : 'scale(1)',
        }}>
        <span style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', lineHeight: 1 }}>{cfg.icon}</span>
        {score > 0 && (
          <span style={{ fontSize: '0.62rem', fontWeight: '800', color: cfg.color, marginTop: '2px' }}>{Math.round(score)}%</span>
        )}
        {/* Progress ring overlay */}
        {score > 0 && (
          <svg style={{ position: 'absolute', top: -3, left: -3, transform: 'rotate(-90deg)' }}
            width={isMobile ? 78 : 94} height={isMobile ? 78 : 94}>
            <circle cx={isMobile ? 39 : 47} cy={isMobile ? 39 : 47} r={isMobile ? 34 : 42}
              fill="none" stroke={cfg.ring} strokeWidth="3" strokeOpacity="0.3"
              strokeDasharray={`${2 * Math.PI * (isMobile ? 34 : 42)}`} />
            <circle cx={isMobile ? 39 : 47} cy={isMobile ? 39 : 47} r={isMobile ? 34 : 42}
              fill="none" stroke={cfg.ring} strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * (isMobile ? 34 : 42)}`}
              strokeDashoffset={`${2 * Math.PI * (isMobile ? 34 : 42) * (1 - score / 100)}`}
              strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', marginTop: '6px', width: isMobile ? '80px' : '100px' }}>
        <div style={{ fontSize: isMobile ? '0.62rem' : '0.7rem', fontWeight: '600', color: '#374151', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {topic.name}
        </div>
        <div style={{ fontSize: '0.58rem', color: cfg.color, fontWeight: '700', marginTop: '2px' }}>
          {cfg.label}
        </div>
      </div>

      {/* Expanded popup */}
      {expanded && (
        <div style={{
          position: 'absolute', zIndex: 20, background: 'white', borderRadius: '14px',
          padding: '1rem', border: `2px solid ${cfg.border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: '200px',
          marginTop: '8px', top: '100%', left: '50%', transform: 'translateX(-50%)',
        }}>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.85rem', marginBottom: '6px' }}>{topic.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>
            <span>Mastery</span>
            <span style={{ fontWeight: '700', color: cfg.color }}>{Math.round(score)}%</span>
          </div>
          <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${score}%`, background: cfg.color, borderRadius: '3px', transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '10px' }}>
            {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''} · Quarter {topic.quarter}
          </div>
          {status !== 'locked' && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuiz(subjectId, topic.id); setExpanded(false) }}
              style={{ width: '100%', padding: '7px', background: status === 'mastered' ? '#f0fdf4' : 'linear-gradient(135deg,#2563eb,#7c3aed)', color: status === 'mastered' ? '#16a34a' : 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
              {status === 'mastered' ? '🔄 Practice Again' : '🧠 Take Quiz'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SubjectTree({ subject, isMobile }) {
  const [collapsed, setCollapsed] = useState(false)
  const router_push = (subjectId, topicId) => {
    window.location.href = `/quiz?subject_id=${subjectId}&topic_id=${topicId}`
  }

  // Group topics by quarter
  const quarters = subject.topics.reduce((acc, t) => {
    const q = t.quarter || 1
    if (!acc[q]) acc[q] = []
    acc[q].push(t)
    return acc
  }, {})
  const quarterNums = Object.keys(quarters).sort()

  const mastered = subject.topics.filter(t => parseFloat(t.mastery_score) >= 75).length
  const total    = subject.topics.length
  const pct      = total ? Math.round((mastered / total) * 100) : 0

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
      {/* Subject header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ padding: '1rem 1.25rem', background: `linear-gradient(135deg, ${subject.color}15, ${subject.color}05)`, borderBottom: collapsed ? 'none' : '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{subject.icon || '📚'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '800', color: '#111827', fontSize: '0.95rem' }}>{subject.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ flex: 1, height: '5px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', maxWidth: '140px' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: subject.color || '#2563eb', borderRadius: '3px', transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: subject.color || '#2563eb', flexShrink: 0 }}>{mastered}/{total} mastered</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: subject.color || '#2563eb' }}>{pct}%</div>
            <div style={{ fontSize: '0.62rem', color: '#9ca3af' }}>complete</div>
          </div>
          <span style={{ color: '#9ca3af', fontSize: '0.9rem', transition: 'transform 0.2s', display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '1.25rem' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'locked').map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem' }}>{cfg.icon}</span>
                <span style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: '500' }}>{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* Tree by quarter */}
          {quarterNums.map((q, qi) => (
            <div key={q} style={{ marginBottom: qi < quarterNums.length - 1 ? '1.5rem' : 0 }}>
              {/* Quarter label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '3px 12px', background: `${subject.color}15`, borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', color: subject.color || '#2563eb' }}>
                  Quarter {q}
                </div>
                <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
              </div>

              {/* Nodes row with connectors */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: '8px' }}>
                {quarters[q].map((topic, ti) => (
                  <div key={topic.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {/* Connector line between nodes */}
                    {ti > 0 && (
                      <div style={{ width: isMobile ? '16px' : '24px', height: '3px', background: parseFloat(quarters[q][ti-1].mastery_score) >= 75 ? '#86efac' : '#e5e7eb', borderRadius: '2px', flexShrink: 0, marginBottom: '24px' }} />
                    )}
                    <div style={{ position: 'relative' }}>
                      <TopicNode topic={topic} subjectId={subject.id} onQuiz={router_push} isMobile={isMobile} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LearningPathPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setMobile] = useState(false)
  const [filter,  setFilter]  = useState('all') // all | in_progress | at_risk | mastered
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    setMobile(window.innerWidth < 600)
    const handler = () => setMobile(window.innerWidth < 600)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    fetch('/api/student/learning-path', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '12px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading your learning tree...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const subjects      = data?.subjects || []
  const recommendations = data?.recommendations || []

  // Summary stats
  const totalTopics   = subjects.reduce((s, subj) => s + subj.topics.length, 0)
  const masteredTopics = subjects.reduce((s, subj) => s + subj.topics.filter(t => parseFloat(t.mastery_score) >= 75).length, 0)
  const atRiskTopics  = subjects.reduce((s, subj) => s + subj.topics.filter(t => { const sc = parseFloat(t.mastery_score); return t.attempts > 0 && sc < 40 }).length, 0)
  const inProgressTopics = subjects.reduce((s, subj) => s + subj.topics.filter(t => { const sc = parseFloat(t.mastery_score); return sc >= 40 && sc < 75 }).length, 0)

  // Filter subjects
  const filteredSubjects = filter === 'all' ? subjects : subjects.map(subj => ({
    ...subj,
    topics: subj.topics.filter(t => {
      const status = getStatus(t)
      return filter === status || (filter === 'in_progress' && status === 'in_progress') || (filter === 'at_risk' && status === 'at_risk') || (filter === 'mastered' && status === 'mastered')
    })
  })).filter(subj => subj.topics.length > 0)

  if (subjects.length === 0) return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
      <h2 style={{ fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>No Learning Path Yet</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enroll in subjects and take quizzes to build your learning tree.</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/subjects" style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem' }}>📚 Add Subjects</Link>
        <Link href="/quiz" style={{ padding: '10px 22px', background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem' }}>🧠 Take a Quiz</Link>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .tree-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
        @media(max-width:600px) { .tree-stats { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>🗺️ Learning Progression Tree</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Tap any topic node to see your mastery and take a targeted quiz</p>
        </div>

        {/* Summary stats */}
        <div className="tree-stats">
          {[
            { icon: '📚', label: 'Total Topics',  value: totalTopics,    color: '#2563eb', bg: '#eff6ff' },
            { icon: '✅', label: 'Mastered',       value: masteredTopics, color: '#16a34a', bg: '#f0fdf4' },
            { icon: '🟡', label: 'In Progress',   value: inProgressTopics, color: '#d97706', bg: '#fffbeb' },
            { icon: '⚠️', label: 'At Risk',        value: atRiskTopics,   color: '#dc2626', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} onClick={() => setFilter(filter === s.label.toLowerCase().replace(' ','_') ? 'all' : s.label.toLowerCase().replace(' ','_'))}
              style={{ background: 'white', borderRadius: '12px', padding: '0.875rem', border: `1px solid ${s.bg}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 'clamp(1.3rem,4vw,1.6rem)', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { id: 'all', label: '🗺️ All Topics' },
            { id: 'at_risk', label: '⚠️ At Risk' },
            { id: 'in_progress', label: '🟡 In Progress' },
            { id: 'mastered', label: '✅ Mastered' },
            { id: 'available', label: '⭕ Not Started' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${filter === f.id ? '#2563eb' : '#e5e7eb'}`, background: filter === f.id ? '#eff6ff' : 'white', color: filter === f.id ? '#2563eb' : '#6b7280', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && filter === 'all' && (
          <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '700', color: '#4c1d95', fontSize: '0.9rem', marginBottom: '0.75rem' }}>✨ Recommended Next Steps</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {recommendations.slice(0, 4).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'white', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
                  <span style={{ fontSize: '1rem' }}>{r.type === 'review' ? '🔄' : r.type === 'quiz' ? '🧠' : '📚'}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{r.title || r.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject Trees */}
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map(subject => (
            <SubjectTree key={subject.id} subject={subject} isMobile={isMobile} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontSize: '0.875rem' }}>No topics match this filter.</div>
            <button onClick={() => setFilter('all')} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#2563eb', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>Show all topics →</button>
          </div>
        )}

        {/* Overall progress footer */}
        {totalTopics > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#312e81)', borderRadius: '16px', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: '4px' }}>Overall Progress</div>
              <div style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: '900', lineHeight: 1 }}>
                {totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0}%
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '2px' }}>{masteredTopics} of {totalTopics} topics mastered</div>
            </div>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalTopics > 0 ? (masteredTopics/totalTopics)*100 : 0}%`, background: 'linear-gradient(90deg,#34d399,#10b981)', borderRadius: '5px', transition: 'width 0.6s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', opacity: 0.6 }}>
                <span>{masteredTopics} mastered</span>
                <span>{totalTopics - masteredTopics} remaining</span>
              </div>
            </div>
            <Link href="/quiz" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
              🧠 Continue Learning
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
