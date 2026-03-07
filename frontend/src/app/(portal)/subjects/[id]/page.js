import Link from 'next/link'

const subjectData = {
  1: { name:'Mathematics', code:'MATH8', teacher:'Mr. Santos', color:'#2563eb', icon:'📐',
    q1:90, q2:91, q3:95, avg:92,
    components:[{name:'Written Work',weight:25,score:93},{name:'Performance Task',weight:50,score:91},{name:'Quarterly Assessment',weight:25,score:95}],
    topics:[
      {id:1,name:'Factors & Multiples',status:'mastered',score:96,quarter:1},
      {id:2,name:'GCF and LCM',status:'mastered',score:94,quarter:1},
      {id:3,name:'Special Products',status:'mastered',score:90,quarter:1},
      {id:4,name:'Rational Algebraic Expressions',status:'mastered',score:88,quarter:2},
      {id:5,name:'Linear Equations',status:'mastered',score:92,quarter:2},
      {id:6,name:'Systems of Equations',status:'in-progress',score:72,quarter:2},
      {id:7,name:'Quadratic Equations',status:'in-progress',score:85,quarter:3},
      {id:8,name:'Quadratic Formula',status:'available',score:null,quarter:3},
      {id:9,name:'Quadratic Inequalities',status:'locked',score:null,quarter:3},
      {id:10,name:'Geometry – Triangles',status:'locked',score:null,quarter:4},
    ],
    attendance:{present:18,late:1,absent:1,total:20},
    recentScores:[
      {title:'Quadratic Equations Quiz',type:'quiz',score:38,total:40,date:'Mar 5'},
      {title:'Q3 Long Test',type:'exam',score:47,total:50,date:'Feb 28'},
      {title:'Systems of Equations Quiz',type:'quiz',score:18,total:20,date:'Feb 20'},
    ],
  }
}

const statusStyle = {
  mastered: { bg:'#f0fdf4', color:'#16a34a', label:'✅ Mastered' },
  'in-progress': { bg:'#fffbeb', color:'#d97706', label:'🟡 In Progress' },
  available: { bg:'#eff6ff', color:'#2563eb', label:'📘 Available' },
  locked: { bg:'#f9fafb', color:'#9ca3af', label:'🔒 Locked' },
  'at-risk': { bg:'#fef2f2', color:'#dc2626', label:'⚠️ At Risk' },
}

export default function SubjectDetailPage({ params }) {
  const id = params.id
  const s = subjectData[id] || subjectData[1]

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
      {/* Back */}
      <Link href="/subjects" style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#6b7280', textDecoration:'none', fontSize:'0.85rem', marginBottom:'1.25rem', fontWeight:'500' }}>
        ← Back to Subjects
      </Link>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${s.color}ee, ${s.color}99)`, borderRadius:'20px', padding:'1.5rem', color:'white', marginBottom:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem' }}>{s.icon}</div>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:'800', marginBottom:'2px' }}>{s.name}</h1>
            <p style={{ fontSize:'0.85rem', opacity:0.75 }}>{s.teacher} · {s.code} · Grade 8</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'2.5rem', fontWeight:'800', lineHeight:1 }}>{s.avg}%</div>
          <div style={{ fontSize:'0.75rem', opacity:0.7 }}>Quarter Average</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.25rem' }}>
        {/* Left */}
        <div>
          {/* Grade components */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', marginBottom:'1.25rem' }}>
            <h2 style={{ fontSize:'0.95rem', fontWeight:'700', color:'#111827', marginBottom:'1rem' }}>Grade Components</h2>
            {s.components.map(c => (
              <div key={c.name} style={{ marginBottom:'0.875rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:'600', color:'#374151' }}>{c.name}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:'700', color: c.score >= 90 ? '#16a34a' : c.score >= 80 ? '#2563eb' : '#d97706' }}>{c.score}% <span style={{ color:'#9ca3af', fontWeight:'400', fontSize:'0.75rem' }}>({c.weight}% weight)</span></span>
                </div>
                <div style={{ height:'7px', background:'#f3f4f6', borderRadius:'4px' }}>
                  <div style={{ width:`${c.score}%`, height:'100%', background:`linear-gradient(90deg, ${s.color}, ${s.color}99)`, borderRadius:'4px' }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop:'1px solid #f3f4f6', marginTop:'0.875rem', paddingTop:'0.875rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.85rem', fontWeight:'600', color:'#374151' }}>Final Average</span>
              <span style={{ fontSize:'1.25rem', fontWeight:'800', color:s.color }}>{s.avg}%</span>
            </div>
          </div>

          {/* Topics / Mastery */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <h2 style={{ fontSize:'0.95rem', fontWeight:'700', color:'#111827' }}>Topic Mastery</h2>
              <Link href="/learning-path" style={{ fontSize:'0.78rem', color:'#2563eb', textDecoration:'none', fontWeight:'600' }}>View in Tree →</Link>
            </div>
            {s.topics.map(t => {
              const st = statusStyle[t.status]
              return (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.625rem 0.75rem', borderRadius:'9px', marginBottom:'4px', background: t.status === 'locked' ? '#fafafa' : 'white', border:'1px solid #f3f4f6' }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:'700', color:st.color, background:st.bg, padding:'2px 8px', borderRadius:'5px', flexShrink:0 }}>{st.label}</span>
                  <span style={{ fontSize:'0.875rem', fontWeight:'500', color: t.status === 'locked' ? '#9ca3af' : '#374151', flex:1 }}>{t.name}</span>
                  {t.score !== null && (
                    <span style={{ fontSize:'0.85rem', fontWeight:'700', color: t.score >= 85 ? '#16a34a' : '#d97706' }}>{t.score}%</span>
                  )}
                  <span style={{ fontSize:'0.7rem', color:'#9ca3af', flexShrink:0 }}>Q{t.quarter}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Quarter scores */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize:'0.875rem', fontWeight:'700', color:'#111827', marginBottom:'0.875rem' }}>Quarterly Scores</h2>
            <div style={{ display:'flex', gap:'0.625rem' }}>
              {[['Q1',s.q1],['Q2',s.q2],['Q3',s.q3]].map(([q,val]) => (
                <div key={q} style={{ flex:1, textAlign:'center', background: q==='Q3'?`${s.color}10`:'#f9fafb', borderRadius:'10px', padding:'0.75rem', border: q==='Q3'?`1.5px solid ${s.color}30`:'1.5px solid #f3f4f6' }}>
                  <div style={{ fontSize:'0.7rem', color:'#6b7280', marginBottom:'2px' }}>{q}</div>
                  <div style={{ fontSize:'1.4rem', fontWeight:'800', color: q==='Q3'?s.color:'#111827' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent scores */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize:'0.875rem', fontWeight:'700', color:'#111827', marginBottom:'0.875rem' }}>Recent Assessments</h2>
            {s.recentScores.map((r,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.625rem 0', borderBottom: i<s.recentScores.length-1?'1px solid #f9fafb':'none' }}>
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:'600', color:'#374151' }}>{r.title}</div>
                  <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>{r.type} · {r.date}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.9rem', fontWeight:'700', color: (r.score/r.total)>=0.9?'#16a34a':(r.score/r.total)>=0.75?'#2563eb':'#dc2626' }}>{r.score}/{r.total}</div>
                  <div style={{ fontSize:'0.7rem', color:'#9ca3af' }}>{Math.round(r.score/r.total*100)}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize:'0.875rem', fontWeight:'700', color:'#111827', marginBottom:'0.875rem' }}>Attendance</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem', marginBottom:'0.75rem' }}>
              {[['✅',s.attendance.present,'Present','#f0fdf4','#16a34a'],['⏰',s.attendance.late,'Late','#fffbeb','#d97706'],['❌',s.attendance.absent,'Absent','#fef2f2','#dc2626']].map(([icon,val,label,bg,c]) => (
                <div key={label} style={{ textAlign:'center', background:bg, borderRadius:'9px', padding:'0.625rem' }}>
                  <div style={{ fontSize:'1.1rem', marginBottom:'1px' }}>{icon}</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:'800', color:c }}>{val}</div>
                  <div style={{ fontSize:'0.65rem', color:'#6b7280' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center', fontSize:'0.78rem', color:'#6b7280' }}>
              {Math.round((s.attendance.present/s.attendance.total)*100)}% attendance rate this quarter
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
