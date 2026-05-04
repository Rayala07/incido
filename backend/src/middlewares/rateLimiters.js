import rateLimit from "express-rate-limit"
import { default as redis } from "../config/redis.js"

// Helper to create a Redis-backed rate limiter middleware (simple token bucket using INCR/EXPIRE)
const createRedisLimiter = ({ windowMs, limit, message, keyPrefix = "rl" }) => {
  const ttlSeconds = Math.ceil(windowMs / 1000)

  return async (req, res, next) => {
    try {
      const id =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        (req.connection && req.connection.remoteAddress) ||
        "unknown"
      const key = `${keyPrefix}:${id}`

      const current = await redis.incr(key)
      if (current === 1) {
        await redis.expire(key, ttlSeconds)
      }

      const remaining = Math.max(0, limit - current)
      res.setHeader("X-RateLimit-Limit", limit)
      res.setHeader("X-RateLimit-Remaining", remaining)
      const ttl = await redis.ttl(key)
      res.setHeader("X-RateLimit-Reset", ttl)

      if (current > limit) {
        return res.status(429).json({ success: false, message })
      }

      return next()
    } catch (err) {
      console.error("Redis rate limiter error:", err)
      return next()
    }
  }
}

// Keep auth endpoints conservative without affecting normal incident workflows.
const defaultAuthConfig = {
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
}

// Google OAuth initiation can be abused to spam redirects, so keep it separate.
const defaultOauthConfig = {
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OAuth attempts. Please try again later.",
  },
}

const HAS_REDIS = !!process.env.REDIS_HOST || !!process.env.REDIS_URL

export const authLimiter = HAS_REDIS
  ? createRedisLimiter({ ...defaultAuthConfig, keyPrefix: "authLimiter" })
  : rateLimit(defaultAuthConfig)

export const oauthInitiationLimiter = HAS_REDIS
  ? createRedisLimiter({
      ...defaultOauthConfig,
      keyPrefix: "oauthInitiationLimiter",
    })
  : rateLimit(defaultOauthConfig)
