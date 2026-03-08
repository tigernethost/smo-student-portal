'use client'
import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  function load() {
    fetch('/api/student/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function refresh() {
    setRefreshing(true)
    await fetch('/api/student/analytics/refresh', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    load()
    setRefreshing(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading analytics...</div>
  if (!data)   return <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Could not load analytics.</div>

  const { overall_score, risk_level, total_quizzes, total_uploads, strengths, weaknesses, subjects, quiz_trend, ai_summary } = data
  const riskColor = risk_level === 'high' ? '#dc2626' : risk_level === 'medium' ? '#d97706' : '#16a34a'
  const riskBg    = risk_level === 'high' ? '#fef2f2' : risk_level === 'medium' ? '#fffbeb' : '#f0fdf4'

  return (
    <>
      <style>{`
        .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .analytics-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        @media (max-width: 900px) { .analytics-grid { grid-template-columns: 1fr; } .analytics-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .analytics-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>📊 Analytics</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Track your learning progress over time</p>
          </div>
          <button onClick={refresh} disabled={refreshing} style={{ padding: '9px 18px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="analytics-stats">
          {[
            { icon: '📊', label: 'Overall Score', value: overall_score > 0 ? `${overall_score}%` : '—', color: '#2563eb', bg: '#eff6ff' },
            { icon: '🎯', label: 'Risk Level', value: (risk_level||'low').charAt(0).toUpperCase()+(risk_level||'low').slice(1), color: riskColor, bg: riskBg },
            { icon: '🧠', label: 'Quizzes', value: total_quizzes || 0, color: '#7c3aed', bg: '#f5f3ff' },
            { icon: '📤', label: 'Uploads', value: total_uploads || 0, color: '#059669', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(1.3rem,4vw,1.6rem)', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        {ai_summary && (
          <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>✨</span><span style={{ fontWeight: '700', color: '#4c1d95', fontSize: '0.88rem' }}>AI Advisor</span>
            </div>
            <p style={{ color: '#3730a3', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{ai_summary}</p>
          </div>
        )}

        <div className="analytics-grid">
          {/* Subjects */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', marginBottom: '1rem' }}>📚 Subject Mastery</div>
            {subjects?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {subjects.map(s => (
                  <div key={s.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111827' }}>{s.name}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: (s.mastery_score||0) >= 75 ? '#16a34a' : (s.mastery_score||0) >= 50 ? '#d97706' : '#dc2626' }}>{s.mastery_score || 0}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.mastery_score || 0}%`, background: (s.mastery_score||0) >= 75 ? '#16a34a' : (s.mastery_score||0) >= 50 ? '#f59e0b' : '#2563eb', borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <div style={{ color: '#9ca3af', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>Upload exams to see subject mastery</div>}
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', marginBottom: '1rem' }}>💡 Strengths & Gaps</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {strengths?.slice(0, 4).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '7px 10px', background: '#f0fdf4', borderRadius: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>💪</span>
                  <span style={{ fontSize: '0.79rem', color: '#166534' }}>{s}</span>
                </div>
              ))}
              {weaknesses?.slice(0, 4).map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '7px 10px', background: '#fef2f2', borderRadius: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>📍</span>
                  <span style={{ fontSize: '0.79rem', color: '#991b1b' }}>{w}</span>
                </div>
              ))}
              {!strengths?.length && !weaknesses?.length && <div style={{ color: '#9ca3af', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>No insights yet</div>}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </>
  )
}
