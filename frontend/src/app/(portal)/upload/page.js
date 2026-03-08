'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [uploads, setUploads]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [form, setForm]         = useState({ type: 'exam', subject_id: '' })
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setFile] = useState(null)
  const [msg, setMsg]           = useState(null)
  const [quota, setQuota]       = useState(null)
  const fileRef                 = useRef(null)
  const token                   = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    Promise.all([
      fetch('/api/uploads', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([ups, subs, sub]) => {
      setUploads(Array.isArray(ups) ? ups : ups.data || [])
      setSubjects(Array.isArray(subs) ? subs : [])
      if (sub.quota) setQuota(sub.quota)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleUpload(file) {
    if (!file) return
    setUploading(true); setMsg(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', form.type)
    if (form.subject_id) fd.append('subject_id', form.subject_id)
    try {
      const res  = await fetch('/api/uploads', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await res.json()
      if (res.status === 402) {
        setMsg({ type: 'error', text: '⚡ AI quota exceeded. Upgrade your plan to upload more.' })
      } else if (res.ok) {
        setMsg({ type: 'success', text: '✅ Upload successful! AI is analyzing your document...' })
        setFile(null)
        fetch('/api/uploads', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setUploads(Array.isArray(d) ? d : d.data || []))
      } else {
        setMsg({ type: 'error', text: data.message || 'Upload failed.' })
      }
    } catch { setMsg({ type: 'error', text: 'Network error.' }) }
    setUploading(false)
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) { setFile(file); handleUpload(file) }
  }

  const statusColor = s => s === 'done' ? '#16a34a' : s === 'processing' ? '#d97706' : s === 'failed' ? '#dc2626' : '#6b7280'
  const statusBg    = s => s === 'done' ? '#f0fdf4' : s === 'processing' ? '#fffbeb' : s === 'failed' ? '#fef2f2' : '#f9fafb'

  return (
    <>
      <style>{`
        .upload-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.5rem; }
        @media (max-width: 900px) { .upload-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>📤 Upload Documents</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Upload exams, notes, or assignments — AI will analyze and extract insights</p>

        {quota && !quota.is_unlimited && quota.pct_used >= 80 && (
          <div style={{ padding: '10px 16px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.83rem', fontWeight: '600', color: '#92400e' }}>⚠️ {quota.used}/{quota.limit} AI actions used</span>
            <Link href="/upgrade" style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2563eb', textDecoration: 'none' }}>Upgrade →</Link>
          </div>
        )}

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '1.25rem', background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${msg.type === 'error' ? '#fca5a5' : '#bbf7d0'}`, color: msg.type === 'error' ? '#dc2626' : '#16a34a', fontSize: '0.875rem', fontWeight: '500' }}>
            {msg.text}
          </div>
        )}

        <div className="upload-grid">
          {/* Upload area */}
          <div>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? '#2563eb' : '#e5e7eb'}`, borderRadius: '16px', padding: '2rem 1rem', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', background: dragOver ? '#eff6ff' : '#fafafa', transition: 'all 0.2s', marginBottom: '1rem' }}>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); handleUpload(f) } }} />
              {uploading ? (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                  <div style={{ fontWeight: '700', color: '#2563eb', fontSize: '0.9rem' }}>AI is analyzing...</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '4px' }}>This may take 30–60 seconds</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>
                    {selectedFile ? selectedFile.name : 'Tap to upload or drag & drop'}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '4px' }}>PDF, JPG, PNG up to 10MB</div>
                </>
              )}
            </div>

            {/* Form options */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #f3f4f6' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Document Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', background: 'white', outline: 'none' }}>
                  <option value="exam">📝 Exam / Test</option>
                  <option value="notes">📄 Notes</option>
                  <option value="assignment">📋 Assignment</option>
                  <option value="activity">✏️ Activity</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Subject (optional)</label>
                <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', background: 'white', outline: 'none' }}>
                  <option value="">— Auto-detect —</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Upload history */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f3f4f6', minHeight: '300px' }}>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', marginBottom: '1rem' }}>📋 Upload History</div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading...</div>
            ) : uploads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                <div style={{ fontSize: '0.85rem' }}>No uploads yet. Upload your first document!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '400px' }}>
                {uploads.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '1px' }}>{u.type === 'exam' ? '📝' : u.type === 'notes' ? '📄' : '📋'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.original_name || `${u.type} upload`}</div>
                      {u.ai_summary && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{u.ai_summary}</div>}
                      {u.extracted_score != null && <div style={{ fontSize: '0.72rem', color: '#374151', fontWeight: '600', marginTop: '3px' }}>Score: {u.extracted_score}/{u.extracted_total}</div>}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '2px 7px', borderRadius: '6px', background: statusBg(u.status), color: statusColor(u.status), flexShrink: 0, textTransform: 'capitalize' }}>{u.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
