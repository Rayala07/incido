import rateLimit from "express-rate-limit"

// Keep auth endpoints conservative without affecting normal incident workflows.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
})

// Google OAuth initiation can be abused to spam redirects, so keep it separate.
export const oauthInitiationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OAuth attempts. Please try again later.",
  },
})
