import { Router } from "express";

import {
  createUser,
  getUser,
  generateUserToken,
  generateOTP,
  getUsers,
  banUser,
  unbanUser,
  getBannedUsers,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", getUser);
router.post("/generate-token", generateUserToken);
router.get("/generate-otp", generateOTP);

// Admin routes (protected with auth middleware)
router.get("/users", authMiddleware, getUsers);
router.post("/ban-user", authMiddleware, banUser);
router.post("/unban-user", authMiddleware, unbanUser);
router.get("/banned-users", authMiddleware, getBannedUsers);

export default router;
