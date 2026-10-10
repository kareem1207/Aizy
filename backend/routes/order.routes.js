import { Router } from "express";
import { placeOrder, myOrders, sellerOrders } from "../controllers/order.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, placeOrder);
router.get("/mine", authMiddleware, myOrders);
router.get("/seller", authMiddleware, requireRole("seller", "admin"), sellerOrders);

export default router;
