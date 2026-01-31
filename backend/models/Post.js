const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  content: String,
  
  // Changed from single mediaUrl/mediaType to array of objects
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true }
    }
  ],

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema]

}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
