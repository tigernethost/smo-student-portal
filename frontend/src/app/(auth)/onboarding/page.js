'use client'
import { useState, useEffect, useRef } from 'react'

const GRADES = [7, 8, 9, 10, 11, 12]
const STRANDS = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Sports', 'Arts & Design']
const GOALS = [
  { value: 'pass_exams',       label: 'Pass my exams',         icon: '✅', desc: 'Focus on clearing tests & requirements' },
  { value: 'improve_grades',   label: 'Improve my grades',     icon: '📈', desc: 'Push my scores higher this quarter' },
  { value: 'prepare_college',  label: 'Prepare for college',   icon: '🎓', desc: 'Build a strong foundation for university' },
  { value: 'self_study',       label: 'Self-study & explore',  icon: '🔍', desc: 'Learn beyond the classroom curriculum' },
]
const CHALLENGES = [
  { value: 'time_management',   label: 'Time management',         icon: '⏰', desc: "Hard to find time to study everything" },
  { value: 'understanding',     label: 'Understanding lessons',   icon: '🤔', desc: "Some topics just don't click for me" },
  { value: 'test_anxiety',      label: 'Test anxiety',            icon: '😰', desc: 'I know the material but freeze during exams' },
  { value: 'lack_of_materials', label: 'Lack of study materials', icon: '📚', desc: 'Hard to find good resources to review with' },
]
const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const [step, setStep]   = useState(1)
  const [user, setUser]   = useState(null)

  const [name, setName]               = useState('')
  const [avatarFile, setAvatarFile]   = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [gradeLevel, setGradeLevel]   = useState(null)
  const [strand, setStrand]           = useState('')
  const [schoolName, setSchoolName]   = useState('')

  const [subjects, setSubjects]               = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])

  const [goal, setGoal]           = useState('')
  const [challenge, setChallenge] = useState('')

  const [gradeFile, setGradeFile]         = useState(null)
  const [gradeFileName, setGradeFileName] = useState('')
  const [uploading, setUploading]         = useState(false)
  const [aiResult, setAiResult]           = useState(null)
  const [uploadError, setUploadError]     = useState('')

  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeData, setWelcomeData] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const fileInputRef  = useRef()
  const gradeInputRef = useRef()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) return
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(u => {
        setUser(u)
        if (u.name) setName(u.name)
        if (u.avatar_url) setAvatarPreview(u.avatar_url)
      }).catch(() => {})
  }, [])

  useEffect(() => {
    if (step === 3 && subjects.length === 0) {
      fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {})
    }
  }, [step])

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleGradeFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setGradeFile(file)
    setGradeFileName(file.name)
    setAiResult(null)
    setUploadError('')
  }

  async function analyzeGrades() {
    if (!gradeFile) return
    setUploading(true); setUploadError(''); setAiResult(null)
    try {
      const fd = new FormData()
      fd.append('file', gradeFile)
      fd.append('type', 'report_card')
      const res = await fetch('/api/uploads', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await res.json()
      if (data.id) setAiResult(data)
      else setUploadError('Could not analyze the file. Try a clearer image.')
    } catch { setUploadError('Upload failed. Please try again.') }
    finally { setUploading(false) }
  }

  async function saveAndFinish() {
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name', name)
      if (gradeLevel) fd.append('grade_level', gradeLevel)
      if (strand) fd.append('strand', strand)
      if (schoolName) fd.append('school_name', schoolName)
      if (goal) fd.append('learning_goal', goal)
      if (challenge) fd.append('learning_challenge', challenge)
      fd.append('onboarding_done', 'true')
      selectedSubjects.forEach(id => fd.append('subject_ids[]', id))
      if (avatarFile) fd.append('avatar', avatarFile)

      await fetch('/api/student/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd })

      setWelcomeData({
        name,
        goal: GOALS.find(g => g.value === goal)?.label || '',
        goalIcon: GOALS.find(g => g.value === goal)?.icon || '🎯',
        aiSummary: aiResult?.ai_summary || null,
        aiSubject: aiResult?.extracted_subject || null,
        aiScore: aiResult?.extracted_score || null,
        aiTotal: aiResult?.extracted_total || null,
      })
      setShowWelcome(true)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setSaving(false) }
  }

  const s = {
    wrap:    { minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-body,-apple-system,sans-serif)' },
    box:     { width: '100%', maxWidth: '540px' },
    card:    { background: 'white', borderRadius: '24px', padding: '2.25rem', boxShadow: '0 8px 40px rgba(0,0,0,0.09)', border: '1px solid #f0f0f0' },
    label:   { display: 'block', fontSize: '0.77rem', fontWeight: '700', color: '#374151', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input:   { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: '#111827', boxSizing: 'border-box' },
    btn:     { width: '100%', padding: '12px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '11px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
    btnGray: { padding: '11px 16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#374151', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' },
    btnDis:  { width: '100%', padding: '12px', background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: '11px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: 'not-allowed' },
    errBox:  { padding: '9px 13px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', marginTop: '10px' },
    heading: { fontSize: '1.3rem', fontWeight: '800', color: '#111827', margin: '0 0 6px' },
    sub:     { fontSize: '0.83rem', color: '#6b7280', margin: 0, lineHeight: '1.5' },
  }

  const ProgressBar = () => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '5px' }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={{ flex: 1, height: '5px', borderRadius: '3px', background: i < step ? 'linear-gradient(90deg,#2563eb,#7c3aed)' : '#e5e7eb', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#9ca3af', fontWeight: '600', marginTop: '5px' }}>
        {step} / {TOTAL_STEPS}
      </div>
    </div>
  )

  // ── Welcome screen ──
  if (showWelcome && welcomeData) {
    const firstName = welcomeData.name.split(' ')[0]
    return (
      <div style={s.wrap}>
        <div style={{ ...s.box, maxWidth: '560px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', animation: 'none' }}>🎉</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827', marginBottom: '0.5rem' }}>
            You're all set, {firstName}!
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            Your personalized learning profile is ready. Here's a quick summary of what we know about you.
          </p>

          <div style={{ display: 'grid', gap: '10px', marginBottom: '2rem', textAlign: 'left' }}>
            {welcomeData.goal && (
              <div style={{ background: '#eff6ff', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem' }}>{welcomeData.goalIcon}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Goal</div>
                  <div style={{ fontSize: '0.93rem', fontWeight: '600', color: '#1e40af', marginTop: '2px' }}>{welcomeData.goal}</div>
                </div>
              </div>
            )}

            {welcomeData.aiSummary && (
              <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    AI Insight from Your Grades
                    {welcomeData.aiSubject && <span style={{ fontWeight: '500' }}> · {welcomeData.aiSubject}</span>}
                    {welcomeData.aiScore && welcomeData.aiTotal && <span style={{ fontWeight: '500' }}> · {welcomeData.aiScore}/{welcomeData.aiTotal}</span>}
                  </div>
                  <div style={{ fontSize: '0.87rem', color: '#166534', marginTop: '4px', lineHeight: '1.55' }}>{welcomeData.aiSummary}</div>
                </div>
              </div>
            )}

            <div style={{ background: '#f5f3ff', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem' }}>✨</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>What's waiting for you</div>
                <div style={{ fontSize: '0.87rem', color: '#5b21b6', marginTop: '2px', lineHeight: '1.55' }}>
                  Personalized quizzes, a custom learning path, and AI-powered study recommendations — all built around your profile and goals.
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => window.location.href = '/dashboard'} style={{ ...s.btn, fontSize: '1rem', padding: '14px' }}>
            Go to My Dashboard →
          </button>
        </div>
      </div>
    )
  }

  // ── Main steps ──
  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <ProgressBar />
        <div style={s.card}>

          {/* STEP 1 — Identity */}
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👋</div>
                <h1 style={s.heading}>Welcome to SchoolMATE!</h1>
                <p style={s.sub}>Let's personalize your experience. This takes about 2 minutes.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#f3f4f6', border: '2.5px dashed #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}
                >
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '2rem' }}>📷</span>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '3px', fontSize: '0.58rem', color: 'white', textAlign: 'center', fontWeight: '700', letterSpacing: '0.05em' }}>
                    {avatarPreview ? 'CHANGE' : 'ADD PHOTO'}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                {user?.avatar_url && !avatarFile && (
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '6px' }}>Using your {user.social_provider || 'account'} photo · tap to change</div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={s.label}>Full Name</label>
                <input type="text" placeholder="e.g. Maria Santos" value={name} onChange={e => setName(e.target.value)} style={s.input} onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)} />
              </div>

              {error && <div style={s.errBox}>{error}</div>}

              <button onClick={() => { if (!name.trim()) { setError('Please enter your full name.'); return } setError(''); setStep(2) }} style={{ marginTop: '1rem', ...(name.trim() ? s.btn : s.btnDis) }}>
                Continue →
              </button>
            </>
          )}

          {/* STEP 2 — School */}
          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏫</div>
                <h1 style={s.heading}>Your School Info</h1>
                <p style={s.sub}>Helps us match the right curriculum for you.</p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={s.label}>Grade Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
                  {GRADES.map(g => (
                    <button key={g} onClick={() => { setGradeLevel(g); if (g < 11) setStrand('') }} style={{ padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', border: gradeLevel === g ? '2px solid #2563eb' : '2px solid #e5e7eb', background: gradeLevel === g ? '#eff6ff' : 'white', fontFamily: 'inherit', fontWeight: '700', fontSize: '0.875rem', color: gradeLevel === g ? '#2563eb' : '#374151' }}>
                      G{g}
                    </button>
                  ))}
                </div>
              </div>

              {gradeLevel >= 11 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={s.label}>Strand <span style={{ fontWeight: '400', textTransform: 'none', color: '#9ca3af', letterSpacing: 0 }}>(optional)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {STRANDS.map(st => (
                      <button key={st} onClick={() => setStrand(strand === st ? '' : st)} style={{ padding: '6px 13px', borderRadius: '8px', cursor: 'pointer', border: strand === st ? '2px solid #2563eb' : '2px solid #e5e7eb', background: strand === st ? '#eff6ff' : 'white', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '600', color: strand === st ? '#2563eb' : '#374151' }}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={s.label}>School Name <span style={{ fontWeight: '400', textTransform: 'none', color: '#9ca3af', letterSpacing: 0 }}>(optional)</span></label>
                <input type="text" placeholder="e.g. Rizal National High School" value={schoolName} onChange={e => setSchoolName(e.target.value)} style={s.input} />
              </div>

              {error && <div style={s.errBox}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <button onClick={() => { setError(''); setStep(1) }} style={s.btnGray}>← Back</button>
                <button onClick={() => { if (!gradeLevel) { setError('Please select your grade level.'); return } setError(''); setStep(3) }} style={{ flex: 1, padding: '11px', background: gradeLevel ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e5e7eb', color: gradeLevel ? 'white' : '#9ca3af', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: gradeLevel ? 'pointer' : 'not-allowed' }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — Subjects */}
          {step === 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                <h1 style={s.heading}>Your Subjects</h1>
                <p style={s.sub}>Select the subjects you're enrolled in this year.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', maxHeight: '320px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '2px' }}>
                {subjects.map(sub => {
                  const sel = selectedSubjects.includes(sub.id)
                  return (
                    <button key={sub.id} onClick={() => { setSelectedSubjects(prev => prev.includes(sub.id) ? prev.filter(s => s !== sub.id) : [...prev, sub.id]) }} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '11px', cursor: 'pointer', textAlign: 'left', border: sel ? `2px solid ${sub.color}` : '2px solid #e5e7eb', background: sel ? sub.color + '14' : 'white', fontFamily: 'inherit' }}>
                      <span style={{ fontSize: '1.15rem' }}>{sub.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: sel ? sub.color : '#374151' }}>{sub.name}</div>
                        {sel && <div style={{ fontSize: '0.64rem', color: sub.color }}>✓ Selected</div>}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginBottom: '1rem' }}>
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </div>

              {error && <div style={s.errBox}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button onClick={() => { setError(''); setStep(2) }} style={s.btnGray}>← Back</button>
                <button onClick={() => { if (selectedSubjects.length === 0) { setError('Please select at least one subject.'); return } setError(''); setStep(4) }} style={{ flex: 1, padding: '11px', background: selectedSubjects.length > 0 ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e5e7eb', color: selectedSubjects.length > 0 ? 'white' : '#9ca3af', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: selectedSubjects.length > 0 ? 'pointer' : 'not-allowed' }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* STEP 4 — Goals & Challenges */}
          {step === 4 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                <h1 style={s.heading}>Goals & Challenges</h1>
                <p style={s.sub}>This shapes your personalized recommendations.</p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={s.label}>My main learning goal</label>
                <div style={{ display: 'grid', gap: '7px' }}>
                  {GOALS.map(g => (
                    <button key={g.value} onClick={() => setGoal(g.value)} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 14px', borderRadius: '11px', cursor: 'pointer', textAlign: 'left', border: goal === g.value ? '2px solid #2563eb' : '2px solid #e5e7eb', background: goal === g.value ? '#eff6ff' : 'white', fontFamily: 'inherit' }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{g.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.87rem', fontWeight: '700', color: goal === g.value ? '#2563eb' : '#111827' }}>{g.label}</div>
                        <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '1px' }}>{g.desc}</div>
                      </div>
                      {goal === g.value && <span style={{ color: '#2563eb', fontSize: '1rem', flexShrink: 0 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={s.label}>My biggest study challenge</label>
                <div style={{ display: 'grid', gap: '7px' }}>
                  {CHALLENGES.map(c => (
                    <button key={c.value} onClick={() => setChallenge(c.value)} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 14px', borderRadius: '11px', cursor: 'pointer', textAlign: 'left', border: challenge === c.value ? '2px solid #7c3aed' : '2px solid #e5e7eb', background: challenge === c.value ? '#f5f3ff' : 'white', fontFamily: 'inherit' }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{c.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.87rem', fontWeight: '700', color: challenge === c.value ? '#7c3aed' : '#111827' }}>{c.label}</div>
                        <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '1px' }}>{c.desc}</div>
                      </div>
                      {challenge === c.value && <span style={{ color: '#7c3aed', fontSize: '1rem', flexShrink: 0 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={s.errBox}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button onClick={() => { setError(''); setStep(3) }} style={s.btnGray}>← Back</button>
                <button onClick={() => { if (!goal || !challenge) { setError('Please pick both a goal and a challenge.'); return } setError(''); setStep(5) }} style={{ flex: 1, padding: '11px', background: (goal && challenge) ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e5e7eb', color: (goal && challenge) ? 'white' : '#9ca3af', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: (goal && challenge) ? 'pointer' : 'not-allowed' }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* STEP 5 — Previous Grades */}
          {step === 5 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                <h1 style={s.heading}>Previous Grade Report</h1>
                <p style={s.sub}>Upload your last report card or grade sheet — our AI will read it and build your starting learning profile automatically. <strong style={{ color: '#374151' }}>This is optional.</strong></p>
              </div>

              {!aiResult && (
                <div
                  onClick={() => gradeInputRef.current?.click()}
                  style={{ border: `2px dashed ${gradeFile ? '#16a34a' : '#d1d5db'}`, borderRadius: '14px', padding: '1.75rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', background: gradeFile ? '#f0fdf4' : '#fafafa' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{gradeFile ? '📄' : '📤'}</div>
                  {gradeFile ? (
                    <>
                      <div style={{ fontSize: '0.87rem', fontWeight: '700', color: '#16a34a' }}>{gradeFileName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>Tap to change file</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.87rem', fontWeight: '600', color: '#374151' }}>Tap to upload your grade report</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>JPG, PNG, or PDF · Max 10MB</div>
                    </>
                  )}
                  <input ref={gradeInputRef} type="file" accept="image/*,.pdf" onChange={handleGradeFileChange} style={{ display: 'none' }} />
                </div>
              )}

              {aiResult && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🤖</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Analysis Complete ✓</span>
                  </div>
                  {aiResult.extracted_subject && (
                    <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '4px', fontWeight: '600' }}>
                      {aiResult.extracted_subject}
                      {aiResult.extracted_score && aiResult.extracted_total && ` · ${aiResult.extracted_score}/${aiResult.extracted_total}`}
                    </div>
                  )}
                  {aiResult.ai_summary && <div style={{ fontSize: '0.84rem', color: '#166534', lineHeight: '1.55' }}>{aiResult.ai_summary}</div>}
                  <button onClick={() => { setAiResult(null); setGradeFile(null); setGradeFileName('') }} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#6b7280', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}>
                    Remove & upload a different file
                  </button>
                </div>
              )}

              {uploadError && (
                <div style={{ ...s.errBox, marginBottom: '1rem' }}>{uploadError}</div>
              )}

              {gradeFile && !aiResult && (
                <button onClick={analyzeGrades} disabled={uploading} style={{ width: '100%', padding: '11px', background: uploading ? '#e5e7eb' : 'linear-gradient(135deg,#059669,#16a34a)', color: uploading ? '#9ca3af' : 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '700', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}>
                  {uploading ? '🔍 Analyzing with AI...' : '🤖 Analyze My Grades'}
                </button>
              )}

              {error && <div style={s.errBox}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <button onClick={() => { setError(''); setStep(4) }} style={s.btnGray}>← Back</button>
                <button onClick={saveAndFinish} disabled={saving || uploading} style={{ flex: 1, padding: '11px', background: (saving || uploading) ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#7c3aed)', color: (saving || uploading) ? '#9ca3af' : 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: (saving || uploading) ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Setting up...' : '🚀 Finish Setup'}
                </button>
              </div>

              <button onClick={saveAndFinish} disabled={saving} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.78rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: '4px' }}>
                Skip for now
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
