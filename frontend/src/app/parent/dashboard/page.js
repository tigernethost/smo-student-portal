'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('parent_token') : ''
  return { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; background: #f8f7ff; }
  .tab-btn { border: none; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all .15s; }
  .child-chip { border: none; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all .15s; border-radius: 99px; }
  .child-chip:hover { transform: translateY(-1px); }
  .action-btn { border: none; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all .15s; border-radius: 12px; font-weight: 700; }
  .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
  .card { background: #fff; border-radius: 20px; border: 1px solid #f0eefd; box-shadow: 0 2px 16px rgba(108,99,255,.06); }
  .subject-row { border-radius: 12px; transition: background .15s; cursor: pointer; }
  .subject-row:hover { background: #f8f7ff; }
  .notif-item { border-radius: 12px; transition: background .15s; }
  .link-input {
    width: 100%; background: #f8f7ff; border: 1.5px solid #e5e7eb;
    border-radius: 12px; padding: 14px 16px; color: #1a1a2e;
    font-size: 18px; outline: none; font-family: monospace; letter-spacing: .12em;
    text-transform: uppercase; text-align: center;
  }
  .link-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,.12); }
`

export default function ParentDashboard() {
  const router = useRouter()
  const [parent, setParent]       = useState(null)
  const [children, setChildren]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [notifs, setNotifs]       = useState([])
  const [tab, setTab]             = useState('overview')
  const [loading, setLoading]     = useState(true)
  const [linkModal, setLinkModal] = useState(false)
  const [linkCode, setLinkCode]   = useState('')
  const [linkError, setLinkError] = useState('')
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('parent_token')
    if (!token) { router.replace('/parent/login'); return }
    loadAll()
  }, [])

  useEffect(() => { if (selected) loadDashboard(selected.id) }, [selected])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [meRes, childRes, notifRes] = await Promise.all([
        fetch(API + '/api/parent/auth/me', { headers: authHeaders() }),
        fetch(API + '/api/parent/children', { headers: authHeaders() }),
        fetch(API + '/api/parent/notifications', { headers: authHeaders() }),
      ])
      if (meRes.status === 401) { localStorage.clear(); router.replace('/parent/login'); return }
      const [meData, childData, notifData] = await Promise.all([meRes.json(), childRes.json(), notifRes.json()])
      setParent(meData.parent)
      setChildren(childData.children || [])
      setNotifs(notifData.notifications || [])
      if (childData.children?.length > 0) setSelected(childData.children[0])
    } finally { setLoading(false) }
  }

  const loadDashboard = async (id) => {
    const res = await fetch(API + `/api/parent/children/${id}/dashboard`, { headers: authHeaders() })
    const data = await res.json()
    setDashboard(data)
  }

  const logout = () => {
    fetch(API + '/api/parent/auth/logout', { method: 'POST', headers: authHeaders() })
    localStorage.removeItem('parent_token'); localStorage.removeItem('parent_data')
    router.replace('/parent/login')
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

  const scoreColor = (pct) => pct >= 75 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626'
  const scoreBg    = (pct) => pct >= 75 ? '#dcfce7' : pct >= 40 ? '#fef3c7' : '#fee2e2'

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
          <p style={{ color: '#6b7280', fontFamily: "'Nunito',sans-serif", fontSize: 15 }}>Loading your dashboard…</p>
        </div>
      </div>
    </>
  )

  const unread = notifs.filter(n => !n.is_read).length
  const firstName = parent?.name?.split(' ')[0] || 'Parent'

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Nunito',sans-serif", color: '#1a1a2e' }}>

        {/* Top Nav */}
        <nav style={{ background: '#fff', borderBottom: '1px solid #f0eefd', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(108,99,255,.06)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍👩‍👧‍👦</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.3px', color: '#1a1a2e' }}>SchoolMATE</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Parent Portal</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unread > 0 && (
                <button className="tab-btn" onClick={() => setTab('notifications')}
                  style={{ position: 'relative', background: '#fef3c7', borderRadius: 10, padding: '6px 12px', fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                  🔔 {unread}
                </button>
              )}
              <button className="action-btn" onClick={() => router.push('/parent/add-student')}
                style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff', padding: '8px 16px', fontSize: 13 }}>
                + Add Student
              </button>
              <div style={{ position: 'relative' }}>
                <button className="tab-btn" onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: '#f8f7ff', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 700, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {parent?.name?.split(' ')[0]} ▾
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.12)', border: '1px solid #f0eefd', minWidth: 180, padding: 8, zIndex: 200 }}>
                    {[
                      { label: '🔗 Link Another Child', action: () => { setLinkModal(true); setMenuOpen(false) } },
                      { label: '⭐ Upgrade Plan', action: () => router.push('/parent/upgrade') },
                      { label: '🚪 Sign Out', action: logout, danger: true },
                    ].map((item, i) => (
                      <button key={i} className="tab-btn" onClick={item.action}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: item.danger ? '#dc2626' : '#374151', background: 'none' }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.5px' }}>Hello, {firstName}! 👋</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>Here's how your {children.length === 1 ? 'child is' : 'children are'} doing today.</p>
          </div>

          {children.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', padding: '80px 20px' }} className="card">
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔗</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>No children linked yet</h2>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Ask your child for their Parent Link Code from their SchoolMATE profile.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="action-btn" onClick={() => setLinkModal(true)}
                  style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff', padding: '12px 28px', fontSize: 15 }}>
                  🔗 Link with Code
                </button>
                <button className="action-btn" onClick={() => router.push('/parent/add-student')}
                  style={{ background: '#f8f7ff', color: '#6c63ff', padding: '12px 28px', fontSize: 15, border: '2px solid #e0ddff' }}>
                  ➕ Create Student Account
                </button>
              </div>
            </div>
          ) : (<>

            {/* Child Selector */}
            {children.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {children.map(c => (
                  <button key={c.id} className="child-chip" onClick={() => setSelected(c)}
                    style={{ padding: '8px 20px', background: selected?.id === c.id ? 'linear-gradient(135deg,#6c63ff,#a78bfa)' : '#fff',
                      color: selected?.id === c.id ? '#fff' : '#374151', fontWeight: 700, fontSize: 14,
                      border: selected?.id === c.id ? 'none' : '1.5px solid #e5e7eb',
                      boxShadow: selected?.id === c.id ? '0 4px 12px rgba(108,99,255,.3)' : 'none',
                      whiteSpace: 'nowrap' }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Child Hero Card */}
            {selected && (
              <div style={{ background: 'linear-gradient(135deg,#6c63ff 0%,#a78bfa 100%)', borderRadius: 24, padding: '24px 28px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(108,99,255,.35)' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,.08)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -40, right: 60, width: 120, height: 120, background: 'rgba(255,255,255,.06)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, opacity: .7, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Currently viewing</p>
                    <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>{selected.name}</h2>
                    <p style={{ opacity: .8, fontSize: 14, marginTop: 4 }}>
                      {selected.grade_level}{selected.strand ? ` · ${selected.strand}` : ''}{selected.school_name ? ` · ${selected.school_name}` : ''}
                    </p>
                    <button onClick={() => router.push(`/parent/children/${selected.id}`)}
                      style={{ marginTop: 14, background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, padding: '8px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      View Full Report →
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Quizzes', value: dashboard?.stats?.total_quizzes ?? '—' },
                      { label: 'Avg Score', value: dashboard?.stats?.avg_score != null ? `${dashboard.stats.avg_score}%` : '—' },
                      { label: 'Mastered', value: dashboard?.stats?.mastered_topics ?? '—', emoji: '🎯' },
                      { label: 'At Risk', value: dashboard?.stats?.at_risk_topics ?? '—', emoji: '⚠️', warn: dashboard?.stats?.at_risk_topics > 0 },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: s.warn ? '#fcd34d' : '#fff' }}>{s.value}</div>
                        <div style={{ fontSize: 11, opacity: .7, fontWeight: 600 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 14, padding: 4, width: 'fit-content', border: '1px solid #f0eefd' }}>
              {[
                { key: 'overview', label: '📊 Overview' },
                { key: 'performance', label: '📚 Performance' },
                { key: 'notifications', label: `🔔 Alerts${unread > 0 ? ` · ${unread}` : ''}` },
              ].map(t => (
                <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)}
                  style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: tab === t.key ? 'linear-gradient(135deg,#6c63ff,#a78bfa)' : 'transparent',
                    color: tab === t.key ? '#fff' : '#9ca3af',
                    boxShadow: tab === t.key ? '0 2px 8px rgba(108,99,255,.3)' : 'none' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>

                {/* Subject Mastery */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: '#1a1a2e' }}>Subject Overview</h3>
                  {(dashboard?.subject_mastery || []).length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No data yet. Your child needs to take some quizzes first.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {(dashboard.subject_mastery || []).slice(0,6).map((s, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{s.icon} {s.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(s.avg_mastery), background: scoreBg(s.avg_mastery), padding: '2px 8px', borderRadius: 99 }}>{s.avg_mastery}%</span>
                          </div>
                          <div style={{ height: 7, background: '#f0eefd', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.avg_mastery}%`, background: s.avg_mastery >= 75 ? '#16a34a' : s.avg_mastery >= 40 ? '#d97706' : '#dc2626', borderRadius: 99, transition: 'width .6s ease' }} />
                          </div>
                          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{s.mastered}/{s.total} topics mastered</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Quizzes */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: '#1a1a2e' }}>Recent Quizzes</h3>
                  {(dashboard?.recent_quizzes || []).length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No quizzes taken yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(dashboard.recent_quizzes || []).map((q, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8f7ff', borderRadius: 12 }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700 }}>{q.subject}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{q.topic} · {q.date}</p>
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 900, color: scoreColor(q.pct), background: scoreBg(q.pct), padding: '4px 10px', borderRadius: 99 }}>{q.pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERFORMANCE */}
            {tab === 'performance' && selected && <PerformanceTab studentId={selected.id} />}

            {/* NOTIFICATIONS */}
            {tab === 'notifications' && (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800 }}>Notifications</h3>
                  {unread > 0 && (
                    <button className="tab-btn" onClick={readAll}
                      style={{ fontSize: 13, color: '#6c63ff', background: '#ede9fe', borderRadius: 8, padding: '6px 12px', fontWeight: 700 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No notifications yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifs.map((n, i) => (
                      <div key={i} className="notif-item" style={{ padding: '14px 16px', background: n.is_read ? '#fafafa' : '#f5f3ff', borderRadius: 12, borderLeft: `3px solid ${n.is_read ? '#e5e7eb' : '#6c63ff'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af' }}>{n.created_at}</p>
                        </div>
                        <p style={{ fontSize: 13, color: '#6b7280' }}>{n.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>)}
        </div>

        {/* Link Modal */}
        {linkModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }} onClick={() => setLinkModal(false)}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🔗</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 6 }}>Link Another Child</h2>
              <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Ask your child for their Parent Link Code from their student portal profile.</p>
              <input className="link-input" value={linkCode} onChange={e => setLinkCode(e.target.value.toUpperCase())} placeholder="AB12CD34" />
              {linkError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: 600 }}>{linkError}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="action-btn" onClick={() => { setLinkModal(false); setLinkCode(''); setLinkError('') }}
                  style={{ flex: 1, padding: 13, background: '#f8f7ff', color: '#374151', fontSize: 15, border: '1.5px solid #e5e7eb' }}>Cancel</button>
                <button className="action-btn" onClick={linkChild}
                  style={{ flex: 1, padding: 13, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff', fontSize: 15 }}>Link Child</button>
              </div>
            </div>
          </div>
        )}

        {/* Menu overlay */}
        {menuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />}
      </div>
    </>
  )
}

function PerformanceTab({ studentId }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/parent/children/${studentId}/performance`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [studentId])

  const scoreColor = (pct) => pct >= 75 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626'
  const scoreBg    = (pct) => pct >= 75 ? '#dcfce7' : pct >= 40 ? '#fef3c7' : '#fee2e2'
  const dotColor   = (t) => t.attempts === 0 ? '#d1d5db' : t.mastery >= 75 ? '#16a34a' : t.mastery >= 40 ? '#d97706' : '#dc2626'

  if (loading) return <div style={{ color: '#9ca3af', padding: '40px 0', textAlign: 'center' }}>Loading…</div>
  if (!data?.subjects?.length) return <div style={{ color: '#9ca3af', padding: '60px 0', textAlign: 'center' }}>No quiz data yet. Encourage your child to take some quizzes!</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.subjects.map((s, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="subject-row" onClick={() => setExpanded(expanded === i ? null : i)}
            style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 26 }}>{s.icon || '📚'}</span>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  {s.status.mastered} mastered · {s.status.at_risk} at risk · {s.status.not_started} not started
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: scoreColor(s.avg_mastery), background: scoreBg(s.avg_mastery), padding: '4px 12px', borderRadius: 99 }}>{s.avg_mastery}%</span>
              <span style={{ color: '#9ca3af', fontSize: 14, fontWeight: 700 }}>{expanded === i ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === i && (
            <div style={{ borderTop: '1px solid #f0eefd', padding: '16px 24px 20px', background: '#fafafa' }}>
              {Object.entries(s.topics.reduce((acc, t) => { const q = `Quarter ${t.quarter||1}`; if(!acc[q]) acc[q]=[]; acc[q].push(t); return acc }, {})).map(([quarter, topics]) => (
                <div key={quarter} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{quarter}</p>
                  {topics.map((t, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: dotColor(t) }} />
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>{t.attempts} quiz{t.attempts !== 1 ? 'zes' : ''}</p>
                      <span style={{ fontSize: 13, fontWeight: 800, color: t.attempts === 0 ? '#d1d5db' : scoreColor(t.mastery), minWidth: 44, textAlign: 'right' }}>
                        {t.attempts === 0 ? '—' : `${t.mastery}%`}
                      </span>
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
