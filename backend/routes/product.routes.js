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
  getProductImage,
} from "../controllers/product.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
const seller = [authMiddleware, requireRole("seller", "admin")];

router.get("/", getProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/rating/:rating", getProductsByRating);
router.get("/seller/:email", getProductsByEmail);
router.get("/image/:id", getProductImage);
router.get("/:id", getProductById);

router.post("/create", ...seller, addProduct);
router.put("/:id", ...seller, updateProduct);
router.delete("/:id", ...seller, deleteProduct);

export default router;
