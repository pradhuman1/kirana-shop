import express from "express";
import {
  addInventory,
  getInventory,
  deleteInventory,
} from "./InventoryController";

const router = express.Router();

router.post("/add-inventory", addInventory);

router.get("/get-inventory", getInventory);

router.delete("/delete-inventory", deleteInventory);

export default router;
