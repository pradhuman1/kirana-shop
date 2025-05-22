import express from "express";
import {addZone} from "../controllers/zoneController"

const router = express.Router();

router.post('/add-zone', addZone);

export default router;
