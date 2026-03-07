'use client'
import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/api'

const DIFFICULTIES = ['easy', 'mixed', 'hard']

export default function QuizPage() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topics, setTopics] = useState([])
  const [numQ, setNumQ] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [session, setSession] = useState(null)  // null | { questions, session_id, ... }
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})  // questionId: {answer, correct, explanation, correctAnswer}
  const [finished, setFinished] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('quiz')

  useEffect(() => {
    apiGet('/subjects').then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {})
    apiGet('/student/learning-path').then(d => {
      // subjects already come with topics
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      // Load topics from learning path
      apiGet('/student/learning-path').then(d => {
        const sub = (d.subjects || []).find(s => s.id === selectedSubject.id)
        setTopics(sub?.topics || [])
        setSelectedTopic(null)
      }).catch(() => {})
    }
  }, [selectedSubject])

  async function startQuiz() {
    if (!selectedSubject) return
    setGenerating(true); setError('')
    try {
      const data = await apiPost('/quiz/generate', {
        subject_id: selectedSubject.id,
        topic_id: selectedTopic?.id || null,
        num_questions: numQ,
        source: 'manual',
      })
      setSession(data)
      setCurrent(0)
      setAnswers({})
      setFinished(null)
    } catch (err) {
      setError('Failed to generate quiz. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function submitAnswer(questionId, answer) {
    if (answers[questionId]) return  // already answered
    try {
      const data = await apiPost(`/quiz/${session.session_id}/answer`, { question_id: questionId, answer })
      setAnswers(prev => ({ ...prev, [questionId]: { answer, correct: data.is_correct, explanation: data.explanation, correctAnswer: data.correct_answer } }))
    } catch {}
  }

  async function finishQuiz() {
    try {
      const data = await apiPost(`/quiz/${session.session_id}/finish`, {})
      setFinished(data)
      setSession(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadHistory() {
    try {
      const d = await apiGet('/quiz/history')
      setHistory(d.data || [])
    } catch {}
  }

  const tabStyle = (active) => ({
    padding: '7px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600',
    background: active ? 'white' : 'transparent', color: active ? '#111827' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  })

  const card = { background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }

  // ── Quiz results screen ───────────────────────────────────────────────
  if (finished) {
    const pct = finished.score_pct
    const color = pct >= 85 ? '#16a34a' : pct >= 65 ? '#d97706' : '#dc2626'
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ ...card, textAlign: 'center', marginBottom: '1.5rem', background: pct >= 85 ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : pct >= 65 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{pct >= 85 ? '🌟' : pct >= 65 ? '👍' : '📚'}</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color }}>{pct}%</h1>
          <p style={{ color: '#374151', fontSize: '0.9rem' }}>{finished.correct} out of {finished.total} correct on {finished.topic || finished.subject}</p>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '6px' }}>
            {pct >= 85 ? '🎉 Excellent work! You\'re mastering this topic.' : pct >= 65 ? '👍 Good effort! A bit more practice and you\'ll get there.' : '📖 Keep reviewing this topic. You can retake this quiz anytime.'}
          </p>
        </div>

        {/* Question review */}
        <div style={card}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Question Review</h2>
          {finished.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: '1rem', padding: '0.875rem', borderRadius: '10px', background: q.is_correct ? '#f0fdf4' : '#fef2f2', border: `1px solid ${q.is_correct ? '#bbf7d0' : '#fecaca'}` }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Q{q.number}. {q.question}</div>
              <div style={{ fontSize: '0.78rem', color: q.is_correct ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                Your answer: {q.student_answer} {q.is_correct ? '✓' : '✗'}
                {!q.is_correct && <span style={{ color: '#16a34a' }}> → Correct: {q.correct_answer}</span>}
              </div>
              {q.explanation && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>{q.explanation}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button onClick={() => { setFinished(null); setSession(null) }} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
            Take Another Quiz
          </button>
          <button onClick={() => window.location.href = '/dashboard'} style={{ flex: 1, padding: '11px', background: 'white', color: '#2563eb', border: '1.5px solid #2563eb', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Active quiz screen ────────────────────────────────────────────────
  if (session) {
    const q = session.questions[current]
    const answered = answers[q.id]
    const allAnswered = Object.keys(answers).length === session.questions.length
    const progress = (current / session.questions.length) * 100

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{session.subject} — {session.topic}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Question {current + 1} of {session.questions.length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#2563eb' }}>{Object.values(answers).filter(a => a.correct).length} correct</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{Object.keys(answers).length} answered</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', marginBottom: '1.5rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '3px', transition: 'width 0.4s' }} />
        </div>

        {/* Question card */}
        <div style={card}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '5px', display: 'inline-block', marginBottom: '0.875rem' }}>
            QUESTION {current + 1}
          </div>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', lineHeight: 1.6, marginBottom: '1.25rem' }}>{q.question}</p>

          {/* Choices */}
          {Object.entries(q.choices || {}).map(([letter, text]) => {
            let bg = 'white', border = '#e5e7eb', textColor = '#374151'
            if (answered) {
              if (letter === answered.correctAnswer) { bg = '#f0fdf4'; border = '#16a34a'; textColor = '#16a34a' }
              else if (letter === answered.answer && !answered.correct) { bg = '#fef2f2'; border = '#dc2626'; textColor = '#dc2626' }
            }
            return (
              <button key={letter}
                onClick={() => !answered && submitAnswer(q.id, letter)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', marginBottom: '8px', borderRadius: '10px',
                  border: `1.5px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer',
                  fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#374151', flexShrink: 0 }}>{letter}</span>
                <span style={{ fontSize: '0.875rem', color: textColor, fontWeight: answered && letter === answered.correctAnswer ? '600' : '400' }}>{text}</span>
              </button>
            )
          })}

          {/* Explanation */}
          {answered && answered.explanation && (
            <div style={{ marginTop: '0.875rem', padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#374151' }}>
              💡 {answered.explanation}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            style={{ padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: '9px', background: 'white', color: '#374151', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1 }}>
            ← Previous
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {session.questions.map((qq, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{
                width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                background: i === current ? '#2563eb' : answers[qq.id] ? (answers[qq.id].correct ? '#16a34a' : '#dc2626') : '#e5e7eb',
              }} />
            ))}
          </div>

          {current < session.questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)} disabled={!answered}
              style={{ padding: '9px 20px', border: 'none', borderRadius: '9px', background: answered ? '#2563eb' : '#e5e7eb', color: answered ? 'white' : '#9ca3af', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600', cursor: answered ? 'pointer' : 'not-allowed' }}>
              Next →
            </button>
          ) : (
            <button onClick={finishQuiz} disabled={!allAnswered}
              style={{ padding: '9px 20px', border: 'none', borderRadius: '9px', background: allAnswered ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e5e7eb', color: allAnswered ? 'white' : '#9ca3af', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '600', cursor: allAnswered ? 'pointer' : 'not-allowed' }}>
              Finish Quiz ✓
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz setup screen ─────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>AI Quiz</h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>Take a personalized quiz and let the AI adapt to your level</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem', width: 'fit-content' }}>
        {[['quiz', '🧠 New Quiz'], ['history', '📊 History']].map(([val, label]) => (
          <button key={val} onClick={() => { setTab(val); if (val === 'history') loadHistory() }} style={tabStyle(tab === val)}>{label}</button>
        ))}
      </div>

      {tab === 'quiz' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', color: '#dc2626', fontSize: '0.85rem' }}>⚠️ {error}</div>}

            {/* Subject */}
            <div style={card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>Choose Subject</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {subjects.map(s => (
                  <button key={s.id} onClick={() => setSelectedSubject(s)} style={{
                    padding: '10px 6px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    border: selectedSubject?.id === s.id ? `2px solid ${s.color}` : '2px solid #e5e7eb',
                    background: selectedSubject?.id === s.id ? s.color + '15' : 'white',
                    fontFamily: 'inherit',
                  }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '3px' }}>{s.icon}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '600', color: selectedSubject?.id === s.id ? s.color : '#374151', lineHeight: 1.2 }}>{s.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            {selectedSubject && topics.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>Choose Topic <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#9ca3af' }}>(optional)</span></h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button onClick={() => setSelectedTopic(null)} style={{ padding: '5px 12px', borderRadius: '8px', border: !selectedTopic ? '2px solid #2563eb' : '2px solid #e5e7eb', background: !selectedTopic ? '#eff6ff' : 'white', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: '600', color: !selectedTopic ? '#2563eb' : '#374151', cursor: 'pointer' }}>
                    All Topics
                  </button>
                  {topics.slice(0, 12).map(t => (
                    <button key={t.id} onClick={() => setSelectedTopic(t)} style={{
                      padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: '600',
                      border: selectedTopic?.id === t.id ? '2px solid #2563eb' : '2px solid #e5e7eb',
                      background: selectedTopic?.id === t.id ? '#eff6ff' : 'white',
                      color: selectedTopic?.id === t.id ? '#2563eb' : '#374151',
                    }}>
                      {t.status === 'mastered' ? '✅' : t.status === 'at-risk' ? '⚠️' : t.status === 'in-progress' ? '🟡' : '📘'} {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Num questions */}
            <div style={card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>Number of Questions</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[5, 10, 15, 20].map(n => (
                  <button key={n} onClick={() => setNumQ(n)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: numQ === n ? '2px solid #2563eb' : '2px solid #e5e7eb', background: numQ === n ? '#eff6ff' : 'white', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '700', color: numQ === n ? '#2563eb' : '#374151', cursor: 'pointer' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startQuiz} disabled={!selectedSubject || generating} style={{
              padding: '13px', background: !selectedSubject || generating ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
              color: !selectedSubject || generating ? '#9ca3af' : 'white', border: 'none', borderRadius: '12px',
              fontFamily: 'inherit', fontSize: '1rem', fontWeight: '700', cursor: !selectedSubject || generating ? 'not-allowed' : 'pointer',
              boxShadow: selectedSubject && !generating ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
            }}>
              {generating ? '🤖 Generating your personalized quiz...' : '🚀 Start Quiz →'}
            </button>
          </div>

          {/* Info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...card, background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid #e0e7ff' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>🤖 How AI Quizzes Work</h3>
              {[
                ['Personalized', 'Questions are generated based on your grade level and curriculum'],
                ['Adaptive', 'AI picks harder questions on topics you\'re strong in'],
                ['Explained', 'Every answer includes an explanation to help you learn'],
                ['Tracked', 'Results update your mastery scores automatically'],
              ].map(([title, desc]) => (
                <div key={title} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={card}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Quiz History</h2>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
              <div>No quizzes yet. Take your first quiz!</div>
            </div>
          ) : history.map(q => (
            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', borderRadius: '10px', border: '1px solid #f3f4f6', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>{q.topic?.name ?? q.subject?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{q.subject?.name} • {q.created_at}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: q.score_pct >= 85 ? '#16a34a' : q.score_pct >= 65 ? '#d97706' : '#dc2626' }}>{q.score_pct}%</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{q.total_questions} questions</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
