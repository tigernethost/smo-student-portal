'use client'
import Link from 'next/link'

const subjects = [
  { name:'Mathematics', avg:92, q1:90, q2:91, q3:95, color:'#2563eb', icon:'📐', trend:'up' },
  { name:'English', avg:88, q1:85, q2:87, q3:88, color:'#7c3aed', icon:'📖', trend:'stable' },
  { name:'Science', avg:85, q1:82, q2:83, q3:89, color:'#059669', icon:'🔬', trend:'up' },
  { name:'Filipino', avg:90, q1:88, q2:90, q3:90, color:'#d97706', icon:'🇵🇭', trend:'stable' },
  { name:'Araling Panlipunan', avg:83, q1:86, q2:88, q3:83, color:'#dc2626', icon:'🌏', trend:'down' },
  { name:'TLE', avg:91, q1:89, q2:90, q3:93, color:'#0891b2', icon:'🔧', trend:'up' },
  { name:'MAPEH', avg:87, q1:85, q2:86, q3:87, color:'#db2777', icon:'🎨', trend:'stable' },
  { name:'Values Education', avg:94, q1:92, q2:94, q3:95, color:'#9333ea', icon:'🌟', trend:'up' },
]

const maxScore = 100
const barMaxH = 80

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'4px', height:`${barMaxH}px` }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
          <div style={{ fontSize:'0.6rem', color:'#6b7280', fontWeight:'600' }}>{d.value}</div>
          <div style={{ width:'100%', background:`linear-gradient(to top, ${d.color}, ${d.color}99)`, borderRadius:'3px 3px 0 0', height:`${(d.value/max)*barMaxH*0.8}px`, minHeight:'4px', transition:'height 0.4s ease' }} />
          <div style={{ fontSize:'0.6rem', color:'#9ca3af', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'28px', textAlign:'center' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const overall = Math.round(subjects.reduce((a,s)=>a+s.avg,0)/subjects.length*10)/10
  const topSubject = subjects.reduce((a,b)=>a.avg>b.avg?a:b)
  const weakSubject = subjects.reduce((a,b)=>a.avg<b.avg?a:b)
  const improving = subjects.filter(s=>s.trend==='up').length

  const quarterData = ['Q1','Q2','Q3'].map((q,i)=>({
    label: q,
    value: Math.round(subjects.reduce((a,s)=>a+[s.q1,s.q2,s.q3][i],0)/subjects.length*10)/10,
    color: '#2563eb',
  }))

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:'800', color:'#111827' }}>Analytics</h1>
        <p style={{ fontSize:'0.875rem', color:'#6b7280', marginTop:'4px' }}>Detailed view of your academic performance</p>
      </div>

      {/* Summary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { icon:'📊', label:'Current Average', value:`${overall}%`, sub:'All subjects Q3', color:'#2563eb', bg:'#eff6ff' },
          { icon:'🏆', label:'Top Subject', value:topSubject.name.split(' ')[0], sub:`${topSubject.avg}%`, color:'#16a34a', bg:'#f0fdf4' },
          { icon:'📈', label:'Improving', value:`${improving} subjects`, sub:'vs last quarter', color:'#d97706', bg:'#fffbeb' },
          { icon:'⚠️', label:'Needs Focus', value:weakSubject.name.split(' ')[0], sub:`${weakSubject.avg}%`, color:'#dc2626', bg:'#fef2f2' },
        ].map(({ icon,label,value,sub,color,bg }) => (
          <div key={label} style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', marginBottom:'0.75rem' }}>{icon}</div>
            <div style={{ fontSize:'1.25rem', fontWeight:'800', color, lineHeight:1, marginBottom:'2px' }}>{value}</div>
            <div style={{ fontSize:'0.78rem', fontWeight:'600', color:'#374151' }}>{label}</div>
            <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        {/* Bar chart per subject */}
        <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:'0.95rem', fontWeight:'700', color:'#111827', marginBottom:'1rem' }}>Scores by Subject (Q3)</h2>
          <BarChart data={subjects.map(s=>({ value:s.q3||s.avg, label:s.icon, color:s.color }))} />
          <div style={{ marginTop:'0.875rem', display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {subjects.map(s=>(
              <div key={s.name} style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.7rem', color:'#6b7280' }}>
                <span>{s.icon}</span><span>{s.name.substring(0,8)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quarter trend */}
        <div style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:'0.95rem', fontWeight:'700', color:'#111827', marginBottom:'1rem' }}>Average per Quarter</h2>
          <BarChart data={quarterData} />
          <div style={{ marginTop:'0.875rem' }}>
            {quarterData.map((d,i)=>(
              <div key={d.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', borderBottom: i<quarterData.length-1?'1px solid #f9fafb':'none' }}>
                <span style={{ fontSize:'0.82rem', color:'#374151', fontWeight:'600' }}>{d.label} Average</span>
                <span style={{ fontSize:'0.82rem', fontWeight:'700', color:'#2563eb' }}>{d.value}%</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0 0', borderTop:'2px solid #e5e7eb', marginTop:'4px' }}>
              <span style={{ fontSize:'0.82rem', color:'#374151', fontWeight:'700' }}>Overall Trend</span>
              <span style={{ fontSize:'0.82rem', fontWeight:'700', color:'#16a34a' }}>↑ +{(quarterData[2].value - quarterData[0].value).toFixed(1)} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject detail table */}
      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #f3f4f6', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        <div style={{ padding:'1.25rem', borderBottom:'1px solid #f3f4f6' }}>
          <h2 style={{ fontSize:'0.95rem', fontWeight:'700', color:'#111827' }}>Detailed Performance Table</h2>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb' }}>
                {['Subject','Q1','Q2','Q3','Average','Trend','Status'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign: h==='Subject'?'left':'center', fontSize:'0.75rem', fontWeight:'700', color:'#6b7280', letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s,i)=>{
                const desc = s.avg>=90?'Outstanding':s.avg>=85?'Very Satisfactory':s.avg>=80?'Satisfactory':'Needs Improvement'
                const descColor = s.avg>=90?'#16a34a':s.avg>=85?'#2563eb':s.avg>=80?'#d97706':'#dc2626'
                const trendIcon = s.trend==='up'?'↑':s.trend==='down'?'↓':'→'
                const trendColor = s.trend==='up'?'#16a34a':s.trend==='down'?'#dc2626':'#6b7280'
                return (
                  <tr key={s.name} style={{ borderBottom:'1px solid #f9fafb', transition:'background 0.1s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'1.1rem' }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize:'0.875rem', fontWeight:'600', color:'#111827' }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    {[s.q1,s.q2,s.q3].map((q,j)=>(
                      <td key={j} style={{ padding:'12px 16px', textAlign:'center', fontSize:'0.875rem', fontWeight:'600', color: q>=90?'#16a34a':q>=80?'#2563eb':'#d97706' }}>{q}</td>
                    ))}
                    <td style={{ padding:'12px 16px', textAlign:'center', fontSize:'0.95rem', fontWeight:'800', color:s.color }}>{s.avg}%</td>
                    <td style={{ padding:'12px 16px', textAlign:'center', fontSize:'0.95rem', fontWeight:'700', color:trendColor }}>{trendIcon}</td>
                    <td style={{ padding:'12px 16px', textAlign:'center' }}>
                      <span style={{ fontSize:'0.72rem', fontWeight:'700', color:descColor, background:`${descColor}15`, padding:'3px 8px', borderRadius:'5px' }}>{desc}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
