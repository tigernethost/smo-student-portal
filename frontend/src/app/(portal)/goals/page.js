'use client'
import { useState } from 'react'

const initialGoals = [
  { id: 1, subject: 'Mathematics', type: 'grade', target: 95, current: 92, deadline: 'End of Q3', status: 'on-track', icon: '📐' },
  { id: 2, subject: 'Araling Panlipunan', type: 'grade', target: 88, current: 83, deadline: 'End of Q3', status: 'at-risk', icon: '🌏' },
  { id: 3, subject: 'All Subjects', type: 'attendance', target: 100, current: 94.2, deadline: 'End of S.Y.', status: 'on-track', icon: '📅' },
  { id: 4, subject: 'Science', type: 'mastery', target: 80, current: 68, deadline: 'End of Q3', status: 'on-track', icon: '🔬' },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals)
  const [showNew, setShowNew] = useState(false)
  const [newGoal, setNewGoal] = useState({ subject: '', type: 'grade', target: '', deadline: '' })

  const statusColor = { 'on-track': '#16a34a', 'at-risk': '#dc2626', 'completed': '#7c3aed' }
  const statusBg = { 'on-track': '#f0fdf4', 'at-risk': '#fef2f2', 'completed': '#f5f3ff' }
  const statusLabel = { 'on-track': '✅ On Track', 'at-risk': '⚠️ At Risk', 'completed': '🏆 Completed' }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>My Goals</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
            Set targets and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          style={{
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + New Goal
        </button>
      </div>

      {/* New goal form */}
      {showNew && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '1.5rem',
          border: '1px solid #e0e7ff', boxShadow: '0 4px 16px rgba(37,99,235,0.1)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Create New Goal</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Subject', key: 'subject', placeholder: 'e.g., Mathematics' },
              { label: 'Target (%)', key: 'target', placeholder: 'e.g., 90', type: 'number' },
              { label: 'Deadline', key: 'deadline', placeholder: 'e.g., End of Q3' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>{label}</label>
                <input
                  type={type || 'text'}
                  placeholder={placeholder}
                  value={newGoal[key]}
                  onChange={e => setNewGoal(g => ({ ...g, [key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid #e5e7eb', borderRadius: '8px',
                    fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
                    color: '#111827',
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Goal Type</label>
              <select
                value={newGoal.type}
                onChange={e => setNewGoal(g => ({ ...g, type: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: '1.5px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
                  color: '#111827', background: 'white',
                }}
              >
                <option value="grade">Grade Target</option>
                <option value="attendance">Attendance</option>
                <option value="mastery">Topic Mastery</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => {
                if (newGoal.subject && newGoal.target) {
                  setGoals(g => [...g, {
                    id: Date.now(), subject: newGoal.subject, type: newGoal.type,
                    target: Number(newGoal.target), current: 0,
                    deadline: newGoal.deadline || 'End of quarter',
                    status: 'on-track', icon: '🎯',
                  }])
                  setNewGoal({ subject: '', type: 'grade', target: '', deadline: '' })
                  setShowNew(false)
                }
              }}
              style={{
                padding: '9px 20px', background: '#2563eb', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '0.875rem',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Save Goal</button>
            <button
              onClick={() => setShowNew(false)}
              style={{
                padding: '9px 20px', background: '#f3f4f6', color: '#374151',
                border: 'none', borderRadius: '8px', fontSize: '0.875rem',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* Goals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {goals.map(goal => {
          const pct = Math.min(100, Math.round(goal.current / goal.target * 100))
          return (
            <div key={goal.id} style={{
              background: 'white', borderRadius: '16px', padding: '1.25rem',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: '#f9fafb', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
              }}>{goal.icon}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>{goal.subject}</div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '700',
                    color: statusColor[goal.status],
                    background: statusBg[goal.status],
                    padding: '2px 8px', borderRadius: '6px',
                  }}>{statusLabel[goal.status]}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.625rem' }}>
                  Target: {goal.target}% · Current: {goal.current}% · {goal.deadline}
                </div>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: '3px',
                    background: goal.status === 'at-risk'
                      ? 'linear-gradient(90deg, #dc2626, #f87171)'
                      : 'linear-gradient(90deg, #2563eb, #7c3aed)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>
                  {pct}% towards goal · {goal.target - goal.current > 0 ? `${goal.target - goal.current}% to go` : '🎉 Goal reached!'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'white', borderRadius: '16px',
          border: '1px dashed #e5e7eb', color: '#9ca3af',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎯</div>
          <p style={{ fontWeight: '600' }}>No goals yet</p>
          <p style={{ fontSize: '0.875rem' }}>Click "New Goal" to set your first academic target</p>
        </div>
      )}
    </div>
  )
}
