import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import incidentRoutes from "./routes/incident.routes.js";
import projectRoutes from "./routes/project.routes.js";

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
app.use("/api/incident", incidentRoutes);
app.use("/api/project", projectRoutes);

export default app;
