import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createUser,
  getUser,
  generateOTP,
  verifyOTP,
  getUsers,
  banUser,
  unbanUser,
  getBannedUsers,
  createAdmin,
  updateProfile,
  getUserProfile,
} from "../controllers/user.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Brute-force protection for the public auth endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "test" ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later." },
});

router.post("/register", authLimiter, createUser);
router.post("/login", authLimiter, getUser);
router.post("/generate-otp", authLimiter, generateOTP);
router.post("/verify-otp", authLimiter, verifyOTP);

router.get("/profile", authMiddleware, getUserProfile);
router.post("/update-profile", authMiddleware, updateProfile);

const admin = [authMiddleware, requireRole("admin")];
router.get("/users", ...admin, getUsers);
router.post("/ban-user", ...admin, banUser);
router.post("/unban-user", ...admin, unbanUser);
router.get("/banned-users", ...admin, getBannedUsers);
router.post("/create-admin", ...admin, createAdmin);

export default router;
