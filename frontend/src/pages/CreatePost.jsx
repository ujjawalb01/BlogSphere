import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { FaImage, FaVideo, FaTimes } from "react-icons/fa";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to create a post");
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 10) {
      alert("Maximum 10 files allowed");
      return;
    }
    setFiles([...files, ...selectedFiles]);

    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    const fd = new FormData();
    files.forEach(file => fd.append("media", file));
    
    const res = await API.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // Expecting array of {url, type}
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    setUploading(true);
    try {
      const uploadedMedia = await uploadFiles();
      const body = {
        title,
        content,
        media: uploadedMedia, // Array
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
    <div className="mx-auto max-w-2xl pt-3 md:pt-6">
      <div className="glass rounded-2xl p-6 md:p-8">
        <p className="eyebrow mb-3">New story</p>
        <h2 className="editorial-title mb-7 text-4xl font-semibold">Write something worth keeping.</h2>
        <form onSubmit={submit} className="space-y-6">

          <div>
             <label className="block text-gray-400 text-sm mb-2">Title</label>
             <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-field"
                placeholder="Give your post a catchy title..."
             />
          </div>

          <div>
             <label className="block text-gray-400 text-sm mb-2">Content</label>
             <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows="5"
                className="input-field resize-none"
                placeholder="Share your thoughts..."
             />
          </div>

          {/* DRAG & DROP / FILE AREA */}
          <div className="relative rounded-xl border border-dashed border-white/20 p-7 text-center hover:border-[#d9ff65]/70">
             <input
               type="file"
               multiple
               accept="image/*,video/*"
               onChange={handleFileChange}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <div className="flex flex-col items-center justify-center text-gray-400">
                <FaImage size={32} className="mb-2 text-gray-500" />
                <p>Click to upload or drag images/videos</p>
                <p className="text-xs text-gray-500 mt-1">Up to 10 files allowed</p>
             </div>
          </div>

           {/* PREVIEWS */}
           {previews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                 {previews.map((src, i) => (
                   <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow-lg">
                        <FaTimes size={10} />
                      </button>
                   </div>
                 ))}
              </div>
           )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={uploading}
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-gray-300 hover:border-white/30 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={uploading}
              className="btn-primary w-full rounded-full md:w-auto"
            >
              {uploading ? "Publishing..." : "Publish Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
