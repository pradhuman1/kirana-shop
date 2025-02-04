import { Request, Response, NextFunction } from "express";
import Business from "./Business.Model";

export const testController = (req: Request, res: Response) => {
  res.send("test controller called");
};

interface SignupBody {
  user_name: string;
  user_email: string;
  user_pass: string;
  type?: string;
  location: string;
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const {
    user_name,
    user_email,
    user_pass,
    type = "business-user",
    location,
  }: SignupBody = req.body;

  try {
    const businessExists = await Business.findOne({ email: user_email });

    if (businessExists) {
      return res.status(400).json({ message: "Business already exists" });
    }

    const business = await Business.create({
      name: user_name,
      email: user_email,
      password: user_pass,
      type: type,
      location: location,
    });

    if (business) {
      res.status(201).json({
        _id: business._id,
        name: business.name,
        email: business.email,
        // token: generateToken(user._id),
        type: type,
        success: true,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }

    next();
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong ${error}`,
    });
  }
};

/*
typescript flow
- Why is type script not trowing error for not knowing if req,will containe body or not?
- also why is type script not throwing error for not knowing if user_name is existing in body or not.

Self explination

- it would thoruw a error in general,when the parameters are passed by us,
- however it didnt throw a error because body is provided via liberary and typescript doest know it

*/
