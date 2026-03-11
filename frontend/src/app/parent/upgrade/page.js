'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://portal.schoolmate-online.net/api';
const css = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing:border-box; margin:0; padding:0; } body { font-family:'Nunito',sans-serif; } .plan-card { background:#fff; border-radius:20px; padding:24px; cursor:pointer; transition:all .2s; border:2px solid #f0eefd; } .plan-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,.15); } .upgrade-btn { width:100%; padding:15px; border:none; border-radius:14px; font-size:16px; font-weight:800; cursor:pointer; transition:all .15s; font-family:'Nunito',sans-serif; } .upgrade-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(108,99,255,.35); } .upgrade-btn:disabled { opacity:.6; transform:none; cursor:not-allowed; }`

export default function ParentUpgradePage() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) { router.push('/parent/login'); return; }
    fetch(`${API}/parent/subscription/status`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).then(r => r.json()).then(data => { setStatus(data); setLoading(false); })
      .catch(() => { setError('Failed to load plan info.'); setLoading(false); });
  }, []);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setPaying(true); setError('');
    const token = localStorage.getItem('parent_token');
    try {
      const res = await fetch(`${API}/parent/subscription/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.demo_mode) { localStorage.setItem('parent_tier', selectedPlan); router.push(`/parent/upgrade/success?plan=${selectedPlan}&demo=1`); return; }
      if (data.paynamics_url) {
        const form = document.createElement('form'); form.method = 'POST'; form.action = data.paynamics_url;
        const addField = (n, v) => { const i = document.createElement('input'); i.type='hidden'; i.name=n; i.value=v; form.appendChild(i); };
        addField('requestBody', data.request_body); addField('signature', data.signature);
        document.body.appendChild(form); form.submit(); return;
      }
      setError(data.message || 'Something went wrong.');
    } catch { setError('Network error. Please try again.'); }
    finally { setPaying(false); }
  };

  const plans = status?.plans || [
    { id: 'basic', label: 'Basic', price: 99,  students: 3,    description: 'Up to 3 students · Priority support' },
    { id: 'pro',   label: 'Pro',   price: 199, students: null, description: 'Unlimited students · All features' },
  ];
  const currentTier = status?.tier || 'free';
  const tierLabel = { free: 'Free', basic: 'Basic', pro: 'Pro' };

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'#f8f7ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'#9ca3af', fontFamily:"'Nunito',sans-serif" }}>Loading your plan…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'#f8f7ff', padding:'24px 16px', fontFamily:"'Nunito',sans-serif", color:'#1a1a2e' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
            <button onClick={() => router.back()} style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>←</button>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.5px' }}>Upgrade Plan</h1>
              <p style={{ fontSize:13, color:'#9ca3af', fontWeight:600 }}>Add more students to your account</p>
            </div>
          </div>

          {/* Current plan */}
          <div style={{ background:'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius:20, padding:'20px 24px', marginBottom:24, color:'#fff', boxShadow:'0 8px 24px rgba(108,99,255,.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:12, opacity:.7, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em' }}>Current Plan</p>
                <p style={{ fontSize:22, fontWeight:900, marginTop:4 }}>{tierLabel[currentTier]}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:12, opacity:.7, fontWeight:700 }}>Students</p>
                <p style={{ fontSize:22, fontWeight:900, marginTop:4 }}>{status?.student_count ?? 0} / {status?.student_limit ?? 1}</p>
              </div>
            </div>
          </div>

          {/* Plan Cards */}
          <p style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Choose a plan</p>

          {plans.map(plan => {
            const isCurrent = currentTier === plan.id;
            const isSelected = selectedPlan === plan.id;
            return (
              <div key={plan.id} className="plan-card" onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                style={{ marginBottom:12, border: isSelected ? '2px solid #6c63ff' : isCurrent ? '2px solid #22c55e' : '2px solid #f0eefd',
                  opacity: isCurrent ? .8 : 1, cursor: isCurrent ? 'default' : 'pointer',
                  boxShadow: isSelected ? '0 8px 24px rgba(108,99,255,.2)' : 'none' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:16, fontWeight:900 }}>{plan.label}</span>
                      {isCurrent && <span style={{ background:'#dcfce7', color:'#15803d', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>Current</span>}
                      {plan.id === 'pro' && !isCurrent && <span style={{ background:'#fef3c7', color:'#92400e', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>Best Value ✨</span>}
                    </div>
                    <p style={{ fontSize:13, color:'#6b7280', fontWeight:600 }}>{plan.description}</p>
                    <p style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>👨‍👩‍👧 {plan.students ? `Up to ${plan.students} students` : 'Unlimited students'}</p>
                  </div>
                  <div style={{ textAlign:'right', marginLeft:16, flexShrink:0 }}>
                    <p style={{ fontSize:24, fontWeight:900, color:'#1a1a2e' }}>₱{plan.price}</p>
                    <p style={{ fontSize:11, color:'#9ca3af', fontWeight:600 }}>/month</p>
                  </div>
                </div>
                {!isCurrent && (
                  <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', border: isSelected ? '5px solid #6c63ff' : '2px solid #d1d5db', background:'#fff', flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:700, color: isSelected ? '#6c63ff' : '#9ca3af' }}>{isSelected ? '✓ Selected' : 'Select plan'}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Features */}
          <div style={{ background:'#fff', border:'1px solid #f0eefd', borderRadius:16, padding:'16px 20px', marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:800, marginBottom:12 }}>All plans include:</p>
            {['AI-powered tutoring', 'Subject tracking & analytics', 'Learning style personalization', 'Parent dashboard access'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ color:'#6c63ff', fontWeight:900 }}>✓</span>
                <span style={{ fontSize:13, color:'#6b7280', fontWeight:600 }}>{f}</span>
              </div>
            ))}
          </div>

          {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'#dc2626', fontSize:13, fontWeight:600 }}>⚠️ {error}</div>}

          <button className="upgrade-btn" onClick={handleUpgrade} disabled={!selectedPlan || paying}
            style={{ background: selectedPlan ? 'linear-gradient(135deg,#6c63ff,#a78bfa)' : '#e5e7eb', color: selectedPlan ? '#fff' : '#9ca3af' }}>
            {paying ? 'Processing…' : selectedPlan ? `Upgrade to ${plans.find(p=>p.id===selectedPlan)?.label} — ₱${plans.find(p=>p.id===selectedPlan)?.price}/mo →` : 'Select a plan to continue'}
          </button>
          <p style={{ textAlign:'center', fontSize:12, color:'#9ca3af', marginTop:12, fontWeight:600 }}>🔒 Secure payment · Cancel anytime</p>
        </div>
      </div>
    </>
  );
}
