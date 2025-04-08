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

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/category/:category", getProductsByCategory);
router.get("/rating/:rating", getProductsByRating);
router.get("/image/:id", getProductImage);

router.post("/create", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/seller/:email", getProductsByEmail);

export default router;
