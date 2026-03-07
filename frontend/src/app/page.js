import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            top: `${10 + i * 15}%`,
            left: `${-5 + i * 20}%`,
            border: '1px solid rgba(255,255,255,0.05)',
          }} />
        ))}
      </div>

      <div style={{ textAlign: 'center', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{
          width: '80px', height: '80px',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          borderRadius: '20px',
          margin: '0 auto 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(59,130,246,0.4)',
          fontSize: '2rem', fontWeight: '800', color: 'white',
        }}>S</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '999px', padding: '4px 12px',
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)',
          marginBottom: '1.5rem', letterSpacing: '0.05em',
          textTransform: 'uppercase', fontWeight: '600',
        }}>
          <span style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%' }} />
          Now Live
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'white', lineHeight: 1.1, marginBottom: '0.5rem' }}>
          SchoolMATE
        </h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '400', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          Student Portal
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Track your academic progress, discover your strengths, and get personalized guidance to reach your goals.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: 'white', padding: '12px 28px',
            borderRadius: '10px', textDecoration: 'none',
            fontWeight: '600', fontSize: '0.95rem',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            Sign In to Portal →
          </Link>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '1rem', marginTop: '3rem',
        }}>
          {[
            ['📊', 'Grade Analytics', 'Track every score'],
            ['🌳', 'Learning Tree', 'Visual mastery map'],
            ['🎯', 'Goal Tracker', 'Set & hit targets'],
            ['🤖', 'AI Insights', 'Personalized tips'],
          ].map(([icon, label, desc]) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '1rem',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} SchoolMATE · portal.schoolmate-online.net
        </p>
      </div>
    </main>
  )
}
