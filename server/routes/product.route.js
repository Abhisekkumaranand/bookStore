import express from "express";
import { getAllProducts, getProductById } from "../controllers/product.controller.js";

const router = express.Router();

// Maps to /api/products/ and /api/products/:id
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;