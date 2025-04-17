/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ailnqkgrqmhchagcgprc.supabase.co'],
  },
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ]
  },
}

export default nextConfig 