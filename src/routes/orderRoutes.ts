import express from "express";

import { 
    generateOrder,
    getMyOrders,
    sendOrderPushNotification
} from "../controllers/OrderController"

const router = express.Router();

router.post("/generate-order", generateOrder);
router.get("/get-my-orders", getMyOrders);
router.post("/send-push-notification", sendOrderPushNotification);


export default router;


