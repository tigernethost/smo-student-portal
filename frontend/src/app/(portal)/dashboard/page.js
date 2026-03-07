'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }

    fetch('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      setData(d)
      if (d.onboarding_done === false) window.location.href = '/onboarding'
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (!data) return <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Could not load dashboard.</div>

  const { overall_score, risk_level, total_quizzes, total_uploads, subjects, strengths, weaknesses, recommendations, ai_summary, recent_quizzes, recent_uploads, unread_notifications } = data

  const riskColor = risk_level === 'high' ? '#dc2626' : risk_level === 'medium' ? '#d97706' : '#16a34a'
  const card = { background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#312e81)', borderRadius: '20px', padding: '1.5rem 2rem', color: 'white', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>Your Learning Dashboard</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Upload exams & take AI quizzes to track your progress</p>
        </div>
        <div style={{ display: 'flex', gap: '0.875rem' }}>
          <Link href="/upload" style={{ padding: '9px 18px', background: 'white', color: '#1e3a8a', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>📤 Upload</Link>
          <Link href="/quiz" style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>🧠 Quiz</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '📊', label: 'Overall Score', value: overall_score > 0 ? `${overall_score}%` : '—', sub: 'across all subjects', color: '#2563eb', bg: '#eff6ff' },
          { icon: '🧠', label: 'Quizzes Taken', value: total_quizzes, sub: 'AI-generated quizzes', color: '#7c3aed', bg: '#f5f3ff' },
          { icon: '📤', label: 'Documents', value: total_uploads, sub: 'uploaded & analyzed', color: '#059669', bg: '#f0fdf4' },
          { icon: '🎯', label: 'Risk Level', value: risk_level.charAt(0).toUpperCase() + risk_level.slice(1), sub: 'current status', color: riskColor, bg: risk_level === 'high' ? '#fef2f2' : risk_level === 'medium' ? '#fffbeb' : '#f0fdf4' },
        ].map(s => (
          <div key={s.label} style={{ ...card }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: '0.75rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginTop: '3px' }}>{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* AI summary */}
          {ai_summary ? (
            <div style={{ ...card, background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid #e0e7ff' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>🤖 AI LEARNING SUMMARY</div>
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{ai_summary}</p>
            </div>
          ) : total_quizzes === 0 && total_uploads === 0 ? (
            <div style={{ ...card, background: 'linear-gradient(135deg,#fffff5,#fffbeb)', border: '1px solid #fde68a', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚀</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Start your learning journey!</div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>Upload an exam or take a quiz to get your personalized AI analysis and track your progress.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Link href="/upload" style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', borderRadius: '9px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>📤 Upload an Exam</Link>
                <Link href="/quiz" style={{ padding: '9px 20px', background: 'white', color: '#2563eb', border: '1.5px solid #2563eb', borderRadius: '9px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>🧠 Take a Quiz</Link>
              </div>
            </div>
          ) : null}

          {/* My Subjects */}
          {subjects?.length > 0 && (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>My Subjects</h2>
                <Link href="/subjects" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>View all →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.625rem' }}>
                {subjects.map(s => (
                  <div key={s.id} style={{ textAlign: 'center', padding: '0.875rem 0.5rem', borderRadius: '10px', border: '1px solid #f3f4f6', background: '#fafafa' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{s.icon}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '600', color: '#374151', marginBottom: '3px', lineHeight: 1.2 }}>{s.name.split(' ')[0]}</div>
                    {s.score != null ? (
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: s.score >= 85 ? '#16a34a' : s.score >= 70 ? '#d97706' : '#dc2626' }}>{s.score}%</div>
                    ) : (
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>No data</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          {(recent_quizzes?.length > 0 || recent_uploads?.length > 0) && (
            <div style={card}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>Recent Activity</h2>
              {recent_uploads?.map(u => (
                <div key={u.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: '1.1rem' }}>📤</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151' }}>{u.type} uploaded{u.subject ? ` — ${u.subject}` : ''}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{u.date}</div>
                  </div>
                  {u.score != null && <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb' }}>{u.score}/{u.total}</div>}
                  <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '5px', background: u.status === 'done' ? '#f0fdf4' : '#fffbeb', color: u.status === 'done' ? '#16a34a' : '#d97706', fontWeight: '600' }}>{u.status}</span>
                </div>
              ))}
              {recent_quizzes?.map(q => (
                <div key={q.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: '1.1rem' }}>🧠</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151' }}>{q.topic || q.subject} Quiz</div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{q.date}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: q.score_pct >= 85 ? '#16a34a' : q.score_pct >= 65 ? '#d97706' : '#dc2626' }}>{q.score_pct}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Strengths */}
          {strengths?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>💪 Strengths</h3>
              {strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{s.topic_name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{s.subject_name}</div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#16a34a' }}>{s.score}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>📖 Needs Practice</h3>
              {weaknesses.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{w.topic_name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{w.subject_name}</div>
                  </div>
                  {w.score != null && <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#dc2626' }}>{w.score}%</span>}
                </div>
              ))}
              <Link href="/quiz" style={{ display: 'block', marginTop: '0.75rem', padding: '7px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontSize: '0.78rem', fontWeight: '700' }}>
                🧠 Practice These Topics
              </Link>
            </div>
          )}

          {/* Recommendations */}
          {recommendations?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>🎯 Next Steps</h3>
              {recommendations.slice(0, 3).map((r, i) => (
                <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{r.topic_name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{r.subject_name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div style={card}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>Quick Actions</h3>
            {[
              { href: '/upload', icon: '📤', label: 'Upload Exam', desc: 'AI reads & analyzes', color: '#2563eb' },
              { href: '/quiz', icon: '🧠', label: 'Take a Quiz', desc: 'Adaptive AI questions', color: '#7c3aed' },
              { href: '/learning-path', icon: '🗺️', label: 'Learning Path', desc: 'View topic mastery', color: '#059669' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '9px', marginBottom: '4px', textDecoration: 'none', border: '1px solid #f3f4f6', background: '#fafafa', transition: 'background 0.15s' }}>
                <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: a.color }}>{a.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  const shimmer = { background: 'linear-gradient(90deg,#f3f4f6 25%,#e9ecef 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ ...shimmer, height: '100px', marginBottom: '1.5rem', borderRadius: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ ...shimmer, height: '90px', borderRadius: '16px' }} />)}
      </div>
      <div style={{ ...shimmer, height: '200px', borderRadius: '16px' }} />
    </div>
  )
}
