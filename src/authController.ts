import { Request, Response } from "express";

export const testController = (req: Request, res: Response) => {
  res.send("test controller called");
};

export const Signup = (req: Request, res: Response) => {
  const { user_name, user_email, user_pass, type = "business-user" } = req.body;
};
