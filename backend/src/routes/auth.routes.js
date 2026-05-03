import express from "express"
import {
  getAllUsers,
  googleCallback,
  login,
  logout,
  register,
  verifyEmail,
  getMe,
} from "../controllers/auth.controller.js"
import { loginValidator, registerValidator } from "../validation/validate.js"
import passport from "../config/googleOauth.js"
import { verifyUser } from "../middlewares/verifyuser.js"
import { config } from "../config/config.js"

const authRoutes = express.Router()

// normal Register and Login routes
authRoutes.post("/register", registerValidator, register)
authRoutes.post("/login", loginValidator, login)
authRoutes.get("/logout", logout)
authRoutes.get("/verify-email", verifyEmail)
authRoutes.get("/users", verifyUser, getAllUsers)
authRoutes.get("/me", verifyUser, getMe)

// Google OAuth - Initiate login with role parameter
// Frontend calls: /api/auth/google?role=admin or /api/auth/google?role=member
authRoutes.get("/google", (req, res, next) => {
  // Extract role from query params (default to 'member' if not provided)
  const role = req.query.role || "member"

  // Store role in session so we can access it in the callback
  // This survives the redirect to Google and back
  req.session.userRole = role

  // Proceed with Google OAuth
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next)
})

// Google OAuth - Callback after user authenticates with Google
// Google redirects here after user grants permission
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.FRONTEND_URL}/login`,
  }),
  googleCallback,
)

export default authRoutes
