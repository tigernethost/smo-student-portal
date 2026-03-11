'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

const css = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing:border-box; margin:0; padding:0; } body { font-family:'Nunito',sans-serif; }`

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get('plan') || 'basic';
  const demo = params.get('demo');
  const limits = { basic: '3 students', pro: 'Unlimited students' };
  const prices = { basic: '₱99', pro: '₱199' };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#f0f4ff,#faf5ff)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"'Nunito',sans-serif" }}>
        <div style={{ maxWidth:400, width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
          <h1 style={{ fontSize:28, fontWeight:900, color:'#1a1a2e', margin:'0 0 8px', letterSpacing:'-0.5px' }}>You're all set!</h1>
          <p style={{ fontSize:15, color:'#6b7280', margin:'0 0 28px', fontWeight:600 }}>
            Account upgraded to <strong style={{ color:'#6c63ff', textTransform:'capitalize' }}>{plan}</strong>
          </p>

          <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f0eefd', padding:24, marginBottom:24, boxShadow:'0 4px 16px rgba(108,99,255,.08)' }}>
            {[['Plan', plan.charAt(0).toUpperCase()+plan.slice(1)], ['Students allowed', limits[plan]||'3 students'], ['Monthly cost', (prices[plan]||'₱99')+'/mo']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f8f7ff' }}>
                <span style={{ fontSize:14, color:'#9ca3af', fontWeight:600 }}>{k}</span>
                <span style={{ fontSize:14, fontWeight:900, color:'#1a1a2e' }}>{v}</span>
              </div>
            ))}
          </div>

          {demo && (
            <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'12px 16px', marginBottom:20 }}>
              <p style={{ fontSize:12, color:'#92400e', fontWeight:600 }}>⚠️ Demo mode — payment gateway not configured yet. Account upgraded for testing.</p>
            </div>
          )}

          <button onClick={() => router.push('/parent/add-student')}
            style={{ width:'100%', padding:16, borderRadius:14, border:'none', background:'linear-gradient(135deg,#6c63ff,#a78bfa)', color:'#fff', fontSize:16, fontWeight:800, cursor:'pointer', marginBottom:10, fontFamily:"'Nunito',sans-serif", boxShadow:'0 6px 20px rgba(108,99,255,.35)' }}>
            ➕ Add a Student Now
          </button>
          <button onClick={() => router.push('/parent/dashboard')}
            style={{ width:'100%', padding:14, borderRadius:14, border:'2px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}

export default function UpgradeSuccessPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#f0f4ff',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Loading...</p></div>}><SuccessContent /></Suspense>;
}
