import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const uploadFile = async () => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("media", file);
    const res = await API.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const submit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const uploaded = await uploadFile();
      const body = {
        title,
        content,
        mediaUrl: uploaded?.url,
        mediaType: uploaded?.mediaType,
      };
      await API.post("/posts", body);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Post failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">Create post</h2>
        <form onSubmit={submit} className="space-y-3">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Title"
            className="w-full p-3 rounded bg-white/10 text-white placeholder-white/40 border border-white/20"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="w-full p-3 rounded bg-white/10 text-white placeholder-white/40 border border-white/20"
          />

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-white"
          />

          <div className="flex justify-end">
            <button
              disabled={uploading}
              className="px-4 py-2 bg-primary text-white rounded-xl btn"
            >
              {uploading ? "Posting..." : "Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
