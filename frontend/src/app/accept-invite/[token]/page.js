'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const [step, setStep] = useState('loading'); // loading | invalid | expired | accepted | form | success
  const [inviteInfo, setInviteInfo] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.already_accepted) { setStep('accepted'); return; }
        if (data.expired) { setStep('expired'); return; }
        if (!data.valid) { setStep('invalid'); return; }
        setInviteInfo(data);
        setStep('form');
      })
      .catch(() => setStep('invalid'));
  }, [token]);

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.password_confirmation) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }

    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || 'Failed to activate account.'); return; }

      // Save token and redirect student
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStep('success');
      setTimeout(() => router.push(data.redirect || '/onboarding'), 2000);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  // Loading
  if (step === 'loading') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'16px' }}>⏳</div>
        <p style={{ color:'#666' }}>Validating your invite...</p>
      </div>
    </div>
  );

  // Invalid
  if (step === 'invalid') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>❌</div>
        <h2 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>Invalid Invite Link</h2>
        <p style={{ color:'#666', marginBottom:'24px' }}>This invite link is not valid. Please ask your parent to send a new one.</p>
        <button onClick={() => router.push('/')} style={{ background:'#111', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 24px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
          Go to Homepage
        </button>
      </div>
    </div>
  );

  // Expired
  if (step === 'expired') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>⏰</div>
        <h2 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>Invite Link Expired</h2>
        <p style={{ color:'#666', marginBottom:'24px' }}>This link has expired (links are valid for 7 days). Ask your parent to generate a new invite from their dashboard.</p>
        <button onClick={() => router.push('/')} style={{ background:'#111', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 24px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
          Go to Homepage
        </button>
      </div>
    </div>
  );

  // Already accepted
  if (step === 'accepted') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>✅</div>
        <h2 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>Already Activated</h2>
        <p style={{ color:'#666', marginBottom:'24px' }}>This account has already been activated. You can log in directly.</p>
        <button onClick={() => router.push('/login')} style={{ background:'#111', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 24px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
          Go to Login
        </button>
      </div>
    </div>
  );

  // Success
  if (step === 'success') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0fdf4', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎓</div>
        <h2 style={{ fontSize:'24px', fontWeight:'700', marginBottom:'8px' }}>Welcome to SchoolMATE!</h2>
        <p style={{ color:'#666' }}>Your account is activated. Taking you to set up your profile...</p>
      </div>
    </div>
  );

  // Form
  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ maxWidth:'440px', width:'100%' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎓</div>
          <h1 style={{ fontSize:'26px', fontWeight:'800', margin:'0 0 8px' }}>Activate Your Account</h1>
          <p style={{ color:'#666', margin:0 }}>
            <strong>{inviteInfo?.parent_name}</strong> ({inviteInfo?.relationship}) created a SchoolMATE account for you
          </p>
        </div>

        {/* Student Info Card */}
        <div style={{ background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:'14px', padding:'16px', marginBottom:'24px' }}>
          <p style={{ fontSize:'12px', color:'#16a34a', fontWeight:'600', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Your Account Details</p>
          <p style={{ margin:'4px 0', fontSize:'15px', fontWeight:'700' }}>{inviteInfo?.student_name}</p>
          <p style={{ margin:'4px 0', fontSize:'14px', color:'#444' }}>{inviteInfo?.grade_level} {inviteInfo?.school_name ? `· ${inviteInfo.school_name}` : ''}</p>
        </div>

        {/* Form */}
        <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize:'14px', color:'#666', marginTop:0, marginBottom:'20px' }}>
            Set your email and password to activate your account.
          </p>

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
              Your Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="yourname@email.com"
              style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', boxSizing:'border-box' }}
            />
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
              Create Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="At least 8 characters"
                style={{ width:'100%', padding:'12px 44px 12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', boxSizing:'border-box' }}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#666', fontSize:'16px' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={e => setForm({...form, password_confirmation: e.target.value})}
              placeholder="Re-enter your password"
              style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', boxSizing:'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'10px', padding:'12px', marginBottom:'16px', color:'#dc2626', fontSize:'14px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width:'100%', background: loading ? '#9ca3af' : '#111', color:'#fff', border:'none', borderRadius:'12px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer', marginBottom:'12px' }}
          >
            {loading ? 'Activating...' : 'Activate My Account 🚀'}
          </button>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#666', margin:0 }}>
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} style={{ background:'none', border:'none', color:'#111', fontWeight:'600', cursor:'pointer', textDecoration:'underline' }}>
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
