import express from "express";
import { addInventory, getInventory } from "./InventoryController";

const router = express.Router();

router.post("/add-inventory", addInventory);

router.get("/get-inventory", getInventory);

export default router;
