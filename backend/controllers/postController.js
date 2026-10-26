import Post from "../models/Post.js";
import User from "../models/User.js";

import createNotification from "../services/notificationService.js";

// ===============================
// CREATE POST
// ===============================
const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      media
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const post = new Post({
      author: req.user._id,
      title,
      content,
      media: media || []
    });

    await post.save();

    // Notify followers
    const currentUser =
      await User.findById(req.user._id);

    if (currentUser) {
      await Promise.all(
        currentUser.followers.map(
          (followerId) =>
            createNotification(
              followerId,
              currentUser._id,
              "friend_post",
              post._id,
              "posted a new update"
            )
        )
      );
    }

    return res.json(post);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// GET ALL POSTS
// ===============================
const getAllPosts = async (req, res) => {
  try {
    const query = {};

    if (req.query.author) {
      query.author = req.query.author;
    }

    const posts = await Post.find(query)
      .populate(
        "author",
        "name avatar"
      )
      .populate(
        "comments.user",
        "name avatar"
      )
      .sort({
        createdAt: -1
      })
      .limit(50);

    return res.json(posts);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// GET SINGLE POST
// ===============================
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    )
      .populate(
        "author",
        "name avatar"
      )
      .populate(
        "comments.user",
        "name avatar"
      );

    if (!post) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    return res.json(post);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// UPDATE POST
// ===============================
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    if (
      post.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    const {
      title,
      content,
      media
    } = req.body;

    post.title = title || post.title;
    post.content =
      content || post.content;

    if (media !== undefined) {
      post.media = media;
    }

    await post.save();

    return res.json({
      message: "Updated",
      post
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// DELETE POST
// ===============================
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      console.log("Post not found");

      return res.status(404).json({
        message: "Not found"
      });
    }

    if (
      post.author.toString() !==
      req.user._id.toString()
    ) {
      console.log(
        "User is not the author"
      );

      return res.status(403).json({
        message:
          "Forbidden: You are not the author"
      });
    }

    await post.deleteOne();

    console.log("Post deleted");

    return res.json({
      message: "Deleted"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// LIKE / UNLIKE POST
// ===============================
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    const userId =
      req.user._id.toString();

    const alreadyLiked =
      post.likes.some(
        (id) =>
          id.toString() === userId
      );

    if (alreadyLiked) {
      post.likes =
        post.likes.filter(
          (id) =>
            id.toString() !== userId
        );
    } else {
      post.likes.push(
        req.user._id
      );

      await createNotification(
        post.author,
        req.user._id,
        "like",
        post._id
      );
    }

    await post.save();

    return res.json(post);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// ADD COMMENT
// ===============================
const addComment = async (req, res) => {
  try {
    const {
      text
    } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    post.comments.push({
      user: req.user._id,
      text
    });

    await post.save();

    await createNotification(
      post.author,
      req.user._id,
      "comment",
      post._id,
      text
    );

    const updatedPost =
      await Post.findById(
        req.params.id
      )
        .populate(
          "author",
          "name avatar"
        )
        .populate(
          "comments.user",
          "name avatar"
        );

    return res.json(updatedPost);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// DELETE COMMENT
// ===============================
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    post.comments =
      post.comments.filter(
        (comment) =>
          comment._id.toString() !==
          req.params.commentId
      );

    await post.save();

    return res.json({
      message: "Comment deleted"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// FOLLOW POST AUTHOR
// ===============================
const followAuthor = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    ).populate(
      "author"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const authorId =
      post.author._id;

    const user = await User.findById(
      req.user._id
    );

    const alreadyFollowing =
      user.following.some(
        (id) =>
          id.toString() ===
          authorId.toString()
      );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following"
      });
    }

    user.following.push(
      authorId
    );

    await user.save();

    return res.json({
      message: "Followed",
      following: user.following
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// UNFOLLOW POST AUTHOR
// ===============================
const unfollowAuthor = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    ).populate(
      "author"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const authorId =
      post.author._id;

    const user = await User.findById(
      req.user._id
    );

    user.following =
      user.following.filter(
        (id) =>
          id.toString() !==
          authorId.toString()
      );

    await user.save();

    return res.json({
      message: "Unfollowed",
      following: user.following
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// SEARCH POSTS
// ===============================
const searchPosts = async (req, res) => {
  try {
    const {
      q
    } = req.query;

    if (!q) {
      return res.json([]);
    }

    const posts = await Post.find({
      $or: [
        {
          title: {
            $regex: q,
            $options: "i"
          }
        },
        {
          content: {
            $regex: q,
            $options: "i"
          }
        }
      ]
    })
      .populate(
        "author",
        "name username avatar"
      )
      .sort({
        createdAt: -1
      });

    return res.json(posts);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export {
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
};