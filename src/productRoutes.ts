import express from "express";
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

import {
  // addProduct,
  bulkUploadProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  generateProduct,
  searchProducts,
  searchProductByEan
} from "./productController";

const router = express.Router();

// router.post("/add-product", addProduct);
router.post('/search-product-ean', searchProductByEan);

router.post('/search-product', searchProducts);

router.post('/bulk-upload-products', upload.single('file'), bulkUploadProducts);

router.get("/get-all-product", getAllProducts);

router.post("/update-product", updateProduct);

router.post("/delete-product", deleteProduct);

router.post("/generate-product", generateProduct);


export default router;
