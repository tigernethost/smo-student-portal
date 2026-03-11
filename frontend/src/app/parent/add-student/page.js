'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GRADE_LEVELS = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
  'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12',
];

export default function AddStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', grade_level: '', school_name: '', relationship: 'Parent' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) { router.push('/parent/login'); return; }
    fetch('/api/parent/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setParentInfo(d.parent))
      .catch(() => router.push('/parent/login'));
  }, []);

  const tierLimits = { free: 1, basic: 3, pro: 'Unlimited', premium: 'Unlimited' };
  const currentCount = parentInfo?.children?.length ?? 0;
  const tierLimit = tierLimits[parentInfo?.subscription_tier] ?? 1;
  const atLimit = typeof tierLimit === 'number' && currentCount >= tierLimit;

  const handleSubmit = async () => {
    if (!form.name || !form.grade_level) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError('');
    const token = localStorage.getItem('parent_token');
    try {
      const res = await fetch('/api/parent/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create student account.'); return; }
      setInviteData(data);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteData.invite_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi ${inviteData.student.name}! 👋\n\nYour parent has created a SchoolMATE student account for you.\n\nClick this link to set up your account:\n${inviteData.invite_link}\n\nThis link expires in 7 days.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // Success screen
  if (inviteData) return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'40px', maxWidth:'480px', width:'100%', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', textAlign:'center' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <h2 style={{ fontSize:'24px', fontWeight:'700', color:'#111', marginBottom:'8px' }}>Student Account Created!</h2>
        <p style={{ color:'#555', marginBottom:'24px' }}>
          Share this invite link with <strong>{inviteData.student.name}</strong> so they can activate their account and set their own password.
        </p>

        {/* Invite Link Box */}
        <div style={{ background:'#f8f9fa', border:'2px dashed #22c55e', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
          <p style={{ fontSize:'12px', color:'#666', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Invite Link</p>
          <p style={{ fontSize:'13px', color:'#111', wordBreak:'break-all', fontFamily:'monospace', marginBottom:'12px' }}>{inviteData.invite_link}</p>
          <button onClick={copyLink} style={{ background: copied ? '#22c55e' : '#111', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', cursor:'pointer', fontSize:'14px', fontWeight:'600', width:'100%' }}>
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        {/* Share Options */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
          <button onClick={shareViaWhatsApp} style={{ flex:1, background:'#25D366', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
            💬 Share via WhatsApp
          </button>
        </div>

        <div style={{ background:'#fef9c3', borderRadius:'10px', padding:'12px', marginBottom:'24px', textAlign:'left' }}>
          <p style={{ fontSize:'13px', color:'#854d0e', margin:0 }}>
            ⏰ <strong>Link expires in 7 days.</strong> If it expires, you can generate a new one from the student's profile.
          </p>
        </div>

        {/* Student Summary */}
        <div style={{ background:'#f8f9fa', borderRadius:'10px', padding:'16px', textAlign:'left', marginBottom:'24px' }}>
          <p style={{ fontSize:'12px', color:'#666', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Student Details</p>
          <p style={{ margin:'4px 0', fontSize:'14px' }}><strong>Name:</strong> {inviteData.student.name}</p>
          <p style={{ margin:'4px 0', fontSize:'14px' }}><strong>Grade:</strong> {inviteData.student.grade_level}</p>
          {inviteData.student.school_name && <p style={{ margin:'4px 0', fontSize:'14px' }}><strong>School:</strong> {inviteData.student.school_name}</p>}
        </div>

        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => setInviteData(null)} style={{ flex:1, background:'#f3f4f6', color:'#111', border:'none', borderRadius:'10px', padding:'12px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
            + Add Another
          </button>
          <button onClick={() => router.push('/parent/dashboard')} style={{ flex:1, background:'#111', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', padding:'20px' }}>
      <div style={{ maxWidth:'480px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px', paddingTop:'12px' }}>
          <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'20px', padding:'8px' }}>←</button>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:'700', margin:0 }}>Add Student Account</h1>
            <p style={{ color:'#666', fontSize:'14px', margin:0 }}>Create an account for your child</p>
          </div>
        </div>

        {/* Subscription Badge */}
        {parentInfo && (
          <div style={{ background: atLimit ? '#fef2f2' : '#f0fdf4', border:`1px solid ${atLimit?'#fca5a5':'#86efac'}`, borderRadius:'12px', padding:'14px 16px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ margin:0, fontSize:'13px', fontWeight:'600', color: atLimit?'#dc2626':'#16a34a' }}>
                {atLimit ? '⚠️ Student Limit Reached' : `✅ ${parentInfo.subscription_tier.charAt(0).toUpperCase()+parentInfo.subscription_tier.slice(1)} Plan`}
              </p>
              <p style={{ margin:0, fontSize:'12px', color:'#666' }}>
                {currentCount} / {tierLimit} students used
              </p>
            </div>
            {atLimit && (
              <button onClick={() => router.push('/parent/upgrade')} style={{ background:'#dc2626', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
                Upgrade
              </button>
            )}
          </div>
        )}

        {atLimit ? (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'32px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔒</div>
            <h3 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'8px' }}>Plan Limit Reached</h3>
            <p style={{ color:'#666', marginBottom:'20px' }}>
              Your {parentInfo?.subscription_tier} plan allows up to {tierLimit} student(s). Upgrade to add more children.
            </p>
            <button onClick={() => router.push('/parent/upgrade')} style={{ background:'#111', color:'#fff', border:'none', borderRadius:'10px', padding:'14px 28px', cursor:'pointer', fontSize:'15px', fontWeight:'600' }}>
              Upgrade Plan
            </button>
          </div>
        ) : (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
                Student Name <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Juan dela Cruz"
                style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
                Grade Level <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <select
                value={form.grade_level}
                onChange={e => setForm({...form, grade_level: e.target.value})}
                style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', background:'#fff', boxSizing:'border-box' }}
              >
                <option value="">Select grade level</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
                School Name <span style={{ color:'#999', fontWeight:'400' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={form.school_name}
                onChange={e => setForm({...form, school_name: e.target.value})}
                placeholder="e.g. San Jose Elementary School"
                style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            <div style={{ marginBottom:'24px' }}>
              <label style={{ display:'block', fontSize:'14px', fontWeight:'600', marginBottom:'6px', color:'#333' }}>
                Your Relationship
              </label>
              <select
                value={form.relationship}
                onChange={e => setForm({...form, relationship: e.target.value})}
                style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'15px', outline:'none', background:'#fff', boxSizing:'border-box' }}
              >
                {['Parent','Mother','Father','Guardian','Grandparent','Sibling'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'10px', padding:'12px', marginBottom:'16px', color:'#dc2626', fontSize:'14px' }}>
                {error}
              </div>
            )}

            {/* How it works */}
            <div style={{ background:'#f0f9ff', borderRadius:'10px', padding:'14px', marginBottom:'20px' }}>
              <p style={{ fontSize:'13px', color:'#0369a1', margin:'0 0 6px', fontWeight:'600' }}>📱 How it works</p>
              <p style={{ fontSize:'13px', color:'#0369a1', margin:0, lineHeight:'1.5' }}>
                After creating the account, you'll get a unique invite link to share with your child via WhatsApp or any messaging app. They'll click the link to set their own password and activate their account.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width:'100%', background: loading ? '#9ca3af' : '#111', color:'#fff', border:'none', borderRadius:'12px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating Account...' : 'Create Student Account →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
