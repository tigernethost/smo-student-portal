/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/api/admin',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/api/admin/:path*',
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
