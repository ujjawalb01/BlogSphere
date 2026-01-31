const express = require("express");
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.get("/", auth, notificationController.getNotifications);
router.put("/read", auth, notificationController.markRead);

module.exports = router;
