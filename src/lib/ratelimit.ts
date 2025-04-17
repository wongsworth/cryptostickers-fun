import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// For development, we'll use a simple rate limiter without Redis
export const ratelimit = null 