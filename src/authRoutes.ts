import express from "express";
import { Request, Response, NextFunction } from "express";

import {
  testController,
  getAllBusiness,
  signupNew,
  verifyOtpAndCreateBusiness,
  updateBusiness,
} from "./authController";

const router = express.Router();

// Signup route
// router.post("/signup", signup);
router.post("/signup-new", signupNew);
router.get("/get-all-businesses", getAllBusiness);
router.post("/verify-otp-and-create-business", verifyOtpAndCreateBusiness);
//router.post("/update-business", updateBusiness);
// router.post(
//   "/update-business",
//   (req: Request, res: Response, next: NextFunction) => {
//     console.log("req.body", req.body);
//     res.status(200).json({ message: "Business updated" });
//   }
// );

router.post("/update-business", updateBusiness);

// Login route
//router.post("/login", login);

//test route
router.get("/test", testController);

export default router;
