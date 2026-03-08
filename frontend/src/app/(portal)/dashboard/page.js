'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
    fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setData(d)
        if (d.onboarding_done === false) window.location.href = '/onboarding'
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (!data) return <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Could not load dashboard.</div>

  const { overall_score, risk_level, total_quizzes, total_uploads, subjects, strengths, weaknesses, ai_summary, recent_quizzes, recent_uploads, unread_notifications, quota } = data
  const riskColor = risk_level === 'high' ? '#dc2626' : risk_level === 'medium' ? '#d97706' : '#16a34a'

  return (
    <>
      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }
        .dash-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2,1fr); }
          .dash-grid { grid-template-columns: 1fr; }
          .dash-grid-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .dash-stats { grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
          .dash-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Quota warning */}
        {quota && !quota.is_unlimited && quota.pct_used >= 80 && (
          <div style={{ background: quota.pct_used >= 100 ? '#fef2f2' : '#fffbeb', border: `1px solid ${quota.pct_used >= 100 ? '#fca5a5' : '#fcd34d'}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: quota.pct_used >= 100 ? '#dc2626' : '#92400e' }}>
              {quota.pct_used >= 100 ? `🚫 All ${quota.limit} AI actions used this month.` : `⚠️ ${quota.used}/${quota.limit} AI actions used (${quota.pct_used}%).`}
            </span>
            <Link href="/upgrade" style={{ padding: '6px 14px', background: quota.pct_used >= 100 ? '#dc2626' : '#f59e0b', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>⚡ Upgrade →</Link>
          </div>
        )}

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#312e81)', borderRadius: '20px', padding: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: '800', marginBottom: '4px' }}>Your Learning Dashboard</h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0 }}>Upload exams & take AI quizzes to track your progress</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/upload" style={{ padding: '9px 18px', background: 'white', color: '#1e3a8a', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap' }}>📤 Upload</Link>
              <Link href="/quiz" style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap' }}>🧠 Quiz</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { icon: '📊', label: 'Overall Score', value: overall_score > 0 ? `${overall_score}%` : '—', sub: 'across all subjects', color: '#2563eb', bg: '#eff6ff' },
            { icon: '🧠', label: 'Quizzes Taken', value: total_quizzes, sub: 'AI-generated', color: '#7c3aed', bg: '#f5f3ff' },
            { icon: '📤', label: 'Documents', value: total_uploads, sub: 'uploaded & analyzed', color: '#059669', bg: '#f0fdf4' },
            { icon: '🎯', label: 'Risk Level', value: risk_level.charAt(0).toUpperCase()+risk_level.slice(1), sub: 'current status', color: riskColor, bg: risk_level === 'high' ? '#fef2f2' : risk_level === 'medium' ? '#fffbeb' : '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '1.1rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{s.icon}</div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '3px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        {ai_summary && (
          <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>✨</span>
              <span style={{ fontWeight: '700', color: '#4c1d95', fontSize: '0.88rem' }}>Your AI Study Advisor</span>
            </div>
            <p style={{ color: '#3730a3', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{ai_summary}</p>
          </div>
        )}

        {/* Subjects + Insights */}
        <div className="dash-grid">
          {/* Subjects */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>📚 My Subjects</span>
              <Link href="/subjects" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>View all →</Link>
            </div>
            {subjects && subjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subjects.slice(0, 5).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                      <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.mastery_score || 0}%`, background: (s.mastery_score||0) >= 75 ? '#16a34a' : (s.mastery_score||0) >= 50 ? '#f59e0b' : '#2563eb', borderRadius: '2px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6b7280', flexShrink: 0 }}>{s.mastery_score || 0}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📚</div>
                <div style={{ fontSize: '0.82rem' }}>No subjects yet</div>
                <Link href="/subjects" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>+ Add subjects</Link>
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>💡 Insights</span>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {strengths?.slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>💪</span>
                  <span style={{ fontSize: '0.8rem', color: '#166534' }}>{s}</span>
                </div>
              ))}
              {weaknesses?.slice(0, 3).map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>📍</span>
                  <span style={{ fontSize: '0.8rem', color: '#991b1b' }}>{w}</span>
                </div>
              ))}
              {(!strengths?.length && !weaknesses?.length) && (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📊</div>
                  <div style={{ fontSize: '0.82rem' }}>Upload exams to see insights</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-grid">
          {/* Recent Quizzes */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>🧠 Recent Quizzes</span>
              <Link href="/quiz" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Take quiz →</Link>
            </div>
            {recent_quizzes?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recent_quizzes.slice(0, 4).map(q => (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.subject_name || 'Quiz'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{q.total_questions} questions</div>
                    </div>
                    {q.score_pct != null && <span style={{ fontSize: '0.8rem', fontWeight: '700', color: q.score_pct >= 75 ? '#16a34a' : q.score_pct >= 50 ? '#d97706' : '#dc2626', flexShrink: 0 }}>{q.score_pct}%</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🧠</div>
                <div style={{ fontSize: '0.82rem' }}>No quizzes yet</div>
                <Link href="/quiz" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Take your first quiz →</Link>
              </div>
            )}
          </div>

          {/* Recent Uploads */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>📤 Recent Uploads</span>
              <Link href="/upload" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Upload →</Link>
            </div>
            {recent_uploads?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recent_uploads.slice(0, 4).map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{u.type === 'exam' ? '📝' : u.type === 'notes' ? '📄' : '📋'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.original_name || u.type}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'capitalize' }}>{u.status}</div>
                    </div>
                    {u.extracted_score != null && <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#374151', flexShrink: 0 }}>{u.extracted_score}/{u.extracted_total}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📤</div>
                <div style={{ fontSize: '0.82rem' }}>No uploads yet</div>
                <Link href="/upload" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Upload your first exam →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', marginBottom: '1rem' }}>⚡ Quick Actions</div>
          <div className="dash-grid-3">
            {[
              { href: '/upload', icon: '📤', label: 'Upload Exam', desc: 'Get AI analysis', color: '#059669', bg: '#f0fdf4' },
              { href: '/quiz', icon: '🧠', label: 'Take Quiz', desc: 'AI-generated questions', color: '#7c3aed', bg: '#f5f3ff' },
              { href: '/analytics', icon: '📊', label: 'View Analytics', desc: 'Track progress', color: '#2563eb', bg: '#eff6ff' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: a.bg, borderRadius: '12px', textDecoration: 'none', border: `1px solid ${a.color}20`, transition: 'transform 0.15s' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: '0.83rem', fontWeight: '700', color: '#111827' }}>{a.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ height: '100px', background: 'linear-gradient(135deg,#1e3a8a,#312e81)', borderRadius: '20px', marginBottom: '1.5rem', opacity: 0.7 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: '90px', background: '#f3f4f6', borderRadius: '14px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
