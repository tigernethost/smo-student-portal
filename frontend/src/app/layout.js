import './globals.css'

export const metadata = {
  title: 'SchoolMATE Student Portal',
  description: 'Your personalized learning companion',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
