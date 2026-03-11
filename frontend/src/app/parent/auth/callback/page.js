'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Processing your sign-in...');

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    const provider = params.get('provider');

    if (error) {
      setStatus('Sign-in failed. Redirecting...');
      setTimeout(() => router.push('/parent/login?error=oauth_failed'), 1500);
      return;
    }

    if (!token) {
      setStatus('Invalid response. Redirecting...');
      setTimeout(() => router.push('/parent/login'), 1500);
      return;
    }

    // Store token and fetch parent info
    localStorage.setItem('parent_token', token);

    const API = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${API}/api/parent/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        if (data.parent) {
          localStorage.setItem('parent_data', JSON.stringify(data.parent));
          setStatus('Signed in! Redirecting to dashboard...');
          // If new parent with no children, prompt to link a child
          if (data.parent.children?.length === 0) {
            router.push('/parent/dashboard?welcome=1');
          } else {
            router.push('/parent/dashboard');
          }
        } else {
          throw new Error('No parent data');
        }
      })
      .catch(() => {
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => router.push('/parent/login'), 1500);
      });
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px', animation:'spin 1s linear infinite' }}>⚙️</div>
        <p style={{ color:'#94a3b8', fontSize:'16px' }}>{status}</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function ParentAuthCallback() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'#94a3b8' }}>Loading...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
