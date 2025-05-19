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

import DatabaseRoutes from "./routes/DatabaseRoutes";

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
