import {
  addProduct,
  getProductById,
  getProducts,
} from "../controllers/product.controller.js";
import { Router } from "express";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Change from "/upload" to "/create" to avoid conflict with "/:id" parameter route
router.post("/create", upload.single("image"), addProduct);
router.get("/", getProducts);

router.get("/:id", getProductById);

export default router;
