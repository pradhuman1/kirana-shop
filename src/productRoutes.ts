import express from "express";
import { addProduct } from "./productController";

const router = express.Router();

// Signup route
router.post("/add-product", addProduct);

export default router;
