import getFileUrl from "../utils/fileUrl.js";

const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded"
      });
    }

    const files = req.files.map((file) => ({
      url: getFileUrl(req, file.filename),

      type: file.mimetype.startsWith("video")
        ? "video"
        : "image"
    }));

    return res.json(files);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export default {
  uploadMedia
};