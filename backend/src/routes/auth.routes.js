import express from "express";
import {
  googleCallback,
  login,
  logout,
  register,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validation/validate.js";
import passport from "../config/googleOauth.js";

const authRoutes = express.Router();

// normal Register and Login routes
authRoutes.post("/register", registerValidator, register);
authRoutes.post("/login", loginValidator, login);
authRoutes.post("/logout", logout);
authRoutes.get("/verify-email", verifyEmail);

// Google OAuth Register routes
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  googleCallback,
);

export default authRoutes;
