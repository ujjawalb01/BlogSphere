import Notification from "../models/Notification.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate(
        "sender",
        "name username avatar"
      )
      .populate(
        "post",
        "title"
      );

    return res.json(notifications);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const markRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false
      },
      {
        $set: {
          read: true
        }
      }
    );

    return res.json({
      message: "Marked as read"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    return res.json({
      count
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export default {
  getNotifications,
  markRead,
  getUnreadCount
};