'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function QuizPage() {
  const [subjects, setSubjects] = useState([])
  const [phase, setPhase]       = useState('setup')   // setup | quiz | results
  const [config, setConfig]     = useState({ subject_id: '', num_questions: 10 })
  const [session, setSession]   = useState(null)
  const [answers, setAnswers]   = useState({})
  const [current, setCurrent]   = useState(0)
  const [results, setResults]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [submitting, setSubmit] = useState(false)
  const [quota, setQuota]       = useState(null)
  const [history, setHistory]   = useState([])
  const [msg, setMsg]           = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    Promise.all([
      fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/quiz/history', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([subs, hist, sub]) => {
      setSubjects(Array.isArray(subs) ? subs : [])
      setHistory(Array.isArray(hist) ? hist.slice(0, 5) : [])
      if (sub.quota) setQuota(sub.quota)
    }).catch(() => {})
  }, [])

  async function startQuiz() {
    if (!config.subject_id) { setMsg({ type: 'error', text: 'Please select a subject.' }); return }
    setLoading(true); setMsg(null)
    try {
      const res  = await fetch('/api/quiz/generate', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(config) })
      const data = await res.json()
      if (res.status === 402) { setMsg({ type: 'error', text: '⚡ ' + (data.message || 'AI quota exceeded.') }); setLoading(false); return }
      if (!data.session_id) { setMsg({ type: 'error', text: data.message || 'Could not generate quiz. Please try again.' }); setLoading(false); return }
      setSession(data); setAnswers({}); setCurrent(0); setPhase('quiz')
      if (data.quota) setQuota(data.quota)
    } catch { setMsg({ type: 'error', text: 'Network error.' }) }
    setLoading(false)
  }

  function selectAnswer(questionId, choice) {
    setAnswers(a => ({ ...a, [questionId]: choice }))
  }

  async function submitQuiz() {
    setSubmit(true)
    const questions = session.questions
    try {
      for (const q of questions) {
        if (answers[q.id]) {
          await fetch(`/api/quiz/${session.session_id}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ question_id: q.id, answer: answers[q.id] }) })
        }
      }
      const res  = await fetch(`/api/quiz/${session.session_id}/finish`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setResults(data); setPhase('results')
    } catch { setMsg({ type: 'error', text: 'Could not submit quiz.' }) }
    setSubmit(false)
  }

  const questions  = session?.questions || []
  const currentQ   = questions[current]
  const answered   = Object.keys(answers).length
  const progress   = questions.length ? Math.round((answered / questions.length) * 100) : 0

  // ── SETUP PHASE ──
  if (phase === 'setup') return (
    <>
      <style>{`
        .quiz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 700px) { .quiz-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>🧠 AI Quiz</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Generate a personalized quiz based on your subjects</p>

        {quota && !quota.is_unlimited && (
          <div style={{ padding: '10px 14px', background: quota.pct_used >= 90 ? '#fef2f2' : '#f9fafb', border: `1px solid ${quota.pct_used >= 90 ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.83rem', color: quota.pct_used >= 90 ? '#dc2626' : '#6b7280', fontWeight: '600' }}>
              {quota.pct_used >= 100 ? '🚫 No AI actions remaining' : `⚡ ${quota.remaining} AI actions remaining`}
            </span>
            {quota.pct_used >= 80 && <Link href="/upgrade" style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2563eb', textDecoration: 'none' }}>Upgrade →</Link>}
          </div>
        )}

        {msg && <div style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '1.25rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.875rem', fontWeight: '500' }}>{msg.text}</div>}

        <div className="quiz-grid">
          {/* Config */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Configure Quiz</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Subject *</label>
              <select value={config.subject_id} onChange={e => setConfig(c => ({ ...c, subject_id: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '0.85rem', fontFamily: 'inherit', background: 'white', outline: 'none', boxSizing: 'border-box' }}>
                <option value="">— Select subject —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Questions: {config.num_questions}</label>
              <input type="range" min={5} max={20} step={5} value={config.num_questions} onChange={e => setConfig(c => ({ ...c, num_questions: +e.target.value }))}
                style={{ width: '100%', accentColor: '#2563eb' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af' }}>
                <span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>
            <button onClick={startQuiz} disabled={loading || !config.subject_id || quota?.pct_used >= 100}
              style={{ width: '100%', padding: '12px', background: (!config.subject_id || loading || quota?.pct_used >= 100) ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#7c3aed)', color: (!config.subject_id || loading) ? '#9ca3af' : 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.15s' }}>
              {loading ? '⏳ Generating...' : '🧠 Start AI Quiz'}
            </button>
          </div>

          {/* Recent quizzes */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem', marginBottom: '1rem' }}>Recent Quizzes</div>
            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', background: '#f9fafb', borderRadius: '9px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.subject_name || 'Quiz'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{h.total_questions} questions</div>
                    </div>
                    {h.score_pct != null ? (
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: h.score_pct >= 75 ? '#16a34a' : h.score_pct >= 50 ? '#d97706' : '#dc2626', flexShrink: 0 }}>{h.score_pct}%</span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0 }}>—</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af', fontSize: '0.82rem' }}>No quizzes yet. Take your first one!</div>
            )}
          </div>
        </div>
      </div>
    </>
  )

  // ── QUIZ PHASE ──
  if (phase === 'quiz') return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #f3f4f6', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111827' }}>{session.subject} — {session.topic}</span>
          <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>{answered}/{questions.length} answered</span>
        </div>
        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question nav pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {questions.map((q, i) => (
          <button key={q.id} onClick={() => setCurrent(i)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', background: i === current ? '#2563eb' : answers[q.id] ? '#dcfce7' : '#f3f4f6', color: i === current ? 'white' : answers[q.id] ? '#16a34a' : '#6b7280', flexShrink: 0 }}>{i + 1}</button>
        ))}
      </div>

      {/* Current question */}
      {currentQ && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Question {current + 1} of {questions.length}</div>
          <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', fontWeight: '600', color: '#111827', marginBottom: '1.25rem', lineHeight: 1.55 }}>{currentQ.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(currentQ.choices || {}).map(([key, val]) => {
              const selected = answers[currentQ.id] === key
              return (
                <button key={key} onClick={() => selectAnswer(currentQ.id, key)} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: `2px solid ${selected ? '#2563eb' : '#e5e7eb'}`, background: selected ? '#eff6ff' : 'white', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${selected ? '#2563eb' : '#d1d5db'}`, background: selected ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    {selected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: selected ? '#2563eb' : '#9ca3af' }}>{key}. </span>
                    <span style={{ fontSize: '0.88rem', color: selected ? '#1d4ed8' : '#374151', fontWeight: selected ? '600' : '400' }}>{val}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600', cursor: current === 0 ? 'default' : 'pointer', color: current === 0 ? '#d1d5db' : '#374151' }}>← Prev</button>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>Next →</button>
          : <button onClick={submitQuiz} disabled={submitting} style={{ flex: 1, padding: '10px 20px', borderRadius: '10px', border: 'none', background: answered === questions.length ? 'linear-gradient(135deg,#16a34a,#059669)' : '#e5e7eb', color: answered === questions.length ? 'white' : '#9ca3af', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer' }}>
              {submitting ? '⏳ Submitting...' : `✅ Submit (${answered}/${questions.length})`}
            </button>
        }
        {msg && <div style={{ width: '100%', fontSize: '0.82rem', color: '#dc2626' }}>{msg.text}</div>}
      </div>
    </div>
  )

  // ── RESULTS PHASE ──
  if (phase === 'results' && results) {
    const score = results.score_pct || 0
    const scoreColor = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
    const scoreBg    = score >= 75 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2'
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Score card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #f3f4f6', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{score >= 75 ? '🎉' : score >= 50 ? '👍' : '💪'}</div>
          <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: '900', color: scoreColor, lineHeight: 1 }}>{score}%</div>
          <div style={{ color: '#6b7280', marginTop: '4px', fontSize: '0.9rem' }}>{results.correct_count}/{results.total_questions} correct</div>
          <div style={{ display: 'inline-block', marginTop: '12px', padding: '5px 14px', background: scoreBg, borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: scoreColor }}>
            {score >= 75 ? 'Excellent! 🌟' : score >= 50 ? 'Good effort! Keep going!' : 'Keep practicing — you\'ll improve!'}
          </div>
        </div>

        {/* Question breakdown */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', marginBottom: '1rem' }}>Question Review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.questions?.map((q, i) => (
              <div key={q.id} style={{ padding: '10px 12px', borderRadius: '10px', background: q.is_correct ? '#f0fdf4' : '#fef2f2', border: `1px solid ${q.is_correct ? '#bbf7d0' : '#fca5a5'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111827', flex: 1 }}>Q{i+1}. {q.question}</div>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{q.is_correct ? '✅' : '❌'}</span>
                </div>
                {!q.is_correct && (
                  <div style={{ marginTop: '6px', fontSize: '0.75rem' }}>
                    <span style={{ color: '#dc2626' }}>Your answer: {q.student_answer}</span>
                    <span style={{ color: '#9ca3af' }}> · </span>
                    <span style={{ color: '#16a34a', fontWeight: '600' }}>Correct: {q.correct_answer}</span>
                    {q.explanation && <div style={{ color: '#6b7280', marginTop: '3px', fontStyle: 'italic' }}>{q.explanation}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => { setPhase('setup'); setSession(null); setResults(null) }} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}>
            🔄 Take Another Quiz
          </button>
          <Link href="/dashboard" style={{ flex: 1, padding: '12px', background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
            🏠 Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return null
}
