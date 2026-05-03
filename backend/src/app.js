import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import incidentRoutes from "./routes/incident.routes.js";
import projectRoutes from "./routes/project.routes.js";
import { config } from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDB();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Session middleware for storing user role during OAuth flow
app.use(
  session({
    secret: process.env.SESSION_SECRET || "incident-rag-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Must be true for sameSite: 'none'
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-domain in prod
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

// static assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/incident", incidentRoutes);
app.use("/api/project", projectRoutes);

export default app;
