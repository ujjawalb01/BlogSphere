import bcrypt from "bcrypt";

import User from "../models/User.js";
import Post from "../models/Post.js";

import createNotification from "../services/notificationService.js";
import getFileUrl from "../utils/fileUrl.js";

// ===============================
// FOLLOW USER
// ===============================
const followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(
      req.params.id
    );

    const currentUser = await User.findById(
      req.user._id
    );

    if (
      req.params.id ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "You can't follow yourself"
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const alreadyFollowing =
      currentUser.following.some(
        (id) =>
          id.toString() ===
          targetUser._id.toString()
      );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following"
      });
    }

    currentUser.following.push(
      targetUser._id
    );

    targetUser.followers.push(
      currentUser._id
    );

    await currentUser.save();
    await targetUser.save();

    await createNotification(
      targetUser._id,
      currentUser._id,
      "follow",
      null,
      ""
    );

    return res.json({
      message: "Followed successfully"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// UNFOLLOW USER
// ===============================
const unfollowUser = async (req, res) => {
  try {
    const targetUser = await User.findById(
      req.params.id
    );

    const currentUser = await User.findById(
      req.user._id
    );

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    currentUser.following =
      currentUser.following.filter(
        (id) =>
          id.toString() !==
          targetUser._id.toString()
      );

    targetUser.followers =
      targetUser.followers.filter(
        (id) =>
          id.toString() !==
          currentUser._id.toString()
      );

    await currentUser.save();
    await targetUser.save();

    return res.json({
      message: "Unfollowed successfully"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// SEARCH USERS
// ===============================
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        {
          username: {
            $regex: q,
            $options: "i"
          }
        },
        {
          name: {
            $regex: q,
            $options: "i"
          }
        }
      ]
    }).select(
      "name username avatar"
    );

    return res.json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// GET USER STATS
// ===============================
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const postCount =
      await Post.countDocuments({
        author: req.params.id
      });

    return res.json({
      followers: user.followers.length,
      following: user.following.length,
      posts: postCount
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// UPDATE ACCOUNT
// ===============================
const updateAccount = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      avatar,
      coverImage
    } = req.body;

    const updates = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (username !== undefined) {
      updates.username = username;
    }

    if (email !== undefined) {
      updates.email = email;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (coverImage !== undefined) {
      updates.coverImage = coverImage;
    }

    // Check username
    if (username) {
      const existingUsername =
        await User.findOne({
          username,
          _id: {
            $ne: req.user._id
          }
        });

      if (existingUsername) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }
    }

    // Check email
    if (email) {
      const existingEmail =
        await User.findOne({
          email,
          _id: {
            $ne: req.user._id
          }
        });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }
    }

    const updated =
      await User.findByIdAndUpdate(
        req.user._id,
        updates,
        {
          new: true
        }
      ).select("-password");

    return res.json({
      message: "Account updated",
      user: updated
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// UPLOAD AVATAR
// ===============================
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const avatarUrl = getFileUrl(
      req,
      req.file.filename
    );

    const user =
      await User.findByIdAndUpdate(
        req.user._id,
        {
          avatar: avatarUrl
        },
        {
          new: true
        }
      ).select("-password");

    return res.json({
      message: "Avatar updated",
      user
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// UPLOAD COVER
// ===============================
const uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const coverUrl = getFileUrl(
      req,
      req.file.filename
    );

    const user =
      await User.findByIdAndUpdate(
        req.user._id,
        {
          coverImage: coverUrl
        },
        {
          new: true
        }
      ).select("-password");

    return res.json({
      message: "Cover image updated",
      user
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password = hashedPassword;

    await user.save();

    return res.json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// GET USER
// ===============================
const getUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// GET FOLLOWING
// ===============================
const getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).populate(
      "following",
      "name username avatar"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.json(user.following);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ===============================
// GET FOLLOWERS
// ===============================
const getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).populate(
      "followers",
      "name username avatar"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.json(user.followers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export {
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
};