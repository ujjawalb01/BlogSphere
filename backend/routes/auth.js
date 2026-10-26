import express from "express";

import {
  register,
  login,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Forgot password
router.post("/forgotpassword", forgotPassword);

// Reset password
router.put("/resetpassword/:resetToken", resetPassword);

export default router;