import express from "express";
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  generateProduct,
} from "./productController";

const router = express.Router();

router.post("/add-product", addProduct);

router.get("/get-all-product", getAllProducts);

router.post("/update-product", updateProduct);

router.post("/delete-product", deleteProduct);

router.post("/generate-product", generateProduct);

export default router;
