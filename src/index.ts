// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
//@todo: Check ane enable cors only for valid domains,read https://www.npmjs.com/package/cors

// import cors from "cors";

import connectDB from "./dbConnect";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import inventoryRoutes from "./inventoryRoutes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());
// app.use(cors());

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/healthcheck", (req: Request, res: Response) => {
  res.send("Express Server is up!");
});

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/inventory", inventoryRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
