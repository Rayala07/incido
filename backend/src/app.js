import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

connectDB();
app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;
