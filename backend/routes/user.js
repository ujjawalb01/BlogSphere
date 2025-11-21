const express = require("express");
const auth = require("../middleware/auth");

const {
  followUser,
  unfollowUser,
  searchUsers,
  getUserStats,
  updateAccount,
  changePassword,
   getUser
} = require("../controllers/userController");

const router = express.Router();

// FOLLOW USER
router.post("/:id/follow", auth, followUser);

// UNFOLLOW USER
router.post("/:id/unfollow", auth, unfollowUser);

// SEARCH USERS
router.get("/search", searchUsers);

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
