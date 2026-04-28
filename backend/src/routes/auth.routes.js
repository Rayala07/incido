import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validation/validate.js";

const authRoutes = express.Router();

authRoutes.post("/register", registerValidator, register);
authRoutes.post("/login", loginValidator, login);
authRoutes.post("/logout", logout);
export default authRoutes;
