import { IBusiness } from "./business.interface"
import { Request } from "express";

export interface AuthRequest extends Request {
  tokenDetails?: {
    businessId: string | number;
  };
  businessDetails?: IBusiness;
}