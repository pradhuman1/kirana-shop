// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
//@todo: Check ane enable cors only for valid domains,read https://www.npmjs.com/package/cors

import cors from "cors";
import { authenticateToken } from "./middleware/authMiddleware";

import connectDB from "./dbConnect";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import inventoryRoutes from "./inventoryRoutes";

import DatabaseRoutes from "./DatabaseRoutes";
import CronRoutes from "./cron/cronRoutes";

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
app.use("/api/auth/login", authRoutes);
app.use("/api/auth/register", authRoutes);
app.use("/api/auth/otp", authRoutes);
app.use("/api/auth/verify-otp-and-create-business", authRoutes);
app.use("/api/public", authRoutes);

// Protected routes (auth required)
//  app.use("/api/auth/*", authenticateToken); // Protect auth routes
app.use("/api/*", authenticateToken); // Protect all API routes

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/db", DatabaseRoutes);
app.use("/api/cron", CronRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
