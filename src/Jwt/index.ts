import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_EXPIRY = "24h";

export const generateToken = (payload: String) => {
  return jwt.sign({ businessId: payload }, process.env.JWT_SECRET as string, {
    expiresIn: JWT_EXPIRY,
  });
};

export const verifyToken = async (
  token: string
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return { isValid: true };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, error: "Token has expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { isValid: false, error: "Invalid token" };
    }
    return { isValid: false, error: "Token verification failed" };
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};

export const generateTokenApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { businessId } = req.body;
  const token = jwt.sign({ businessId }, process.env.JWT_SECRET as string, {
    expiresIn: JWT_EXPIRY,
  });
  console.log(token)
  return res.status(200).json({ token });
};
