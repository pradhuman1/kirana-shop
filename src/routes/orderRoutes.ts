import express from "express";

import { 
    generateOrder,
    getMyOrders 
} from "../controllers/OrderController"

const router = express.Router();

router.post("/generate-order", generateOrder);
router.get("/get-my-orders", getMyOrders);


export default router;


