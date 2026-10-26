import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import {
  followUser,
  unfollowUser,
  searchUsers,
  getUserFollowers,
  getUserFollowing,
  uploadAvatar,
  uploadCover,
  getUserStats,
  updateAccount,
  changePassword,
  getUser
} from "../controllers/userController.js";

const router = express.Router();

// Follow / unfollow user
router.post("/:id/follow", auth, followUser);
router.post("/:id/unfollow", auth, unfollowUser);

// Search users
router.get("/search", searchUsers);

// Followers / following
router.get("/:id/followers", getUserFollowers);
router.get("/:id/following", getUserFollowing);

// Upload avatar
router.post(
  "/upload-avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar
);

// Upload cover
router.post(
  "/upload-cover",
  auth,
  upload.single("cover"),
  uploadCover
);

// User stats
router.get("/:id/stats", getUserStats);

// Update account
router.put("/update", auth, updateAccount);

// Change password
router.put("/change-password", auth, changePassword);

// Get user
router.get("/:id", getUser);

export default router;