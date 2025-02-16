import { Request, Response, NextFunction } from "express";
import connectDB from "./dbConnect";

export const dropCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collectionName } = req.body;
    const db = await connectDB();

    db.collection(collectionName).drop();
    res.send(200).json(`colllection ${collectionName} deleted successfully `);
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};
