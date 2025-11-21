const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();
router.post("/", upload.single("media"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const type = req.file.mimetype.startsWith("video") ? "video" : "image";
  res.json({ url, mediaType: type });
});
module.exports = router;
