import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Redirect /admin and /admin/* to /api/admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const destination = pathname.replace(/^\/admin/, '/api/admin')
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
