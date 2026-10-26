import express from "express";
import auth from "../middleware/auth.js";
import messageController from "../controllers/messageController.js";

const router = express.Router();

// Get conversations
router.get(
  "/conversations",
  auth,
  messageController.getConversations
);

// Get unread message count
router.get(
  "/unread/count",
  auth,
  messageController.getUnreadCount
);

// Get messages with a specific user
router.get(
  "/:userId",
  auth,
  messageController.getMessages
);

// Mark messages as read
router.put(
  "/read",
  auth,
  messageController.markMessagesRead
);

// Create message
router.post(
  "/",
  auth,
  messageController.createMessage
);

export default router;