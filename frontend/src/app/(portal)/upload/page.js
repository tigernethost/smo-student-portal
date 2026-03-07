'use client'
import { useState, useRef } from 'react'
import { apiGet, apiUpload } from '@/lib/api'

const DOC_TYPES = [
  { value: 'exam', label: 'Exam / Test', icon: '📝', desc: 'Unit tests, periodical exams' },
  { value: 'quiz', label: 'Quiz', icon: '✏️', desc: 'Short quizzes, seatwork' },
  { value: 'assignment', label: 'Assignment', icon: '📋', desc: 'Homework, projects, worksheets' },
  { value: 'report_card', label: 'Report Card', icon: '📊', desc: 'Quarterly report cards, grades' },
]

const STATUS_COLORS = { pending: '#6b7280', processing: '#d97706', done: '#16a34a', failed: '#dc2626' }

export default function UploadPage() {
  const [docType, setDocType] = useState('exam')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('upload') // upload | history
  const fileRef = useRef()

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleSubmit() {
    if (!file) return
    setUploading(true); setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', docType)
      const data = await apiUpload('/uploads', form)
      setResult(data.upload)
      setFile(null); setPreview(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function loadHistory() {
    try {
      const data = await apiGet('/uploads')
      setHistory(data.data || [])
    } catch {}
  }

  function switchTab(t) {
    setTab(t)
    if (t === 'history') loadHistory()
  }

  const card = { background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>Upload Documents</h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
          Upload your exams, quizzes, or report cards. Our AI will analyze them and update your learning profile.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem', width: 'fit-content' }}>
        {[['upload', '📤 Upload'], ['history', '📋 History']].map(([val, label]) => (
          <button key={val} onClick={() => switchTab(val)} style={{
            padding: '7px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600',
            background: tab === val ? 'white' : 'transparent',
            color: tab === val ? '#111827' : '#6b7280',
            boxShadow: tab === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Doc type selector */}
            <div style={card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>What are you uploading?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {DOC_TYPES.map(dt => (
                  <button key={dt.value} onClick={() => setDocType(dt.value)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    border: docType === dt.value ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    background: docType === dt.value ? '#eff6ff' : 'white',
                    fontFamily: 'inherit',
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{dt.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: docType === dt.value ? '#2563eb' : '#111827' }}>{dt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{dt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div style={card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>Upload Photo</h2>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragging ? '#2563eb' : file ? '#16a34a' : '#d1d5db'}`,
                  borderRadius: '12px', padding: '2rem',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragging ? '#eff6ff' : file ? '#f0fdf4' : '#fafafa',
                  transition: 'all 0.15s',
                }}
              >
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✅</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>({(file.size / 1024).toFixed(0)} KB) — click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Drop your photo here</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>or click to browse — JPG, PNG, WEBP (max 10MB)</div>
                  </>
                )}
              </div>
              {error && <div style={{ marginTop: '0.75rem', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.82rem' }}>⚠️ {error}</div>}
              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                style={{
                  marginTop: '1rem', width: '100%', padding: '11px',
                  background: !file || uploading ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  color: !file || uploading ? '#9ca3af' : 'white',
                  border: 'none', borderRadius: '10px', fontFamily: 'inherit',
                  fontSize: '0.9rem', fontWeight: '600', cursor: !file || uploading ? 'not-allowed' : 'pointer',
                  boxShadow: file && !uploading ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                {uploading ? '🔍 AI is analyzing your document...' : '✨ Analyze with AI →'}
              </button>
            </div>
          </div>

          {/* Right — result or tips */}
          <div>
            {result ? (
              <AIResult result={result} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {preview && (
                  <div style={card}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>Preview</h3>
                    <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '200px' }} />
                  </div>
                )}
                <div style={card}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.875rem' }}>💡 Tips for better results</h3>
                  {[
                    ['📸', 'Take a clear, well-lit photo'],
                    ['📐', 'Make sure the whole document is visible'],
                    ['🔤', 'Include your name and score if visible'],
                    ['📝', 'The AI reads both printed and handwritten text'],
                    ['📊', 'Report cards work best in portrait orientation'],
                  ].map(([icon, tip]) => (
                    <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', color: '#374151' }}>
                      <span>{icon}</span><span>{tip}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...card, background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid #e0e7ff' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>🤖 What AI does with your upload</h3>
                  <p style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.6 }}>
                    Our AI reads your document, extracts your score, identifies topics you got wrong, and updates your mastery profile — then suggests personalized quizzes to help you improve.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={card}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Upload History</h2>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
              <div>No uploads yet. Upload your first document above.</div>
            </div>
          ) : (
            history.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', borderRadius: '10px', border: '1px solid #f3f4f6', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>{DOC_TYPES.find(d => d.value === u.type)?.icon ?? '📄'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>{u.original_name ?? u.type}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.extracted_subject ?? 'Subject not detected'} • {u.date}</div>
                </div>
                {u.extracted_score != null && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#2563eb' }}>{u.extracted_score}/{u.extracted_total}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{Math.round(u.extracted_score / u.extracted_total * 100)}%</div>
                  </div>
                )}
                <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '2px 8px', borderRadius: '5px', background: STATUS_COLORS[u.status] + '20', color: STATUS_COLORS[u.status] }}>{u.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function AIResult({ result }) {
  const r = result
  const ai = r.ai_result || {}
  const pct = r.extracted_score && r.extracted_total ? Math.round((r.extracted_score / r.extracted_total) * 100) : null
  const card = { background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1rem' }

  return (
    <div>
      {/* Score card */}
      <div style={{ ...card, background: pct >= 80 ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : pct >= 65 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: `1px solid ${pct >= 80 ? '#bbf7d0' : pct >= 65 ? '#fde68a' : '#fecaca'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>DETECTED SCORE</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: pct >= 80 ? '#16a34a' : pct >= 65 ? '#d97706' : '#dc2626' }}>
              {r.extracted_score != null ? `${r.extracted_score}/${r.extracted_total}` : 'N/A'}
            </div>
            {pct != null && <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>{pct}%</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Subject</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{ai.subject ?? r.extracted_subject ?? '—'}</div>
            {ai.quarter && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quarter {ai.quarter}</div>}
          </div>
        </div>
      </div>

      {/* AI summary */}
      {(ai.ai_summary || r.ai_summary) && (
        <div style={{ ...card, background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid #e0e7ff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', marginBottom: '6px' }}>🤖 AI INSIGHT</div>
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{ai.ai_summary || r.ai_summary}</p>
        </div>
      )}

      {/* Weak topics */}
      {(ai.weak_topics?.length > 0 || r.weak_topics?.length > 0) && (
        <div style={card}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.625rem' }}>⚠️ Topics to Review</div>
          {(ai.weak_topics || r.weak_topics || []).map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>•</span>
              <span style={{ fontSize: '0.82rem', color: '#374151' }}>{t}</span>
            </div>
          ))}
          <button style={{ marginTop: '0.75rem', width: '100%', padding: '8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => window.location.href = '/quiz'}>
            📚 Take a Quiz on These Topics →
          </button>
        </div>
      )}

      {/* Strong topics */}
      {ai.strong_topics?.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#16a34a', marginBottom: '0.625rem' }}>✅ You Did Well In</div>
          {ai.strong_topics.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
              <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>✓</span>
              <span style={{ fontSize: '0.82rem', color: '#374151' }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => window.location.href = '/dashboard'} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
        View Updated Dashboard →
      </button>
    </div>
  )
}
