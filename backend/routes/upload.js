import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import uploadController from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/",
  auth,
  upload.array("media", 10),
  uploadController.uploadMedia
);

export default router;