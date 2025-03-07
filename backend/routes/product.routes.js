import express from "express";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByEmail,
  getProductsByRating,
} from "../controllers/product.controller.js";

// Import the auth middleware
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/category/:category", getProductsByCategory);
router.get("/rating/:rating", getProductsByRating);

// Protected routes that require authentication
router.post("/create", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/seller/:email", getProductsByEmail);

export default router;
