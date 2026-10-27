import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import OtpChallenge from "../models/OtpChallenge.js";
import { sendOTPEmail } from "../services/emailService.js";
import {
  generateOTP,
  hashOTP,
  generateResetToken,
  hashToken,
  safeCompare,
} from "../utils/security.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_DELAY_MS = 30 * 1000;

const issueOTP = async (email, purpose) => {
  const otp = generateOTP();
  const now = Date.now();
  await OtpChallenge.findOneAndUpdate(
    { email, purpose },
    { $set: {
      otpHash: hashOTP(otp),
      expiresAt: new Date(now + OTP_TTL_MS),
      resendAfter: new Date(now + OTP_RESEND_DELAY_MS),
      attempts: 0,
      verifiedAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  try {
    await sendOTPEmail(email, otp, purpose);
  } catch (error) {
    await OtpChallenge.deleteOne({ email, purpose, otpHash: hashOTP(otp) });
    throw error;
  }
};

const sendEmailFailure = (res, error, accountCreated = false) => {
  const missingConfig = error.code === "EMAIL_CONFIG_MISSING";
  return res.status(503).json({
    message: missingConfig
      ? "The server email service is not configured. Add EMAIL_USER and EMAIL_PASS, then send the code again."
      : "The verification email could not be sent. Check the server email settings and try again.",
    ...(accountCreated ? { accountCreated: true } : {}),
  });
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const createSessionToken = (user) => jwt.sign(
  { id: user._id, tokenVersion: user.tokenVersion },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// ===============================
// REGISTER
// ===============================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check email
    const existingEmail = await User.findOne({
      email
    });

    if (existingEmail) {
      if (existingEmail.isVerified) {
        return res.status(400).json({ message: "Email already exists" });
      }

      try {
        await issueOTP(existingEmail.email, "register");
        return res.status(200).json({
          accountCreated: true,
          message: "A new verification code was sent to your email.",
        });
      } catch (error) {
        console.error("Registration OTP delivery failed:", error);
        if (error.code === "EMAIL_CONFIG_MISSING" || error.code === "EMAIL_DELIVERY_FAILED") {
          return sendEmailFailure(res, error, true);
        }
        throw error;
      }
    }

    // Check username
    const existingUsername =
      await User.findOne({
        username
      });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword
    });

    await user.save();

    try {
      await issueOTP(user.email, "register");
    } catch (error) {
      console.error("Registration OTP delivery failed:", error);
      if (error.code === "EMAIL_CONFIG_MISSING" || error.code === "EMAIL_DELIVERY_FAILED") {
        return sendEmailFailure(res, error, true);
      }
      throw error;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error(error);
    if (error.code === "EMAIL_CONFIG_MISSING" || error.code === "EMAIL_DELIVERY_FAILED") {
      return sendEmailFailure(res, error);
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// LOGIN
// ===============================
const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // First try email
    let user = await User.findOne({
      email
    });

    // If not found, try username
    if (!user) {
      user = await User.findOne({
        username: email
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await issueOTP(email, "forgot-password");
    return res.json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    console.error(error);
    if (error.code === "EMAIL_CONFIG_MISSING" || error.code === "EMAIL_DELIVERY_FAILED") {
      return sendEmailFailure(res, error);
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {
    const { password, resetToken } = req.body;
    if (!password || !resetToken) {
      return res.status(400).json({ success: false, message: "Password and reset token are required" });
    }

    const challenge = await OtpChallenge.findOne({
      purpose: "forgot-password",
      resetTokenHash: hashToken(resetToken),
      verifiedAt: { $ne: null },
      resetTokenExpiresAt: { $gt: new Date() },
    });
    if (!challenge) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const user = await User.findOne({ email: challenge.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.tokenVersion += 1;
    await user.save();
    await OtpChallenge.deleteOne({ _id: challenge._id });

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "");
    const challenge = await OtpChallenge.findOne({ email, purpose: "register" });
    if (!challenge || challenge.expiresAt <= Date.now() || challenge.attempts >= 5) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }
    if (!safeCompare(challenge.otpHash, hashOTP(otp))) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    await OtpChallenge.deleteOne({ _id: challenge._id });
    const token = createSessionToken(user);
    setAuthCookie(res, token);
    return res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email }, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const purpose = req.body.purpose === "forgot-password" ? "forgot-password" : "register";
    const user = await User.findOne({ email });
    if (!user || (purpose === "register" && user.isVerified)) {
      return res.status(404).json({ message: "User not found" });
    }
    const previous = await OtpChallenge.findOne({ email, purpose });
    if (previous && previous.resendAfter > Date.now()) {
      return res.status(429).json({ message: "Please wait before requesting another code" });
    }
    await issueOTP(email, purpose);
    return res.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    console.error(error);
    if (error.code === "EMAIL_CONFIG_MISSING" || error.code === "EMAIL_DELIVERY_FAILED") {
      return sendEmailFailure(res, error);
    }
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "");
    const challenge = await OtpChallenge.findOne({ email, purpose: "forgot-password" });
    if (!challenge || challenge.expiresAt <= Date.now() || challenge.attempts >= 5) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }
    if (!safeCompare(challenge.otpHash, hashOTP(otp))) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }
    const resetToken = generateResetToken();
    challenge.verifiedAt = new Date();
    challenge.resetTokenHash = hashToken(resetToken);
    challenge.resetTokenExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await challenge.save();
    return res.json({ success: true, resetToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out" });
};

export {
  register,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
};
