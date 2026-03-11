'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('parent_token') : ''
  return { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' }
}

export default function ParentDashboard() {
  const router = useRouter()
  const [parent, setParent]       = useState(null)
  const [children, setChildren]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [notifs, setNotifs]       = useState([])
  const [tab, setTab]             = useState('overview') // overview | performance | notifications
  const [loading, setLoading]     = useState(true)
  const [linkModal, setLinkModal] = useState(false)
  const [linkCode, setLinkCode]   = useState('')
  const [linkError, setLinkError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('parent_token')
    if (!token) { router.replace('/parent'); return }
    loadAll()
  }, [])

  useEffect(() => {
    if (selected) loadDashboard(selected.id)
  }, [selected])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [meRes, childRes, notifRes] = await Promise.all([
        fetch(API + '/api/parent/auth/me', { headers: authHeaders() }),
        fetch(API + '/api/parent/children', { headers: authHeaders() }),
        fetch(API + '/api/parent/notifications', { headers: authHeaders() }),
      ])
      if (meRes.status === 401) { localStorage.clear(); router.replace('/parent'); return }
      const [meData, childData, notifData] = await Promise.all([meRes.json(), childRes.json(), notifRes.json()])
      setParent(meData.parent)
      setChildren(childData.children || [])
      setNotifs(notifData.notifications || [])
      if (childData.children?.length > 0) setSelected(childData.children[0])
    } finally {
      setLoading(false)
    }
  }

  const loadDashboard = async (id) => {
    const res = await fetch(API + `/api/parent/children/${id}/dashboard`, { headers: authHeaders() })
    const data = await res.json()
    setDashboard(data)
  }

  const logout = () => {
    fetch(API + '/api/parent/auth/logout', { method: 'POST', headers: authHeaders() })
    localStorage.removeItem('parent_token')
    localStorage.removeItem('parent_data')
    router.replace('/parent')
  }

  const linkChild = async () => {
    setLinkError('')
    try {
      const res = await fetch(API + '/api/parent/auth/link', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ link_code: linkCode.toUpperCase() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message)
      setLinkModal(false); setLinkCode(''); loadAll()
    } catch (e) { setLinkError(e.message) }
  }

  const readAll = async () => {
    await fetch(API + '/api/parent/notifications/read-all', { method: 'POST', headers: authHeaders() })
    setNotifs(n => n.map(x => ({...x, is_read: true})))
  }

  const scoreColor = (pct) => pct >= 75 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const masteryBar = (pct) => (
    <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: scoreColor(pct), borderRadius: 4, transition: 'width .5s' }} />
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b', fontSize: 16 }}>Loading parent portal...</div>
    </div>
  )

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>👨‍👩‍👧‍👦</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>SchoolMATE Parent Portal</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Welcome, {parent?.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => router.push('/parent/add-student')}
              style={{ padding: '6px 14px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              + Create Student
            </button>
            <button onClick={() => setLinkModal(true)}
              style={{ padding: '6px 14px', background: '#334155', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
              Link Child
            </button>
            <button onClick={logout}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', cursor: 'pointer', fontSize: 13 }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
        {children.length === 0 ? (
          /* No children linked */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No children linked yet</div>
            <div style={{ color: '#64748b', marginBottom: 24 }}>Ask your child for their Parent Link Code from their student portal profile.</div>
            <button onClick={() => setLinkModal(true)}
              style={{ padding: '12px 28px', background: '#3b82f6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
              Link Your Child Now
            </button>
          </div>
        ) : (<>
          {/* Child Selector */}
          {children.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto' }}>
              {children.map(c => (
                <button key={c.id} onClick={() => setSelected(c)}
                  style={{ padding: '10px 18px', background: selected?.id === c.id ? '#3b82f6' : '#1e293b',
                    border: `1px solid ${selected?.id === c.id ? '#3b82f6' : '#334155'}`,
                    borderRadius: 10, color: '#f1f5f9', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Child Info Banner */}
          {selected && (
            <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#1e293b)', border: '1px solid #1d4ed8', borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ color: '#93c5fd', fontSize: 14, marginTop: 2 }}>
                  {selected.grade_level} {selected.strand ? `· ${selected.strand}` : ''} {selected.school_name ? `· ${selected.school_name}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Quizzes', value: dashboard?.stats?.total_quizzes ?? '—' },
                  { label: 'Avg Score', value: dashboard?.stats?.avg_score != null ? `${dashboard.stats.avg_score}%` : '—' },
                  { label: 'Mastered', value: dashboard?.stats?.mastered_topics ?? '—' },
                  { label: 'At Risk', value: dashboard?.stats?.at_risk_topics ?? '—', color: dashboard?.stats?.at_risk_topics > 0 ? '#ef4444' : '#22c55e' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color || '#f1f5f9' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1e293b', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {[
              { key: 'overview', label: '📊 Overview' },
              { key: 'performance', label: '📚 Performance' },
              { key: 'notifications', label: `🔔 Alerts${unread > 0 ? ` (${unread})` : ''}` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: tab === t.key ? '#3b82f6' : 'transparent',
                  color: tab === t.key ? '#fff' : '#64748b' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && dashboard && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
              {/* Subject Mastery */}
              <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Subject Overview</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(dashboard.subject_mastery || []).slice(0,6).map((s, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13 }}>{s.icon} {s.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: scoreColor(s.avg_mastery) }}>{s.avg_mastery}%</div>
                      </div>
                      {masteryBar(s.avg_mastery)}
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{s.mastered}/{s.total} topics mastered</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Quizzes */}
              <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Quizzes</div>
                {(dashboard.recent_quizzes || []).length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: 13 }}>No quizzes taken yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dashboard.recent_quizzes.map((q, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0f172a', borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{q.subject}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{q.topic} · {q.date}</div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(q.pct) }}>{q.pct}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {tab === 'performance' && selected && (
            <PerformanceTab studentId={selected.id} />
          )}

          {/* NOTIFICATIONS TAB */}
          {tab === 'notifications' && (
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 600 }}>Notifications</div>
                {unread > 0 && (
                  <button onClick={readAll} style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifs.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 40 }}>No notifications yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifs.map((n, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: n.is_read ? '#0f172a' : '#1e3a5f', borderRadius: 10, borderLeft: `3px solid ${n.is_read ? '#334155' : '#3b82f6'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{n.created_at}</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{n.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>)}
      </div>

      {/* Link Child Modal */}
      {linkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, border: '1px solid #334155' }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Link Another Child</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Ask your child for their Parent Link Code from their student portal profile.</div>
            <input value={linkCode} onChange={e => setLinkCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD34"
              style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 16, fontFamily: 'monospace', letterSpacing: 3, boxSizing: 'border-box', marginBottom: 12 }} />
            {linkError && <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{linkError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setLinkModal(false); setLinkCode(''); setLinkError('') }}
                style={{ flex: 1, padding: 12, background: '#334155', border: 'none', borderRadius: 10, color: '#f1f5f9', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={linkChild}
                style={{ flex: 1, padding: 12, background: '#3b82f6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PerformanceTab({ studentId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/parent/children/${studentId}/performance`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [studentId])

  const scoreColor = (pct) => pct >= 75 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading performance data...</div>
  if (!data?.subjects?.length) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>No performance data yet. Your child needs to take some quizzes first.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.subjects.map((s, i) => (
        <div key={i} style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
          {/* Subject Header */}
          <div onClick={() => setExpanded(expanded === i ? null : i)}
            style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon || '📚'}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {s.status.mastered} mastered · {s.status.at_risk} at risk · {s.status.not_started} not started
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(s.avg_mastery) }}>{s.avg_mastery}%</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>avg mastery</div>
              </div>
              <div style={{ color: '#64748b', fontSize: 18 }}>{expanded === i ? '▲' : '▼'}</div>
            </div>
          </div>

          {/* Topic List */}
          {expanded === i && (
            <div style={{ borderTop: '1px solid #334155', padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(
                s.topics.reduce((acc, t) => { const q = `Q${t.quarter||1}`; if(!acc[q]) acc[q]=[]; acc[q].push(t); return acc }, {})
              ).map(([quarter, topics]) => (
                <div key={quarter}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{quarter}</div>
                  {topics.map((t, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid #0f172a' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: t.mastery >= 75 ? '#22c55e' : t.attempts === 0 ? '#475569' : t.mastery >= 40 ? '#f59e0b' : '#ef4444' }} />
                      <div style={{ flex: 1, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{t.attempts} quiz{t.attempts !== 1 ? 'zes' : ''}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.attempts === 0 ? '#475569' : scoreColor(t.mastery), minWidth: 38, textAlign: 'right' }}>
                        {t.attempts === 0 ? '—' : `${t.mastery}%`}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
