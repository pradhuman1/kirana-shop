import jwt from "jsonwebtoken";

const JWT_EXPIRY = "24h";

export const generateToken = (payload: String) => {
  return jwt.sign({ businessId: payload }, process.env.JWT_SECRET as string, {
    expiresIn: JWT_EXPIRY,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};
