import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
const OTP_RESEND_DELAY_MS = 60 * 1000;

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
  await sendOTPEmail(email, otp, purpose);
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
      return res.status(400).json({
        message: "Email already exists"
      });
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
    await issueOTP(user.email, "register");

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

    return res.status(500).json({
      message: "Server error"
    });
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
    const { email } = req.body;

    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate reset token
    const resetToken =
      crypto.randomBytes(20).toString("hex");

    // Hash token before saving
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 10 minutes
    user.resetPasswordExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl =
      `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    // If SMTP configured, send email
    if (process.env.SMTP_HOST) {
      const transporter =
        nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure:
            process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: "Password Reset",
        text: `Reset your password using this link: ${resetUrl}`
      });
    } else {
      // Development fallback
      console.log(
        "Password Reset URL:",
        resetUrl
      );
    }

    return res.json({
      success: true,
      data: "Password reset link sent"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken =
      crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({
      success: true,
      data: "Password updated success"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
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
