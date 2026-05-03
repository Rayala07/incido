import dotenv from "dotenv"
dotenv.config()

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables")
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables")
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in environment variables",
  )
}
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables")
}
if (!process.env.GOOGLE_CALLBACK_URL) {
  throw new Error("GOOGLE_CALLBACK_URL is not defined in environment variables")
}
if (!process.env.EMAIL_USER) {
  throw new Error("EMAIL_USER is not defined in environment variables")
}
if (!process.env.EMAIL_CLIENT_ID) {
  throw new Error("EMAIL_CLIENT_ID is not defined in environment variables")
}
if (!process.env.EMAIL_CLIENT_SECRET) {
  throw new Error("EMAIL_CLIENT_SECRET is not defined in environment variables")
}
if (!process.env.EMAIL_REFRESH_TOKEN) {
  throw new Error("EMAIL_REFRESH_TOKEN is not defined in environment variables")
}
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables")
}
if (!process.env.MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is not defined in environment variables")
}
if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not defined in environment variables")
}
if(!process.env.REDIS_HOST) {
  throw new Error("REDIS_HOST is not defined in environment variables")
}
if(!process.env.REDIS_PORT) {
  throw new Error("REDIS_PORT is not defined in environment variables")
}
if(!process.env.REDIS_PASSWORD) {
  throw new Error("REDIS_PASSWORD is not defined in environment variables")
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_CLIENT_ID: process.env.EMAIL_CLIENT_ID,
  EMAIL_CLIENT_SECRET: process.env.EMAIL_CLIENT_SECRET,
  EMAIL_REFRESH_TOKEN: process.env.EMAIL_REFRESH_TOKEN,
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
}
