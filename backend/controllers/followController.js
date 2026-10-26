import User from "../models/User.js";
import createNotification from "../services/notificationService.js";

const followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself"
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following"
      });
    }

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    await createNotification(
      targetUser._id,
      currentUser._id,
      "follow",
      null
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

const unfollowUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    currentUser.following =
      currentUser.following.filter(
        (id) =>
          id.toString() !== targetUser._id.toString()
      );

    targetUser.followers =
      targetUser.followers.filter(
        (id) =>
          id.toString() !== currentUser._id.toString()
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

export {
  followUser,
  unfollowUser
};