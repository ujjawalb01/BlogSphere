const Notification = require("../models/Notification");

// GET NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "name username avatar")
      .populate("post", "title");

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// MARK READ
exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user._id, 
      read: false 
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE NOTIFICATION (Internal use)
exports.createNotification = async (recipient, sender, type, post, text) => {
    try {
        if(recipient.toString() === sender.toString()) return; // Don't notify self
        
        const newNotif = new Notification({
            recipient,
            sender,
            type,
            post,
            text
        });
        await newNotif.save();

        if (global.io) {
            global.io.to(recipient.toString()).emit("newNotification", newNotif);
        }

        return newNotif;
    } catch(err) {
        console.error("Notification Error:", err);
    }
}
