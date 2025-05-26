import express from "express";

import { 
  getMyShopOrders,
  updateShopOrderStatus 
} from "../controllers/ShopOrderController"

const router = express.Router();

router.put("/update-order-status", updateShopOrderStatus);
router.get("/get-my-orders", getMyShopOrders);


export default router;


