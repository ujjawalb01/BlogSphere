import express from "express";
import { followUser, unfollowUser } from "../controllers/followController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/:id/follow", auth, followUser);
router.post("/:id/unfollow", auth, unfollowUser);

export default router;