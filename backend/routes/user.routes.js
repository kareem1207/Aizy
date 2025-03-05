import { Router } from "express";

import { createUser, getUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", createUser);
router.get("/login", getUser);

export default router;
