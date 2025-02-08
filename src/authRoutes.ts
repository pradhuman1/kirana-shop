import express from "express";
import { testController, signup, getAllBusiness } from "./authController";

const router = express.Router();

// Signup route
router.post("/signup", signup);

router.get("/get-all-businesses", getAllBusiness);

// Login route
//router.post("/login", login);

//test route
router.get("/test", testController);

export default router;
