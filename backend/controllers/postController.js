// controllers/postController.js
const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { title, content, media } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const post = new Post({
      author: req.user._id,
      title,
      content,
      media: media || [] // Expecting array of {url, type}
    });

    await post.save();
    res.json(post);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
  try {
    const { author } = req.query;
    const filter = author ? { author } : {};

    const posts = await Post.find(filter)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE POST
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar");

    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE POST
exports.updatePost = async (req, res) => {
  try {
    const { title, content, media } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    // Only author can edit
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    post.title = title || post.title;
    post.content = content || post.content;
    if (media) post.media = media;

    await post.save();
    res.json({ message: "Updated", post });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE POST
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    await post.deleteOne();
    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// LIKE / UNLIKE
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    const already = post.likes.includes(req.user._id);

    if (already) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
      // Send Notification
      const { createNotification } = require("./notificationController");
      await createNotification(post.author, req.user._id, "like", post._id);
    }

    await post.save();
    res.json(post);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    // Send Notification
    const { createNotification } = require("./notificationController");
    await createNotification(post.author, req.user._id, "comment", post._id, text);

    const updated = await Post.findById(req.params.id)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar");

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE COMMENT
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    post.comments = post.comments.filter(
      c => c._id.toString() !== req.params.commentId
    );

    await post.save();
    res.json({ message: "Comment deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// FOLLOW AUTHOR
exports.followAuthor = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const authorId = post.author._id;
    const user = await User.findById(req.user._id);

    if (user.following?.includes(authorId)) {
      return res.status(400).json({ message: "Already following" });
    }

    user.following.push(authorId);
    await user.save();

    res.json({ message: "Followed", following: user.following });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UNFOLLOW AUTHOR
exports.unfollowAuthor = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const authorId = post.author._id;
    const user = await User.findById(req.user._id);

    user.following = user.following.filter(
      f => f.toString() !== authorId.toString()
    );

    await user.save();
    res.json({ message: "Unfollowed", following: user.following });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//  SEARCH POSTS
exports.searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim() === "") return res.json([]);

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ]
    })
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
