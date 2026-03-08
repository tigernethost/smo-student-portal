'use client'
import { useState, useEffect } from 'react'

export default function GoalsPage() {
  const [goals,   setGoals]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ title: '', description: '', target_date: '', type: 'academic' })
  const [adding,  setAdding]  = useState(false)
  const [showForm,setShow]    = useState(false)
  const [msg,     setMsg]     = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  function load() {
    fetch('/api/student/goals', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setGoals(Array.isArray(d) ? d : d.data || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function addGoal(e) {
    e.preventDefault(); setAdding(true); setMsg(null)
    try {
      const res = await fetch('/api/student/goals', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
      if (res.ok) { setForm({ title:'', description:'', target_date:'', type:'academic' }); setShow(false); load() }
      else setMsg({ type:'error', text:'Could not add goal.' })
    } catch { setMsg({ type:'error', text:'Network error.' }) }
    setAdding(false)
  }

  async function toggleComplete(goal) {
    await fetch(`/api/student/goals/${goal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: goal.status === 'completed' ? 'active' : 'completed' }) })
    load()
  }

  async function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return
    await fetch(`/api/student/goals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  const active    = goals.filter(g => g.status !== 'completed')
  const completed = goals.filter(g => g.status === 'completed')
  const typeIcon  = t => ({ academic:'📚', habit:'⏰', score:'🎯', other:'✨' })[t] || '🎯'

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>🎯 My Goals</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={() => setShow(s => !s)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e0e7ff', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>
          <div style={{ fontWeight: '700', color: '#111827', marginBottom: '1rem', fontSize: '0.95rem' }}>✨ New Goal</div>
          {msg && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{msg.text}</div>}
          <form onSubmit={addGoal}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Goal Title *</label>
                <input required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Score 90% in Math" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Type</label>
                <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', background: 'white', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="academic">📚 Academic</option>
                  <option value="habit">⏰ Study Habit</option>
                  <option value="score">🎯 Score Target</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Target Date</label>
                <input type="date" value={form.target_date} onChange={e => setForm(f=>({...f,target_date:e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Notes (optional)</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="Any notes about this goal..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button type="submit" disabled={adding} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
              {adding ? '⏳ Adding...' : '✅ Add Goal'}
            </button>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading...</div> : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Active</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {active.map(g => <GoalCard key={g.id} goal={g} typeIcon={typeIcon} onToggle={toggleComplete} onDelete={deleteGoal} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Completed 🎉</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completed.map(g => <GoalCard key={g.id} goal={g} typeIcon={typeIcon} onToggle={toggleComplete} onDelete={deleteGoal} />)}
              </div>
            </div>
          )}
          {goals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>No goals yet</div>
              <div style={{ fontSize: '0.82rem' }}>Set goals to track your progress!</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function GoalCard({ goal, typeIcon, onToggle, onDelete }) {
  const done = goal.status === 'completed'
  const overdue = goal.target_date && !done && new Date(goal.target_date) < new Date()
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'white', borderRadius: '12px', border: `1px solid ${done ? '#bbf7d0' : overdue ? '#fca5a5' : '#f3f4f6'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', opacity: done ? 0.7 : 1 }}>
      <button onClick={() => onToggle(goal)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${done ? '#16a34a' : '#d1d5db'}`, background: done ? '#16a34a' : 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', padding: 0 }}>
        {done && <span style={{ color: 'white', fontSize: '0.7rem', lineHeight: 1 }}>✓</span>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '0.9rem' }}>{typeIcon(goal.type)}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: done ? '#9ca3af' : '#111827', textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.title}</span>
        </div>
        {goal.description && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px' }}>{goal.description}</div>}
        {goal.target_date && <div style={{ fontSize: '0.7rem', color: overdue ? '#dc2626' : '#9ca3af', fontWeight: overdue ? '600' : '400' }}>{overdue ? '⚠️ Overdue · ' : '📅 '}{new Date(goal.target_date).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })}</div>}
      </div>
      <button onClick={() => onDelete(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#d1d5db', flexShrink: 0, padding: '2px' }}>🗑</button>
    </div>
  )
}
