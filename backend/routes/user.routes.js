import { Router } from "express";

import { createUser, getUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", getUser);

export default router;
