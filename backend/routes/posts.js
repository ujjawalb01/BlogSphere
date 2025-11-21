const express = require("express");
const auth = require("../middleware/auth");

const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  followAuthor,
  unfollowAuthor,
  searchPosts,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", auth, createPost);
router.get("/", getAllPosts);
router.get("/search", searchPosts); 
router.get("/:id", getPost);

router.put("/update/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

router.post("/:id/like", auth, likePost);
router.post("/:id/comment", auth, addComment);
router.delete("/:id/comment/:commentId", auth, deleteComment);

router.post("/:id/follow", auth, followAuthor);
router.post("/:id/unfollow", auth, unfollowAuthor);

module.exports = router;
