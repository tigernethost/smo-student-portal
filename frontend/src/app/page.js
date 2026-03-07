export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <div style={{
          width: '80px', height: '80px',
          background: '#2563eb', borderRadius: '20px',
          margin: '0 auto 2rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 'bold', color: 'white'
        }}>S</div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem' }}>
          SchoolMATE
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2563eb', margin: '0 0 1.5rem' }}>
          Student Portal
        </h2>

        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Your personalized learning companion. Track progress, discover strengths,
          and chart your path to success.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#fef3c7', color: '#92400e',
          padding: '8px 16px', borderRadius: '999px',
          fontSize: '0.875rem', fontWeight: 500
        }}>
          <span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></span>
          Under Development — Coming Soon
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '1rem', marginTop: '2rem'
        }}>
          {[
            ['📊', 'Grade Analytics'],
            ['🌳', 'Learning Tree'],
            ['🎯', 'Goal Tracking'],
            ['🎓', 'Career Guidance'],
          ].map(([icon, label]) => (
            <div key={label} style={{
              background: 'white', borderRadius: '12px',
              padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#9ca3af' }}>
          © {new Date().getFullYear()} SchoolMATE · portal.schoolmate-online.net
        </p>
      </div>
    </main>
  )
}
