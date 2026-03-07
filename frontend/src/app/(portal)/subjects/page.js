'use client'
import Link from 'next/link'

const subjects = [
  { id: 1, name: 'Mathematics', code: 'MATH8', teacher: 'Mr. Santos', avg: 92, q1: 90, q2: 91, q3: 95, trend: 'up', color: '#2563eb', icon: '📐', units: 4, completedUnits: 3, topics: 24, masteredTopics: 19 },
  { id: 2, name: 'English', code: 'ENG8', teacher: 'Ms. Reyes', avg: 88, q1: 85, q2: 87, q3: 88, trend: 'stable', color: '#7c3aed', icon: '📖', units: 4, completedUnits: 3, topics: 20, masteredTopics: 16 },
  { id: 3, name: 'Science', code: 'SCI8', teacher: 'Mr. Cruz', avg: 85, q1: 82, q2: 83, q3: 89, trend: 'up', color: '#059669', icon: '🔬', units: 4, completedUnits: 3, topics: 22, masteredTopics: 15 },
  { id: 4, name: 'Filipino', code: 'FIL8', teacher: 'Ms. Garcia', avg: 90, q1: 88, q2: 90, q3: 90, trend: 'stable', color: '#d97706', icon: '🇵🇭', units: 4, completedUnits: 3, topics: 18, masteredTopics: 16 },
  { id: 5, name: 'Araling Panlipunan', code: 'AP8', teacher: 'Mr. Dela Rosa', avg: 83, q1: 86, q2: 88, q3: 83, trend: 'down', color: '#dc2626', icon: '🌏', units: 4, completedUnits: 3, topics: 20, masteredTopics: 12 },
  { id: 6, name: 'TLE', code: 'TLE8', teacher: 'Ms. Bautista', avg: 91, q1: 89, q2: 90, q3: 93, trend: 'up', color: '#0891b2', icon: '🔧', units: 4, completedUnits: 3, topics: 16, masteredTopics: 14 },
  { id: 7, name: 'MAPEH', code: 'MAPEH8', teacher: 'Mr. Villanueva', avg: 87, q1: 85, q2: 86, q3: 87, trend: 'stable', color: '#db2777', icon: '🎨', units: 4, completedUnits: 3, topics: 14, masteredTopics: 11 },
  { id: 8, name: 'Values Education', code: 'VE8', teacher: 'Ms. Torres', avg: 94, q1: 92, q2: 94, q3: 95, trend: 'up', color: '#9333ea', icon: '🌟', units: 4, completedUnits: 4, topics: 12, masteredTopics: 12 },
]

export default function SubjectsPage() {
  const overall = Math.round(subjects.reduce((a, s) => a + s.avg, 0) / subjects.length * 10) / 10

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>My Subjects</h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
          Grade 8 · S.Y. 2025–2026 · Quarter 3
        </p>
      </div>

      {/* Summary strip */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
        borderRadius: '16px', padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem',
        color: 'white',
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Quarterly Average</p>
          <p style={{ fontSize: '2rem', fontWeight: '800' }}>{overall}%</p>
        </div>
        {[
          ['📚', subjects.length, 'Enrolled Subjects'],
          ['✅', subjects.filter(s => s.avg >= 90).length, 'Outstanding (90+)'],
          ['⚠️', subjects.filter(s => s.avg < 85).length, 'Needs Attention'],
          ['🌳', subjects.reduce((a, s) => a + s.masteredTopics, 0), 'Topics Mastered'],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{icon} {val}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Subject cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {subjects.map(s => {
          const trendIcon = s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'
          const trendColor = s.trend === 'up' ? '#16a34a' : s.trend === 'down' ? '#dc2626' : '#6b7280'
          const masteryPct = Math.round(s.masteredTopics / s.topics * 100)
          const grade = s.avg >= 90 ? 'Outstanding' : s.avg >= 85 ? 'Very Satisfactory' : s.avg >= 80 ? 'Satisfactory' : 'Needs Improvement'
          const gradeColor = s.avg >= 90 ? '#16a34a' : s.avg >= 85 ? '#2563eb' : s.avg >= 80 ? '#d97706' : '#dc2626'

          return (
            <Link key={s.id} href={`/subjects/${s.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', borderRadius: '16px', padding: '1.25rem',
                border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: `${s.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', flexShrink: 0,
                    }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.teacher} · {s.code}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.avg}%</div>
                    <div style={{ fontSize: '0.72rem', color: trendColor, fontWeight: '600' }}>{trendIcon} Q3</div>
                  </div>
                </div>

                {/* Grade descriptor */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 10px', borderRadius: '6px',
                  background: `${gradeColor}15`, color: gradeColor,
                  fontSize: '0.72rem', fontWeight: '700',
                  marginBottom: '0.875rem',
                }}>
                  {grade}
                </div>

                {/* Quarter trend */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '0.875rem' }}>
                  {[['Q1', s.q1], ['Q2', s.q2], ['Q3', s.q3]].map(([q, val]) => (
                    <div key={q} style={{ flex: 1, background: '#f9fafb', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '1px' }}>{q}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Mastery bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Topic Mastery</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#374151' }}>{s.masteredTopics}/{s.topics} topics ({masteryPct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px' }}>
                    <div style={{
                      width: `${masteryPct}%`, height: '100%',
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}99)`,
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
