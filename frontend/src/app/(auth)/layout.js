export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #ede9fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {children}
    </div>
  )
}
