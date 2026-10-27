import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["register", "forgot-password"],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    resendAfter: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    resetTokenHash: {
      type: String,
      default: null,
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

otpChallengeSchema.index(
  { email: 1, purpose: 1 },
  { unique: true }
);

otpChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model(
  "OtpChallenge",
  otpChallengeSchema
);