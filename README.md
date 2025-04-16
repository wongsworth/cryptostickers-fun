# CryptoStickers.Fun

A modern, responsive image gallery for crypto stickers built with Next.js, Supabase, and Vercel.

## Features

- Responsive grid layout that adapts to screen size
- Image modal with download functionality
- Tag-based filtering system
- Admin dashboard for image and tag management
- Secure authentication
- Rate limiting for login attempts
- Mobile and desktop optimized

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel
- **Rate Limiting**: Upstash Redis (optional)

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_vercel_domain

# Optional (for rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## Local Development

1. Clone the repository
```bash
git clone <repository-url>
cd crypto-sticker-library
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file with your environment variables

4. Run the development server
```bash
npm run dev
```

## Deployment

1. Push your code to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Connect your GitHub repository to Vercel

3. Add environment variables in Vercel dashboard

4. Deploy!

## Post-Deployment Checklist

1. Verify environment variables in Vercel
2. Test public features (image display, filtering, downloads)
3. Test admin features (login, upload, tag management)
4. Check mobile responsiveness
5. Monitor error logs

## Security Features

- Protected admin routes
- Rate limiting on login attempts
- Secure file upload validation
- Content Security Policy headers
- CORS configuration
- Row Level Security in Supabase

## License

MIT 