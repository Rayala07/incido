import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/database.js"
import authRoutes from "./routes/auth.routes.js"
import incidentRoutes from "./routes/incident.routes.js"
import passport from "passport"
import cors from "cors"
import morgan from "morgan"
import { config } from "./config/config.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

connectDB()
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
)

// static assets
app.use("/assets", express.static(path.join(__dirname, "assets")))

// authentication routes
app.use("/api/auth", authRoutes)

// incident routes
app.use("/api/incidents", incidentRoutes)

export default app
