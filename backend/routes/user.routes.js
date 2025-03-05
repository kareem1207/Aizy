import { Router } from "express";

import {
  createUser,
  getUser,
  generateUserToken,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", getUser);
router.post("/generate-token", generateUserToken);

export default router;
