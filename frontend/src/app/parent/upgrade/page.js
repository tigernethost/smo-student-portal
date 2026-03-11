'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://portal.schoolmate-online.net/api';

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
    })
      .then(r => r.json())
      .then(data => { setStatus(data); setLoading(false); })
      .catch(() => { setError('Failed to load plan info.'); setLoading(false); });
  }, []);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setPaying(true);
    setError('');
    const token = localStorage.getItem('parent_token');

    try {
      const res = await fetch(`${API}/parent/subscription/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();

      if (data.demo_mode) {
        // Payment gateway not configured — demo upgrade
        localStorage.setItem('parent_tier', selectedPlan);
        router.push(`/parent/upgrade/success?plan=${selectedPlan}&demo=1`);
        return;
      }

      if (data.paynamics_url) {
        // Submit to Paynamics
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paynamics_url;
        const addField = (n, v) => { const i = document.createElement('input'); i.type='hidden'; i.name=n; i.value=v; form.appendChild(i); };
        addField('requestBody', data.request_body);
        addField('signature', data.signature);
        document.body.appendChild(form);
        form.submit();
        return;
      }

      setError(data.message || 'Something went wrong. Please try again.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const plans = status?.plans || [
    { id: 'basic', label: 'Basic', price: 99,  students: 3,    description: 'Up to 3 students, priority support' },
    { id: 'pro',   label: 'Pro',   price: 199, students: null, description: 'Unlimited students, all features' },
  ];

  const tierLabel = { free: 'Free', basic: 'Basic', pro: 'Pro' };
  const currentTier = status?.tier || 'free';

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8f8f8', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#666', fontSize:'15px' }}>Loading your plan...</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f8f8f8', padding:'24px 16px' }}>
      <div style={{ maxWidth:'480px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
          <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'22px', padding:'4px' }}>←</button>
          <div>
            <h1 style={{ margin:0, fontSize:'22px', fontWeight:'700', color:'#111' }}>Upgrade Plan</h1>
            <p style={{ margin:0, fontSize:'13px', color:'#666' }}>Add more students to your account</p>
          </div>
        </div>

        {/* Current Plan Badge */}
        <div style={{ background:'#fff', borderRadius:'12px', padding:'16px 20px', marginBottom:'20px', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ margin:0, fontSize:'12px', color:'#666', textTransform:'uppercase', letterSpacing:'0.05em' }}>Current Plan</p>
            <p style={{ margin:'4px 0 0', fontSize:'18px', fontWeight:'700', color:'#111' }}>{tierLabel[currentTier] || 'Free'}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ margin:0, fontSize:'12px', color:'#666' }}>Students</p>
            <p style={{ margin:'4px 0 0', fontSize:'18px', fontWeight:'700', color:'#111' }}>
              {status?.student_count ?? 0} / {status?.student_limit ?? 1}
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <p style={{ fontSize:'13px', color:'#666', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Choose a plan</p>

        {plans.map(plan => {
          const isCurrent = currentTier === plan.id;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => !isCurrent && setSelectedPlan(plan.id)}
              style={{
                background: '#fff',
                border: isSelected ? '2px solid #111' : isCurrent ? '2px solid #22c55e' : '2px solid #e5e7eb',
                borderRadius:'16px', padding:'20px', marginBottom:'12px',
                cursor: isCurrent ? 'default' : 'pointer',
                transition:'all 0.15s',
                opacity: isCurrent ? 0.75 : 1,
              }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                    <span style={{ fontSize:'16px', fontWeight:'700', color:'#111' }}>{plan.label}</span>
                    {isCurrent && (
                      <span style={{ background:'#dcfce7', color:'#15803d', fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'99px' }}>Current</span>
                    )}
                    {plan.id === 'pro' && !isCurrent && (
                      <span style={{ background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'99px' }}>Best Value</span>
                    )}
                  </div>
                  <p style={{ margin:'0 0 8px', fontSize:'13px', color:'#666' }}>{plan.description}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <span style={{ fontSize:'12px', color:'#444' }}>
                      👨‍👩‍👧 {plan.students ? `Up to ${plan.students} students` : 'Unlimited students'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign:'right', marginLeft:'16px', flexShrink:0 }}>
                  <p style={{ margin:0, fontSize:'22px', fontWeight:'800', color:'#111' }}>₱{plan.price}</p>
                  <p style={{ margin:0, fontSize:'11px', color:'#666' }}>/ month</p>
                </div>
              </div>

              {/* Selection indicator */}
              {!isCurrent && (
                <div style={{ marginTop:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{
                    width:'18px', height:'18px', borderRadius:'50%',
                    border: isSelected ? '5px solid #111' : '2px solid #d1d5db',
                    background: '#fff', flexShrink:0,
                  }} />
                  <span style={{ fontSize:'13px', color: isSelected ? '#111' : '#888' }}>
                    {isSelected ? 'Selected' : 'Select this plan'}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* What's included */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px 20px', marginBottom:'20px' }}>
          <p style={{ margin:'0 0 12px', fontSize:'13px', fontWeight:'600', color:'#111' }}>All plans include:</p>
          {['AI-powered tutoring', 'Subject tracking & analytics', 'Learning style personalization', 'Parent dashboard access'].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <span style={{ color:'#22c55e', fontSize:'14px' }}>✓</span>
              <span style={{ fontSize:'13px', color:'#444' }}>{f}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
            <p style={{ margin:0, fontSize:'13px', color:'#dc2626' }}>⚠️ {error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={!selectedPlan || paying}
          style={{
            width:'100%', padding:'16px', borderRadius:'12px', border:'none',
            background: selectedPlan ? '#111' : '#d1d5db',
            color: selectedPlan ? '#fff' : '#9ca3af',
            fontSize:'16px', fontWeight:'700', cursor: selectedPlan ? 'pointer' : 'not-allowed',
            transition:'all 0.15s',
          }}
        >
          {paying ? 'Processing...' : selectedPlan ? `Upgrade to ${plans.find(p=>p.id===selectedPlan)?.label} — ₱${plans.find(p=>p.id===selectedPlan)?.price}/mo` : 'Select a plan to continue'}
        </button>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#999', marginTop:'12px' }}>
          🔒 Secure payment via Paynamics. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
