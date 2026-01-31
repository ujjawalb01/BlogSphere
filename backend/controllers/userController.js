const User = require("../models/User");
const bcrypt = require("bcrypt");
const Post = require("../models/Post");

/* FOLLOW USER */
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (userId.toString() === targetId)
      return res.status(400).json({ message: "You can't follow yourself" });

    const targetUser = await User.findById(targetId);
    const me = await User.findById(userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (me.following.includes(targetId)) {
      return res.status(400).json({ message: "Already following" });
    }

    me.following.push(targetId);
    targetUser.followers.push(userId);

    await me.save();
    await targetUser.save();

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* UNFOLLOW USER */
exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    const targetUser = await User.findById(targetId);
    const me = await User.findById(userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    me.following = me.following.filter(
      (u) => u.toString() !== targetId
    );
    targetUser.followers = targetUser.followers.filter(
      (u) => u.toString() !== userId.toString()
    );

    await me.save();
    await targetUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* 🔍 SEARCH USERS */
exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim() === "") return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    }).select("name username avatar");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//user stats

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("followers following");
    if (!user) return res.status(404).json({ message: "User not found" });

    const postCount = await Post.countDocuments({ author: userId });

    res.json({
      followers: user.followers.length,
      following: user.following.length,
      posts: postCount
    });

  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: "Server error" });
  }
};


// UPDATE ACCOUNT DETAILS
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, username, email } = req.body;

    const updates = {};

    if (name) updates.name = name;
    if (username) updates.username = username;
    if (email) updates.email = email;

    // If updating username, check if taken
    if (username) {
      const exists = await User.findOne({ username });
      if (exists && exists._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // If updating email, check if taken
    if (email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.json({
      message: "Account updated",
      user: updated
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "New passwords do not match" });

    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER DETAILS
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log("GET USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// GET USER FOLLOWING
exports.getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER FOLLOWERS
exports.getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
