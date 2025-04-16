import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Rate limiting is disabled: Redis credentials not found')
}

// Create a new ratelimiter that allows 5 requests per 5 minutes
export const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '5 m'),
      analytics: true,
    })
  : null 