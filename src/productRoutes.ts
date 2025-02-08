import express from "express";
import { addProduct, getAllProducts } from "./productController";

const router = express.Router();

router.post("/add-product", addProduct);

router.get("/get-all-product", getAllProducts);

export default router;
