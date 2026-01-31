const express = require("express");
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

const auth = require("../middleware/auth");

// Allow up to 10 files
router.post("/", auth, upload.array("media", 10), uploadController.uploadMedia);

module.exports = router;
