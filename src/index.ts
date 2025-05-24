// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
//@todo: Check ane enable cors only for valid domains,read https://www.npmjs.com/package/cors

import cors from "cors";
import { authenticateToken } from "./middleware/authMiddleware";

import connectDB from "./dbConnect";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import zoneRoutes from "./routes/zoneRoutes";
import DatabaseRoutes from "./routes/DatabaseRoutes";
import orderRoutes from "./routes/orderRoutes"
import shopOrderRoutes from "./routes/shopOrderRoutes"
import jwtRoutes from "./routes/jwtRoutes"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

connectDB();

// Public routes (no auth required)
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.get("/healthcheck", (req: Request, res: Response) => {
  res.send("Server is up!");
});

// Auth routes - public endpoints
app.use("/",jwtRoutes);
app.use("/api/auth/login", authRoutes);
app.use("/api/auth/register", authRoutes);
app.use("/api/auth/otp", authRoutes);
app.use("/api/auth/verify-otp-and-create-business", authRoutes);
app.use("/api/public/auth", authRoutes);

// Protected routes (auth required)
// Apply authentication middleware to all API routes EXCEPT those containing /public
app.use("/api", (req, res, next) => {
  if (req.path.includes("/public")) {
    return next();
  }
  authenticateToken(req, res, next);
});

// Protected API routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/db", DatabaseRoutes);
app.use("/api/zone", zoneRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/shop-order", shopOrderRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
