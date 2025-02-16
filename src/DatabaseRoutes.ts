import express from "express";
import { dropCollection } from "./dbUtilsController";

const router = express.Router();

router.post("/drop-collection", dropCollection);

// router.get("/get-all-product", getAllProducts);

// router.post("/update-product", updateProduct);

// router.post("/delete-product", deleteProduct);

export default router;
