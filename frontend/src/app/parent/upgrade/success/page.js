'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get('plan') || 'basic';
  const demo = params.get('demo');

  const limits = { basic: '3 students', pro: 'Unlimited students' };
  const prices = { basic: '₱99', pro: '₱199' };

  return (
    <div style={{ minHeight:'100vh', background:'#f8f8f8', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <div style={{ maxWidth:'420px', width:'100%', textAlign:'center' }}>

        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#111', margin:'0 0 8px' }}>You're all set!</h1>
        <p style={{ fontSize:'15px', color:'#666', margin:'0 0 28px' }}>
          Your account has been upgraded to <strong style={{ color:'#111', textTransform:'capitalize' }}>{plan}</strong>
        </p>

        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'24px', marginBottom:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
            <span style={{ fontSize:'14px', color:'#666' }}>Plan</span>
            <span style={{ fontSize:'14px', fontWeight:'700', color:'#111', textTransform:'capitalize' }}>{plan}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
            <span style={{ fontSize:'14px', color:'#666' }}>Students allowed</span>
            <span style={{ fontSize:'14px', fontWeight:'700', color:'#111' }}>{limits[plan] || '3 students'}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:'14px', color:'#666' }}>Monthly cost</span>
            <span style={{ fontSize:'14px', fontWeight:'700', color:'#111' }}>{prices[plan] || '₱99'}/mo</span>
          </div>
        </div>

        {demo && (
          <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px' }}>
            <p style={{ margin:0, fontSize:'12px', color:'#92400e' }}>
              ⚠️ Demo mode — payment gateway not yet configured. Account upgraded for testing.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/parent/add-student')}
          style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', background:'#111', color:'#fff', fontSize:'16px', fontWeight:'700', cursor:'pointer', marginBottom:'12px' }}
        >
          ➕ Add a Student Now
        </button>
        <button
          onClick={() => router.push('/parent/dashboard')}
          style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'2px solid #e5e7eb', background:'#fff', color:'#111', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Loading...</p></div>}><SuccessContent /></Suspense>;
}
