import express from "express";
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "./productController";

const router = express.Router();

router.post("/add-product", addProduct);

router.get("/get-all-product", getAllProducts);

router.post("/update-product", updateProduct);

router.post("/delete-product", deleteProduct);

export default router;
