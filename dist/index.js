"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
//@todo: Check ane enable cors only for valid domains,read https://www.npmjs.com/package/cors
const cors_1 = __importDefault(require("cors"));
const dbConnect_1 = __importDefault(require("./dbConnect"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const productRoutes_1 = __importDefault(require("./productRoutes"));
const inventoryRoutes_1 = __importDefault(require("./inventoryRoutes"));
const DatabaseRoutes_1 = __importDefault(require("./DatabaseRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, dbConnect_1.default)();
// Public routes (no auth required)
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.get("/healthcheck", (req, res) => {
    res.send("Server is up!");
});
// Auth routes - public endpoints
app.use("/api/auth/login", authRoutes_1.default);
app.use("/api/auth/register", authRoutes_1.default);
app.use("/api/auth/otp", authRoutes_1.default);
app.use("/api/auth/verify-otp-and-create-business", authRoutes_1.default);
app.use("/api/public", authRoutes_1.default);
// Protected routes (auth required)
//  app.use("/api/auth/*", authenticateToken); // Protect auth routes
// app.use("/api/*", authenticateToken); // Protect all API routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/product", productRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
app.use("/api/db", DatabaseRoutes_1.default);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
