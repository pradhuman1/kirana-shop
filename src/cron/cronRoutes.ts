import express from "express";

import {
    generateSearchTokens
} from "./generateSearchTokens"

const router = express.Router();

router.get("/generate-search-tokens", generateSearchTokens);

export default router;
