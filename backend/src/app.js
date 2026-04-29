import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";

const app = express();

connectDB();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);


// authentication routes
app.use("/api/auth", authRoutes);

export default app;
