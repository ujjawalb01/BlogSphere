import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import User from "../models/User.js";

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

export {
  register,
  login,
  forgotPassword,
  resetPassword
};