'use client'
import { useState, useEffect } from 'react'

const GRADES = [7, 8, 9, 10, 11, 12]
const STRANDS = ['', 'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Sports', 'Arts & Design']

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [gradeLevel, setGradeLevel] = useState(null)
  const [strand, setStrand] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [subjects, setSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (step === 2) {
      const token = localStorage.getItem('token')
      fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {})
    }
  }, [step])

  function toggleSubject(id) {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function finish() {
    if (selectedSubjects.length === 0) { setError('Please select at least one subject.'); return }
    setSaving(true); setError('')
    const token = localStorage.getItem('token')
    try {
      await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade_level: gradeLevel, strand, school_name: schoolName, subject_ids: selectedSubjects }),
      })
      window.location.href = '/dashboard'
    } catch { setError('Something went wrong. Try again.') } finally { setSaving(false) }
  }

  const card = { background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #f3f4f6', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-body)' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: '32px', height: '6px', borderRadius: '3px', background: s <= step ? 'linear-gradient(90deg,#2563eb,#7c3aed)' : '#e5e7eb', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={card}>
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👋</div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827' }}>Welcome to SchoolMATE!</h1>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px' }}>Let's set up your profile so we can personalize your learning experience.</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>What grade are you in?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
                  {GRADES.map(g => (
                    <button key={g} onClick={() => setGradeLevel(g)} style={{
                      padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                      border: gradeLevel === g ? '2px solid #2563eb' : '2px solid #e5e7eb',
                      background: gradeLevel === g ? '#eff6ff' : 'white',
                      fontFamily: 'inherit', fontWeight: '700', fontSize: '0.875rem',
                      color: gradeLevel === g ? '#2563eb' : '#374151',
                    }}>G{g}</button>
                  ))}
                </div>
              </div>

              {gradeLevel >= 11 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Academic Strand <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optional)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {STRANDS.filter(Boolean).map(s => (
                      <button key={s} onClick={() => setStrand(strand === s ? '' : s)} style={{ padding: '5px 12px', borderRadius: '8px', border: strand === s ? '2px solid #2563eb' : '2px solid #e5e7eb', background: strand === s ? '#eff6ff' : 'white', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: '600', color: strand === s ? '#2563eb' : '#374151', cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>School Name <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optional)</span></label>
                <input type="text" placeholder="e.g. Rizal High School" value={schoolName} onChange={e => setSchoolName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', color: '#111827' }} />
              </div>

              <button onClick={() => { if (!gradeLevel) { setError('Please select your grade level.'); return } setError(''); setStep(2) }}
                style={{ width: '100%', padding: '11px', background: gradeLevel ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e5e7eb', color: gradeLevel ? 'white' : '#9ca3af', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: gradeLevel ? 'pointer' : 'not-allowed', boxShadow: gradeLevel ? '0 4px 14px rgba(37,99,235,0.3)' : 'none' }}>
                Continue →
              </button>
              {error && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#dc2626', textAlign: 'center' }}>{error}</div>}
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827' }}>Choose Your Subjects</h1>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>Pick the subjects you're currently enrolled in.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.5rem', maxHeight: '380px', overflowY: 'auto' }}>
                {subjects.map(s => {
                  const selected = selectedSubjects.includes(s.id)
                  return (
                    <button key={s.id} onClick={() => toggleSubject(s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                      border: selected ? `2px solid ${s.color}` : '2px solid #e5e7eb',
                      background: selected ? s.color + '12' : 'white', fontFamily: 'inherit',
                    }}>
                      <span style={{ fontSize: '1.15rem' }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: selected ? s.color : '#374151' }}>{s.name}</div>
                        {selected && <div style={{ fontSize: '0.65rem', color: s.color }}>✓ Selected</div>}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginBottom: '1rem' }}>
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </div>

              {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#374151', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>← Back</button>
                <button onClick={finish} disabled={saving || selectedSubjects.length === 0} style={{ flex: 1, padding: '11px', background: selectedSubjects.length > 0 ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e5e7eb', color: selectedSubjects.length > 0 ? 'white' : '#9ca3af', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: selectedSubjects.length > 0 ? 'pointer' : 'not-allowed' }}>
                  {saving ? 'Setting up...' : "🚀 Let's Go!"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
