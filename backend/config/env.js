import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// "memory" keeps everything in process memory (no databases needed: demos, tests, quick local runs).
// "db" uses MongoDB for products/orders and MySQL (Prisma) for users.
const dataMode = (process.env.DATA_MODE || (isTest ? "memory" : "db")).toLowerCase();

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) throw new Error("JWT_SECRET must be set in production");
  jwtSecret = crypto.randomBytes(32).toString("hex");
  if (!isTest) console.warn("JWT_SECRET is not set: using a random secret, so logins reset on every restart.");
}

export const env = {
  isProd,
  isTest,
  dataMode: dataMode === "memory" ? "memory" : "db",
  port: Number(process.env.PORT) || 5000,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  mongoUrl: process.env.MONGO_URL,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  resendApiKey: process.env.RESEND_API_KEY,
  mailFrom: process.env.MAIL_FROM || "Aizy <onboarding@resend.dev>",
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  seedDemo: process.env.SEED_DEMO === "1",
};
