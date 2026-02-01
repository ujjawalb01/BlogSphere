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
    <div className="max-w-2xl mx-auto pt-10">
      <div className="glass rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Create New Post</h2>
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
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors relative">
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

          <div className="flex justify-end">
            <button
              disabled={uploading}
              className="btn-primary w-full md:w-auto"
            >
              {uploading ? "Publishing..." : "Publish Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
