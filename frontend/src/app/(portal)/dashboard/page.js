'use client'
import Link from 'next/link'

// Mock data - will be replaced with API calls
const student = {
  name: 'Juan dela Cruz',
  grade: 8,
  section: 'Sampaguita',
  schoolYear: '2025-2026',
  quarter: 3,
  average: 87.4,
  attendanceRate: 94.2,
  rank: 3,
  totalStudents: 42,
}

const subjects = [
  { id: 1, name: 'Mathematics', code: 'MATH8', teacher: 'Mr. Santos', avg: 92, trend: 'up', color: '#2563eb', icon: '📐' },
  { id: 2, name: 'English', code: 'ENG8', teacher: 'Ms. Reyes', avg: 88, trend: 'stable', color: '#7c3aed', icon: '📖' },
  { id: 3, name: 'Science', code: 'SCI8', teacher: 'Mr. Cruz', avg: 85, trend: 'up', color: '#059669', icon: '🔬' },
  { id: 4, name: 'Filipino', code: 'FIL8', teacher: 'Ms. Garcia', avg: 90, trend: 'stable', color: '#d97706', icon: '🇵🇭' },
  { id: 5, name: 'Araling Panlipunan', code: 'AP8', teacher: 'Mr. Dela Rosa', avg: 83, trend: 'down', color: '#dc2626', icon: '🌏' },
  { id: 6, name: 'TLE', code: 'TLE8', teacher: 'Ms. Bautista', avg: 91, trend: 'up', color: '#0891b2', icon: '🔧' },
]

const recommendations = [
  { subject: 'Araling Panlipunan', topic: 'Southeast Asian History', priority: 'high', reason: 'Score dropped 5 points this quarter' },
  { subject: 'Science', topic: 'Chemical Equations', priority: 'medium', reason: 'Nearing mastery threshold — push now!' },
  { subject: 'Mathematics', topic: 'Quadratic Equations', priority: 'low', reason: 'Review to maintain your lead' },
]

const recentActivity = [
  { type: 'quiz', subject: 'Math', title: 'Quadratic Equations Quiz', score: 38, total: 40, date: '2 hours ago' },
  { type: 'exam', subject: 'English', title: 'Quarter 3 Periodical', score: 85, total: 100, date: 'Yesterday' },
  { type: 'quiz', subject: 'Science', title: 'Chemical Reactions Quiz', score: 17, total: 20, date: '3 days ago' },
]

function StatCard({ icon, label, value, sub, color = '#2563eb', bg = '#eff6ff' }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.25rem',
      border: '1px solid #f3f4f6',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.1rem',
      }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{sub}</div>}
    </div>
  )
}

function SubjectCard({ subject }) {
  const trendIcon = subject.trend === 'up' ? '↑' : subject.trend === 'down' ? '↓' : '→'
  const trendColor = subject.trend === 'up' ? '#16a34a' : subject.trend === 'down' ? '#dc2626' : '#6b7280'

  return (
    <Link href={`/subjects/${subject.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: '14px', padding: '1.1rem',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: `${subject.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>{subject.icon}</div>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: trendColor }}>
            {trendIcon} {subject.avg}%
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{subject.name}</div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.625rem' }}>{subject.teacher}</div>
        <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px' }}>
          <div style={{
            width: `${subject.avg}%`, height: '100%',
            background: `linear-gradient(90deg, ${subject.color}, ${subject.color}99)`,
            borderRadius: '2px', transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
          {greeting} 👋
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', lineHeight: 1.2 }}>
          {student.name}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
          Grade {student.grade} · Section {student.section} · Q{student.quarter} SY {student.schoolYear}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem', marginBottom: '1.75rem',
      }}>
        <StatCard icon="📊" label="Overall Average" value={`${student.average}%`} sub="↑ +2.1% from last quarter" color="#2563eb" bg="#eff6ff" />
        <StatCard icon="📅" label="Attendance Rate" value={`${student.attendanceRate}%`} sub="19 of 20 days present" color="#059669" bg="#f0fdf4" />
        <StatCard icon="🏆" label="Class Rank" value={`#${student.rank}`} sub={`of ${student.totalStudents} students`} color="#d97706" bg="#fffbeb" />
        <StatCard icon="📚" label="Subjects" value={subjects.length} sub="All enrolled & active" color="#7c3aed" bg="#f5f3ff" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Left column */}
        <div>
          {/* Subjects grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>My Subjects</h2>
              <Link href="/subjects" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                View all →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
              {subjects.map(s => <SubjectCard key={s.id} subject={s} />)}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Recent Activity</h2>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid #f9fafb' : 'none',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: a.type === 'exam' ? '#fef3c7' : '#eff6ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                  }}>
                    {a.type === 'exam' ? '📝' : '✏️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.subject} · {a.date}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: (a.score / a.total) >= 0.85 ? '#16a34a' : (a.score / a.total) >= 0.75 ? '#d97706' : '#dc2626' }}>
                      {a.score}/{a.total}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{Math.round(a.score / a.total * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Performance ring */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
            borderRadius: '16px', padding: '1.5rem',
            color: 'white', textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Quarter Performance
            </p>
            {/* Simple ring */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem' }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="8"
                  strokeDasharray={`${student.average * 2.51} ${251 - student.average * 2.51}`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>{student.average}</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>avg</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {[
                { label: 'Highest', value: '92% Math' },
                { label: 'Lowest', value: '83% AP' },
                { label: 'Improving', value: '3 subjects' },
                { label: 'At Risk', value: '1 subject' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '0.5rem 0.625rem',
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1rem' }}>🤖</span>
              <h2 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>Study Recommendations</h2>
            </div>
            {recommendations.map((r, i) => {
              const colors = { high: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }, medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }, low: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' } }
              const c = colors[r.priority]
              return (
                <div key={i} style={{
                  padding: '0.75rem', borderRadius: '10px',
                  background: c.bg, border: `1px solid ${c.border}`,
                  marginBottom: i < recommendations.length - 1 ? '0.625rem' : 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#111827' }}>{r.subject}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: c.text, background: 'white', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {r.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151' }}>{r.topic}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{r.reason}</div>
                </div>
              )
            })}
            <Link href="/learning-path" style={{
              display: 'block', textAlign: 'center', marginTop: '0.875rem',
              padding: '8px', background: '#eff6ff',
              borderRadius: '8px', color: '#2563eb',
              textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600',
              border: '1px solid #bfdbfe',
            }}>
              View Learning Path →
            </Link>
          </div>

          {/* Attendance mini card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>📅 Attendance — Q3</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {Array.from({ length: 20 }, (_, i) => {
                const status = i === 7 ? 'absent' : i === 13 ? 'late' : 'present'
                return (
                  <div key={i} title={`Day ${i + 1}: ${status}`} style={{
                    height: '24px', borderRadius: '4px',
                    background: status === 'absent' ? '#fecaca' : status === 'late' ? '#fde68a' : '#bbf7d0',
                    cursor: 'default',
                  }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              {[['#bbf7d0', '18 Present'], ['#fde68a', '1 Late'], ['#fecaca', '1 Absent']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#6b7280' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
