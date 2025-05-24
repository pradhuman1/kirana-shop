import express from "express";

import { generateTokenApi } from "../Jwt";

const router = express.Router();

router.post("/generate-token", generateTokenApi);


export default router;