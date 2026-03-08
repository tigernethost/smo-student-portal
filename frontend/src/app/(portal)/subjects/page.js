'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TRACK_COLORS = {
  Core: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  STEM: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  ABM:  { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  HUMSS:{ bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  TVL:  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
}

export default function SubjectsPage() {
  const [subjects,  setSubjects]  = useState([])
  const [enrolled,  setEnrolled]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState(null)
  const [search,    setSearch]    = useState('')
  const [activeTab, setTab]       = useState('browse')
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    Promise.all([
      fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/student/profile', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([subs, profile]) => {
      setSubjects(Array.isArray(subs) ? subs : [])
      const enrolledIds = (profile.enrolled_subjects || []).map(s => s.id)
      setEnrolled(enrolledIds)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function toggle(id) {
    setEnrolled(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])
  }

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const res  = await fetch('/api/student/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ subject_ids: enrolled }) })
      const data = await res.json()
      if (res.ok) setMsg({ type: 'success', text: '✅ Subjects saved!' })
      else setMsg({ type: 'error', text: data.message || 'Save failed.' })
    } catch { setMsg({ type: 'error', text: 'Network error.' }) }
    setSaving(false)
    setTimeout(() => setMsg(null), 3000)
  }

  const tracks    = [...new Set(subjects.map(s => s.track).filter(Boolean))]
  const filtered  = subjects.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
  const grouped   = tracks.reduce((acc, t) => { acc[t] = filtered.filter(s => s.track === t); return acc }, {})
  const mySubjects = subjects.filter(s => enrolled.includes(s.id))

  return (
    <>
      <style>{`
        .subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        @media (max-width: 500px) { .subjects-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>📚 My Subjects</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>{enrolled.length} enrolled · {subjects.length} available</p>
          </div>
          <button onClick={save} disabled={saving} style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
            {saving ? '⏳ Saving...' : '✅ Save Changes'}
          </button>
        </div>

        {msg && <div style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem', background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${msg.type === 'error' ? '#fca5a5' : '#bbf7d0'}`, color: msg.type === 'error' ? '#dc2626' : '#16a34a', fontSize: '0.875rem', fontWeight: '500' }}>{msg.text}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.25rem', width: 'fit-content' }}>
          {['browse','enrolled'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', background: activeTab === t ? 'white' : 'transparent', color: activeTab === t ? '#111827' : '#6b7280', boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', textTransform: 'capitalize' }}>
              {t === 'enrolled' ? `Enrolled (${enrolled.length})` : 'Browse All'}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <>
            <input placeholder="🔍 Search subjects..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: '1.25rem', outline: 'none', boxSizing: 'border-box', background: 'white' }} />

            {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading subjects...</div> : (
              tracks.map(track => {
                const tc = TRACK_COLORS[track] || TRACK_COLORS.Core
                const trackSubs = grouped[track] || []
                if (!trackSubs.length) return null
                return (
                  <div key={track} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{track}</span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{trackSubs.length} subjects</span>
                    </div>
                    <div className="subjects-grid">
                      {trackSubs.map(s => {
                        const isEnrolled = enrolled.includes(s.id)
                        return (
                          <button key={s.id} onClick={() => toggle(s.id)} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${isEnrolled ? tc.color : '#e5e7eb'}`, background: isEnrolled ? tc.bg : 'white', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isEnrolled ? tc.color : '#111827', lineHeight: 1.3 }}>{s.name}</span>
                              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{isEnrolled ? '✅' : '⭕'}</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{s.topics_count || 0} topics</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {activeTab === 'enrolled' && (
          <div>
            {mySubjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                <div style={{ fontSize: '0.85rem' }}>No subjects enrolled yet.</div>
                <button onClick={() => setTab('browse')} style={{ marginTop: '8px', fontSize: '0.82rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>Browse subjects →</button>
              </div>
            ) : (
              <div className="subjects-grid">
                {mySubjects.map(s => {
                  const tc = TRACK_COLORS[s.track] || TRACK_COLORS.Core
                  return (
                    <div key={s.id} style={{ padding: '14px', borderRadius: '12px', background: tc.bg, border: `2px solid ${tc.color}30` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111827' }}>{s.name}</span>
                        <button onClick={() => toggle(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>✕</button>
                      </div>
                      <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '10px', background: 'white', color: tc.color, fontWeight: '700' }}>{s.track}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
