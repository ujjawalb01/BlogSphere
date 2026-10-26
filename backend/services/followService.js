import User from "../models/User.js";
import createNotification from "./notificationService.js";

const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    const error = new Error("You cannot follow yourself");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.following.includes(targetUser._id)) {
    const error = new Error("Already following");
    error.statusCode = 400;
    throw error;
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

  return {
    message: "Followed successfully",
  };
};

const unfollowUser = async (currentUserId, targetUserId) => {
  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUser._id.toString()
  );

  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== currentUser._id.toString()
  );

  await currentUser.save();
  await targetUser.save();

  return {
    message: "Unfollowed successfully",
  };
};

export { followUser, unfollowUser };