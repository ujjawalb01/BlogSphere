import express from "express";
import auth from "../middleware/auth.js";
import notificationController from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications
router.get(
  "/",
  auth,
  notificationController.getNotifications
);

// Get unread notification count
router.get(
  "/unread/count",
  auth,
  notificationController.getUnreadCount
);

// Mark notifications as read
router.put(
  "/read",
  auth,
  notificationController.markRead
);

export default router;