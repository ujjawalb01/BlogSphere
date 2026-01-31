const express = require("express");
const auth = require("../middleware/auth");

const {
  followUser,
  unfollowUser,
  searchUsers,
  getUserStats,
  updateAccount,
  changePassword,
  getUser,
  getUserFollowing,
  getUserFollowers
} = require("../controllers/userController");

const router = express.Router();

// FOLLOW USER
router.post("/:id/follow", auth, followUser);

// UNFOLLOW USER
router.post("/:id/unfollow", auth, unfollowUser);

// SEARCH USERS
router.get("/search", searchUsers);

// GET FOLLOWERS/FOLLOWING
router.get("/:id/followers", getUserFollowers);
router.get("/:id/following", getUserFollowing);

module.exports = router;

// User Stats
router.get("/:id/stats", getUserStats);

// UPDATE ACCOUNT
router.put("/update", auth, updateAccount);

// CHANGE PASSWORD
router.put("/change-password", auth, changePassword);
// User DEtals
router.get("/:id", getUser);
router.get("/:id/stats", getUserStats);
