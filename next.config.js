/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_API_BASE: 'https://wingfung.vercel.app',
  },
  // EdgeOne Pages 靜態部署時啟用：STATIC_EXPORT=true npm run build
  ...(process.env.STATIC_EXPORT === 'true' && { output: 'export' }),
}

module.exports = nextConfig