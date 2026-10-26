import express from "express";
import auth from "../middleware/auth.js";

import {
  createPost,
  getAllPosts,
  searchPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  followAuthor,
  unfollowAuthor
} from "../controllers/postController.js";

const router = express.Router();

// Create post
router.post("/", auth, createPost);

// Get all posts
router.get("/", getAllPosts);

// Search posts
router.get("/search", searchPosts);

// Get single post
router.get("/:id", getPost);

// Update post
router.put("/update/:id", auth, updatePost);

// Delete post
router.delete("/:id", auth, deletePost);

// Like / unlike post
router.post("/:id/like", auth, likePost);

// Add comment
router.post("/:id/comment", auth, addComment);

// Delete comment
router.delete("/:id/comment/:commentId", auth, deleteComment);

// Follow post author
router.post("/:id/follow", auth, followAuthor);

// Unfollow post author
router.post("/:id/unfollow", auth, unfollowAuthor);

export default router;