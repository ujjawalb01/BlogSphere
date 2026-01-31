exports.uploadMedia = (req, res) => {
  // If no files found, return error
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  // Map all files to their URLs and types
  const media = req.files.map(file => ({
    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    type: file.mimetype.startsWith("video") ? "video" : "image"
  }));

  res.json(media);
};
