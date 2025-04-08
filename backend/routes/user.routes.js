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
  createAdmin,
  updateProfile,
  getUserProfile,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", getUser);
router.post("/generate-token", generateUserToken);
router.get("/generate-otp", generateOTP);

router.get("/users", authMiddleware, getUsers);
router.post("/ban-user", authMiddleware, banUser);
router.post("/unban-user", authMiddleware, unbanUser);
router.get("/banned-users", authMiddleware, getBannedUsers);
router.post("/create-admin", authMiddleware, createAdmin);

router.get("/profile", authMiddleware, getUserProfile);
router.post("/update-profile", authMiddleware, updateProfile);

export default router;
