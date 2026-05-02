import express from "express";
import {
  getAllUsers,
  googleCallback,
  login,
  logout,
  register,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validation/validate.js";
import passport from "../config/googleOauth.js";
import { verifyUser } from "../middlewares/verifyuser.js";

const authRoutes = express.Router();

// normal Register and Login routes
authRoutes.post("/register", registerValidator, register);
authRoutes.post("/login", loginValidator, login);
authRoutes.get("/logout", logout);
authRoutes.get("/verify-email", verifyEmail);
authRoutes.get("/users", verifyUser, getAllUsers);

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
