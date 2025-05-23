import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../Jwt";
import responseCode, { responseMessage } from "../utils/resonseCode";
import { findBusinessById } from "../controllers/authController";
import { IBusiness } from "../interface/business.interface";
import { AuthRequest } from "../interface/authRequest.interface";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token at auth middleware", token);
  if (!token) {
    return res.status(401).json({
      message: "No token provided",
      code: responseCode.INVALID_AUTH,
    });
  }

  try {
    const { isValid, error } = await verifyToken(token);
    if (!isValid) {
      console.log("Token validation failed:", error);
      return res.status(401).json({
        message: error || responseMessage.INVALID_AUTH,
        code: responseCode.INVALID_AUTH,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.tokenDetails = decoded as { businessId: string | number };
    const business = await findBusinessById(
      req.tokenDetails.businessId as string
    );
    req.businessDetails = business as IBusiness;

    // console.log("req.tokenDetails", req.tokenDetails);
    // console.log("req.businessDetails", req.businessDetails);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      message:
        error instanceof Error ? error.message : responseMessage.INVALID_AUTH,
      code: responseCode.INVALID_AUTH,
    });
  }
};
