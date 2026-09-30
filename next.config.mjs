/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in', // Fallback just in case
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/housing',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/equipment',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/watersports',
        destination: '/water',
        permanent: true,
      },
      {
        source: '/browse',
        destination: '/search',
        permanent: true,
      },
      {
        source: '/listings',
        destination: '/search',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
