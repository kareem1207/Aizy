import { Router } from "express";

import {
  createUser,
  getUser,
  generateUserToken,
  generateOTP,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", getUser);
router.post("/generate-token", generateUserToken);
router.get("/generate-otp", generateOTP);

export default router;
