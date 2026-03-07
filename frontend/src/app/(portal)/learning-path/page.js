'use client'
import { useState } from 'react'
import Link from 'next/link'

const subjects = [
  { id:1, name:'Mathematics', icon:'📐', color:'#2563eb', mastery:78, topics:[
    {name:'Factors & Multiples',status:'mastered',score:96},{name:'GCF and LCM',status:'mastered',score:94},
    {name:'Special Products',status:'mastered',score:90},{name:'Rational Expressions',status:'mastered',score:88},
    {name:'Linear Equations',status:'mastered',score:92},{name:'Systems of Equations',status:'in-progress',score:72},
    {name:'Quadratic Equations',status:'in-progress',score:85},{name:'Quadratic Formula',status:'available',score:null},
    {name:'Quadratic Inequalities',status:'locked',score:null},{name:'Geometry – Triangles',status:'locked',score:null},
  ]},
  { id:2, name:'English', icon:'📖', color:'#7c3aed', mastery:80, topics:[
    {name:'Grammar Fundamentals',status:'mastered',score:91},{name:'Reading Comprehension',status:'mastered',score:88},
    {name:'Academic Writing',status:'in-progress',score:76},{name:'Literary Analysis',status:'in-progress',score:80},
    {name:'Research Writing',status:'available',score:null},{name:'Oral Communication',status:'locked',score:null},
  ]},
  { id:3, name:'Science', icon:'🔬', color:'#059669', mastery:68, topics:[
    {name:'Matter & Properties',status:'mastered',score:89},{name:'Chemical Bonding',status:'mastered',score:84},
    {name:'Chemical Reactions',status:'in-progress',score:78},{name:'Acids & Bases',status:'at-risk',score:65},
    {name:'Electrochemistry',status:'available',score:null},{name:'Organic Chemistry',status:'locked',score:null},
  ]},
  { id:4, name:'Filipino', icon:'🇵🇭', color:'#d97706', mastery:89, topics:[
    {name:'Gramatika',status:'mastered',score:93},{name:'Pag-unawa sa Binasa',status:'mastered',score:90},
    {name:'Pagsulat',status:'mastered',score:88},{name:'Panitikan',status:'in-progress',score:82},
    {name:'Oral Comm',status:'available',score:null},
  ]},
]

const statusConfig = {
  mastered: { icon:'✅', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', label:'Mastered' },
  'in-progress': { icon:'🟡', color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'In Progress' },
  available: { icon:'📘', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', label:'Available' },
  locked: { icon:'🔒', color:'#9ca3af', bg:'#f9fafb', border:'#e5e7eb', label:'Locked' },
  'at-risk': { icon:'⚠️', color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'At Risk' },
  recommended: { icon:'🔵', color:'#2563eb', bg:'#eff6ff', border:'#93c5fd', label:'Recommended' },
}

export default function LearningPathPage() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0])
  const [filter, setFilter] = useState('all')

  const counts = selectedSubject.topics.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1; return acc
  }, {})

  const filtered = filter === 'all' ? selectedSubject.topics : selectedSubject.topics.filter(t => t.status === filter)

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:'800', color:'#111827' }}>Learning Path</h1>
        <p style={{ fontSize:'0.875rem', color:'#6b7280', marginTop:'4px' }}>Your personalized topic mastery map</p>
      </div>

      {/* Subject selector */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setSelectedSubject(s)} style={{
            display:'flex', alignItems:'center', gap:'8px',
            padding:'9px 16px', borderRadius:'10px', cursor:'pointer',
            border: selectedSubject.id===s.id ? `2px solid ${s.color}` : '2px solid #e5e7eb',
            background: selectedSubject.id===s.id ? `${s.color}10` : 'white',
            fontFamily:'inherit', transition:'all 0.15s',
          }}>
            <span>{s.icon}</span>
            <span style={{ fontSize:'0.875rem', fontWeight:'600', color: selectedSubject.id===s.id ? s.color : '#374151' }}>{s.name}</span>
            <span style={{ fontSize:'0.75rem', fontWeight:'700', color: selectedSubject.id===s.id ? s.color : '#9ca3af' }}>{s.mastery}%</span>
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.25rem' }}>
        {/* Tree main area */}
        <div>
          {/* Subject header */}
          <div style={{ background:`linear-gradient(135deg, ${selectedSubject.color}f0, ${selectedSubject.color}99)`, borderRadius:'16px', padding:'1.25rem', color:'white', marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
              <span style={{ fontSize:'2rem' }}>{selectedSubject.icon}</span>
              <div>
                <h2 style={{ fontSize:'1.1rem', fontWeight:'700' }}>{selectedSubject.name}</h2>
                <p style={{ fontSize:'0.78rem', opacity:0.8 }}>{selectedSubject.topics.filter(t=>t.status==='mastered').length} of {selectedSubject.topics.length} topics mastered</p>
              </div>
            </div>
            <div>
              <div style={{ fontSize:'2rem', fontWeight:'800', lineHeight:1 }}>{selectedSubject.mastery}%</div>
              <div style={{ fontSize:'0.7rem', opacity:0.7 }}>Mastery</div>
            </div>
          </div>

          {/* Mastery progress bar */}
          <div style={{ background:'white', borderRadius:'12px', padding:'1rem 1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontSize:'0.8rem', fontWeight:'600', color:'#374151' }}>Overall Mastery Progress</span>
              <span style={{ fontSize:'0.8rem', fontWeight:'700', color:selectedSubject.color }}>{selectedSubject.mastery}%</span>
            </div>
            <div style={{ height:'10px', background:'#f3f4f6', borderRadius:'5px' }}>
              <div style={{ width:`${selectedSubject.mastery}%`, height:'100%', background:`linear-gradient(90deg, ${selectedSubject.color}, ${selectedSubject.color}99)`, borderRadius:'5px', transition:'width 0.6s ease' }} />
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display:'flex', gap:'6px', marginBottom:'1rem', flexWrap:'wrap' }}>
            {[['all','All Topics'],['mastered','Mastered'],['in-progress','In Progress'],['available','Available'],['at-risk','At Risk'],['locked','Locked']].map(([val,label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding:'5px 12px', borderRadius:'8px', border:'none', cursor:'pointer',
                fontFamily:'inherit', fontSize:'0.78rem', fontWeight:'600',
                background: filter===val ? selectedSubject.color : '#f3f4f6',
                color: filter===val ? 'white' : '#6b7280',
                transition:'all 0.15s',
              }}>{label} {val!=='all' && counts[val] ? `(${counts[val]})` : ''}</button>
            ))}
          </div>

          {/* Topic nodes */}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {filtered.map((t, i) => {
              const st = statusConfig[t.status]
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:'0.875rem',
                  background: t.status==='locked' ? '#fafafa' : 'white',
                  borderRadius:'11px', padding:'0.875rem 1rem',
                  border:`1px solid ${st.border}`,
                  boxShadow: t.status!=='locked' ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                  opacity: t.status==='locked' ? 0.6 : 1,
                  cursor: t.status!=='locked' ? 'pointer' : 'default',
                  transition:'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { if(t.status!=='locked'){ e.currentTarget.style.transform='translateX(3px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)' }}}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=t.status!=='locked'?'0 1px 3px rgba(0,0,0,0.04)':'none' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:st.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{st.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.9rem', fontWeight:'600', color: t.status==='locked'?'#9ca3af':'#111827' }}>{t.name}</div>
                    <div style={{ fontSize:'0.72rem', color:st.color, fontWeight:'600' }}>{st.label}</div>
                  </div>
                  {t.score !== null ? (
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'1rem', fontWeight:'800', color: t.score>=85?'#16a34a':t.score>=75?'#d97706':'#dc2626' }}>{t.score}%</div>
                      <div style={{ height:'4px', width:'50px', background:'#f3f4f6', borderRadius:'2px', marginTop:'3px' }}>
                        <div style={{ width:`${t.score}%`, height:'100%', background: t.score>=85?'#16a34a':t.score>=75?'#d97706':'#dc2626', borderRadius:'2px' }} />
                      </div>
                    </div>
                  ) : t.status === 'available' ? (
                    <button style={{ padding:'5px 12px', background:selectedSubject.color, color:'white', border:'none', borderRadius:'7px', fontSize:'0.75rem', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>Start</button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Stats */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:'700', color:'#111827', marginBottom:'0.875rem' }}>Topic Breakdown</h3>
            {Object.entries(statusConfig).filter(([k]) => k!=='recommended').map(([status, st]) => {
              const count = selectedSubject.topics.filter(t => t.status===status).length
              if (!count) return null
              return (
                <div key={status} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span>{st.icon}</span>
                    <span style={{ fontSize:'0.8rem', color:'#374151', fontWeight:'500' }}>{st.label}</span>
                  </div>
                  <span style={{ fontSize:'0.85rem', fontWeight:'700', color:st.color }}>{count}</span>
                </div>
              )
            })}
          </div>

          {/* All subjects overview */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:'700', color:'#111827', marginBottom:'0.875rem' }}>All Subjects Mastery</h3>
            {subjects.map(s => (
              <div key={s.id} style={{ marginBottom:'0.75rem', cursor:'pointer' }} onClick={() => setSelectedSubject(s)}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:'600', color: selectedSubject.id===s.id ? s.color : '#374151' }}>{s.icon} {s.name}</span>
                  <span style={{ fontSize:'0.8rem', fontWeight:'700', color:s.color }}>{s.mastery}%</span>
                </div>
                <div style={{ height:'5px', background:'#f3f4f6', borderRadius:'3px' }}>
                  <div style={{ width:`${s.mastery}%`, height:'100%', background:`linear-gradient(90deg,${s.color},${s.color}99)`, borderRadius:'3px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={{ background:'linear-gradient(135deg,#eff6ff,#f5f3ff)', borderRadius:'16px', padding:'1.25rem', border:'1px solid #e0e7ff' }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:'700', color:'#111827', marginBottom:'0.875rem' }}>🤖 Next Best Action</h3>
            <p style={{ fontSize:'0.82rem', color:'#374151', lineHeight:1.6, marginBottom:'0.875rem' }}>
              Focus on <strong>Systems of Equations</strong> in Math — you're close to mastery at 72%. One more practice session could push you over 80%.
            </p>
            <button style={{ width:'100%', padding:'8px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>
              Start Practice →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
