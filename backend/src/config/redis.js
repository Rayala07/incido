import Redis from "ioredis"

// Minimal Redis client: use env vars, no TLS, clear logging
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
  password: process.env.REDIS_PASSWORD,
})

redis.on("connect", () => {
  console.log("redis db connected")
})

redis.on("ready", () => {
  console.log("redis ready")
})

redis.on("error", (err) => {
  console.error("redis error", err)
})

export default redis
