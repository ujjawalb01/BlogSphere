
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    // Read JWT from the HTTP-only cookie.
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid authentication",
      });
    }

    // Reject JWTs issued before the user's token version changed.
    if (
      payload.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication",
      });
    }

    next(error);
  }
};

export default auth;
