import Notification from "../models/Notification.js";

const createNotification = async (
  recipient,
  sender,
  type,
  post = null,
  text = ""
) => {
  try {
    // Don't notify the user about their own action
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = new Notification({
      recipient,
      sender,
      type,
      post,
      text,
    });

    await notification.save();

    // Send real-time notification
    if (global.io) {
      global.io
        .to(recipient.toString())
        .emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
    return null;
  }
};

export default createNotification;