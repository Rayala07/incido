import "dotenv/config"
// Initialize Redis client early so connection logs appear in server startup
import "./config/redis.js"
import express from "express"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import session from "express-session"
import MongoStore from "connect-mongo"
import { connectDB } from "./config/database.js"
import authRoutes from "./routes/auth.routes.js"
import passport from "passport"
import cors from "cors"
import morgan from "morgan"
import incidentRoutes from "./routes/incident.routes.js"
import projectRoutes from "./routes/project.routes.js"
import { config } from "./config/config.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
// Trust proxy when running behind a reverse proxy (nginx/load balancer)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1)
}

connectDB()
app.use(morgan("dev"))
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://incido-green.vercel.app",
          "https://incido.onrender.com",
        ],
      },
    },
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
)
app.use(express.json())
app.use(cookieParser())

// Session middleware for storing user role during OAuth flow
const isProductionSession = 
  process.env.NODE_ENV === "production" || 
  config.BASE_URL?.includes("onrender") || 
  config.FRONTEND_URL?.includes("vercel");

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
      secure: isProductionSession, 
      sameSite: isProductionSession ? "none" : "lax", 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
)

// static assets
app.use("/assets", express.static(path.join(__dirname, "assets")))

// Simple healthcheck for orchestration and load balancers
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, timestamp: Date.now() })
})

// authentication routes
app.use("/api/auth", authRoutes)
app.use("/api/incident", incidentRoutes)
app.use("/api/project", projectRoutes)

export default app
