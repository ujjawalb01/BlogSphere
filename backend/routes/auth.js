
import express from "express";

import {
  register,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

// Registration and email verification
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

// Login and logout
router.post("/login", login);
router.post("/logout", logout);

// Forgot password and OTP verification
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
