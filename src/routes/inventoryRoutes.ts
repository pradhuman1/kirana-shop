import express from "express";
import {
  // addInventory,
  getBusinessInventory,
  deleteInventory,
  updateInventory,
  addInventory
} from "../controllers/InventoryController";

const router = express.Router();

router.post("/add-inventory", addInventory);
router.get("/get-business-inventory", getBusinessInventory);
router.delete("/delete-inventory", deleteInventory);

// router.delete("/delete-inventory", deleteInventory);
router.put("/update-inventory", updateInventory);

export default router;
