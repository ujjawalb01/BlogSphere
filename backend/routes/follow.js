const express = require("express");
const auth = require("../middleware/auth");
const { followUser, unfollowUser } = require("../controllers/followController");

const router = express.Router();

router.post("/:id/follow", auth, followUser);
router.post("/:id/unfollow", auth, unfollowUser);

module.exports = router;
