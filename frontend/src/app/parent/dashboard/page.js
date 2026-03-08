'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function useParentAuth() {
  const router = useRouter()
  const [parent, setParent] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('parent_token')
    const p = localStorage.getItem('parent_data')
    if (!t) { router.push('/parent/login'); return }
    setToken(t)
    if (p) setParent(JSON.parse(p))
  }, [])

  const logout = () => {
    localStorage.removeItem('parent_token')
    localStorage.removeItem('parent_data')
    router.push('/parent/login')
  }

  return { parent, token, logout }
}

export default function ParentDashboard() {
  const { parent, token, logout } = useParentAuth()
  const router = useRouter()
  const [children, setChildren] = useState([])
  const [selected, setSelected] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [linkModal, setLinkModal] = useState(false)
  const [linkCode, setLinkCode] = useState('')
  const [linkRelationship, setLinkRelationship] = useState('Guardian')
  const [linkError, setLinkError] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (!token) return
    fetchChildren()
    fetchNotifCount()
  }, [token])

  useEffect(() => {
    if (selected && token) fetchDashboard(selected.id)
  }, [selected])

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }

  async function fetchChildren() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/parent/children`, { headers })
      const data = await res.json()
      setChildren(data.children || [])
      if (data.children?.length > 0 && !selected) setSelected(data.children[0])
    } catch {}
    setLoading(false)
  }

  async function fetchNotifCount() {
    try {
      const res = await fetch(`${API}/api/parent/notifications`, { headers })
      const data = await res.json()
      setNotifCount(data.unread_count || 0)
    } catch {}
  }

  async function fetchDashboard(id) {
    setDashboard(null)
    try {
      const res = await fetch(`${API}/api/parent/children/${id}/dashboard`, { headers })
      const data = await res.json()
      setDashboard(data)
    } catch {}
  }

  async function addChild() {
    setLinkError('')
    setLinkLoading(true)
    try {
      const res = await fetch(`${API}/api/parent/auth/link`, {
        method: 'POST', headers,
        body: JSON.stringify({ link_code: linkCode.trim().toUpperCase(), relationship: linkRelationship })
      })
      const data = await res.json()
      if (!res.ok) { setLinkError(data.error || 'Invalid code'); setLinkLoading(false); return }
      setLinkModal(false)
      setLinkCode('')
      fetchChildren()
    } catch {
      setLinkError('Network error')
    }
    setLinkLoading(false)
  }

  if (!parent && loading) return <Loading />

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>👨‍👩‍👧‍👦</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>SchoolMATE</div>
            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Parent Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/parent/notifications" style={{ position: 'relative', color: '#94a3b8', textDecoration: 'none', fontSize: '1.3rem' }}>
            🔔
            {notifCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{notifCount}</span>}
          </Link>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{parent?.name}</div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.35rem 0.75rem', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>

        {/* Child selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>My Children:</span>
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c)}
              style={{ background: selected?.id === c.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)', border: `1px solid ${selected?.id === c.id ? 'transparent' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '0.4rem 1rem', color: '#fff', fontSize: '0.875rem', cursor: 'pointer', fontWeight: selected?.id === c.id ? 600 : 400 }}>
              {c.name}
            </button>
          ))}
          <button onClick={() => setLinkModal(true)}
            style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.4rem 1rem', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            + Add Child
          </button>
        </div>

        {children.length === 0 && !loading && <NoChildren onAdd={() => setLinkModal(true)} />}

        {selected && dashboard && <DashboardContent dashboard={dashboard} student={selected} />}
        {selected && !dashboard && <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</div>}
      </div>

      {/* Link Child Modal */}
      {linkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Link Another Child</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>Ask your child to go to Settings → Generate Parent Link Code</p>

            {linkError && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>{linkError}</div>}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Link Code</label>
              <input value={linkCode} onChange={e => setLinkCode(e.target.value.toUpperCase())} placeholder="AB12CD34" maxLength={12}
                style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace', letterSpacing: '0.1em', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Relationship</label>
              <select value={linkRelationship} onChange={e => setLinkRelationship(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Grandparent">Grandparent</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setLinkModal(false); setLinkCode(''); setLinkError('') }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addChild} disabled={linkLoading || !linkCode} style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '0.75rem', color: '#fff', fontWeight: 600, cursor: linkLoading ? 'not-allowed' : 'pointer' }}>
                {linkLoading ? 'Linking…' : 'Link Child'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardContent({ dashboard, student }) {
  const { stats, recent_quizzes, subject_mastery, relationship } = dashboard

  return (
    <div>
      {/* Child header card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{student.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {student.grade_level} {student.strand ? `— ${student.strand}` : ''} · {student.school_name || 'SchoolMATE Student'}
            </div>
            <div style={{ color: '#818cf8', fontSize: '0.8rem', marginTop: '0.2rem' }}>{relationship}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <MiniStat value={`${student.mastery_pct}%`} label="Mastery" color="#6366f1" />
          <MiniStat value={student.at_risk} label="At Risk" color="#ef4444" />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="📝" value={stats.total_quizzes} label="Quizzes Taken" color="#6366f1" />
        <StatCard icon="🎯" value={`${stats.avg_score}%`} label="Avg Score" color="#10b981" />
        <StatCard icon="✅" value={stats.mastered_topics} label="Topics Mastered" color="#8b5cf6" />
        <StatCard icon="⚠️" value={stats.at_risk_topics} label="Need Attention" color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Subject mastery */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>📚 Subject Mastery</h3>
          {subject_mastery.length === 0 && <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No quiz data yet</div>}
          {subject_mastery.map((s, i) => (
            <div key={i} style={{ marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{s.icon} {s.name}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: s.avg_mastery >= 75 ? '#10b981' : s.avg_mastery >= 40 ? '#f59e0b' : '#ef4444' }}>{s.avg_mastery}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${s.avg_mastery}%`, background: s.avg_mastery >= 75 ? '#10b981' : s.avg_mastery >= 40 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>{s.mastered}/{s.total} topics mastered</div>
            </div>
          ))}
        </div>

        {/* Recent quizzes */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>🕐 Recent Quizzes</h3>
          {recent_quizzes.length === 0 && <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No quizzes taken yet</div>}
          {recent_quizzes.map((q, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>{q.subject}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{q.topic} · {q.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: q.pct >= 75 ? '#10b981' : q.pct >= 50 ? '#f59e0b' : '#ef4444' }}>{q.pct}%</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{q.score}/{q.total}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <a href={`/parent/children/${student.id}`} style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none' }}>View full performance →</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{label}</div>
    </div>
  )
}

function MiniStat({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{label}</div>
    </div>
  )
}

function NoChildren({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👶</div>
      <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>No children linked yet</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ask your child for their Parent Link Code from the SchoolMATE app</p>
      <button onClick={onAdd} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
        + Link a Child
      </button>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b' }}>Loading…</div>
    </div>
  )
}
