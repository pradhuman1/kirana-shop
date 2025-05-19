import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../Jwt";
import responseCode, { responseMessage } from "../utils/resonseCode";
import { findBusinessById } from "../controllers/authController";
import { IBusiness } from "../interface/businessTypes";
interface AuthRequest extends Request {
  tokenDetails?: {
    businessId: string | number;
    // add other user fields you store in token
  };
  businessDetails?: IBusiness;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token", token);
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const isTokenValid = await verifyToken(token);
    if (!isTokenValid) {
      return res.status(401).json({
        message: responseMessage.INVALID_AUTH,
        code: responseCode.INVALID_AUTH,
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.tokenDetails = decoded as { businessId: string | number };
    const business = await findBusinessById(
      req.tokenDetails.businessId as string
    );
    req.businessDetails = business as IBusiness;

    console.log("req.tokenDetails", req.tokenDetails);
    console.log("req.businessDetails", req.businessDetails);
    next();
  } catch (error) {
    return res.status(401).json({
      message: responseMessage.INVALID_AUTH,
      code: responseCode.INVALID_AUTH,
    });
  }
};
