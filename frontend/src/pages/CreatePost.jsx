import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BiImageAdd,
  BiX,
  BiArrowBack,
  BiCheckCircle,
  BiInfoCircle
} from "react-icons/bi";
import API from "../api";

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
      alert("Please sign in to write a story");
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 10) {
      alert("A maximum of 10 media files can be attached per story.");
      return;
    }

    setFiles((prev) => [...prev, ...selected]);

    const newPreviewObjects = selected.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));

    setPreviews((prev) => [...prev, ...newPreviewObjects]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    const fd = new FormData();
    files.forEach((file) => fd.append("media", file));

    const res = await API.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // Array of { url, type }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please provide both a title and content for your story.");
      return;
    }

    setUploading(true);
    try {
      const uploadedMedia = await uploadFiles();
      const body = {
        title: title.trim(),
        content: content.trim(),
        media: uploadedMedia,
      };
      await API.post("/posts", body);
      navigate("/");
    } catch (err) {
      console.error("Story publish failed:", err);
      alert(err.response?.data?.message || "Failed to publish story.");
    } finally {
      setUploading(false);
    }
  };

  // Word count & reading time estimate
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="w-full max-w-3xl mx-auto page-fade-in pb-20">
      
      {/* Back button & top bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--line)] mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--accent)] transition"
        >
          <BiArrowBack size={15} />
          <span>Discard &amp; Back</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)] font-mono">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>~{estReadingTime} min read</span>
        </div>
      </div>

      {/* Writing Studio Container */}
      <div className="editorial-card rounded-3xl p-6 sm:p-10 shadow-card">
        <div className="mb-8">
          <span className="editorial-eyebrow mb-1.5 block">Publishing Studio</span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
            Write a Story
          </h1>
          <p className="text-xs text-[var(--ink-secondary)] mt-1">
            Express ideas clearly. Add imagery to give readers visual depth.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          
          {/* TITLE INPUT */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
              Story Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your story..."
              className="w-full font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] bg-transparent border-b border-[var(--line)] pb-3 outline-none focus:border-[var(--accent)] transition placeholder:text-[var(--ink-muted)] placeholder:font-serif"
            />
          </div>

          {/* CONTENT TEXTAREA */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
              Content &amp; Narrative
            </label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story... What insights, experiences, or reflections do you want to share with the world?"
              className="w-full bg-[var(--surface-hover)] border border-[var(--line)] rounded-2xl p-4 sm:p-5 text-base sm:text-lg text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-sans transition"
            />
          </div>

          {/* MEDIA UPLOAD AREA */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                Media Attachments (Photos &amp; Videos)
              </label>
              <span className="text-[11px] text-[var(--ink-muted)] font-mono">
                {files.length}/10 files
              </span>
            </div>

            {/* Dropzone */}
            <div className="relative rounded-2xl border-2 border-dashed border-[var(--line-strong)] hover:border-[var(--accent)] bg-[var(--surface-raised)]/50 p-6 sm:p-8 text-center transition cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--accent)] mb-3 group-hover:scale-105 transition">
                  <BiImageAdd size={24} />
                </div>
                <p className="font-semibold text-sm text-[var(--ink)]">
                  Click to upload photos or videos
                </p>
                <p className="text-xs text-[var(--ink-muted)] mt-1">
                  Drag and drop JPG, PNG, WEBP, or MP4 files (Max 10 files)
                </p>
              </div>
            </div>

            {/* Previews Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {previews.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-[var(--line)] group"
                  >
                    {item.type === "video" ? (
                      <video src={item.url} className="h-full w-full object-cover opacity-85" />
                    ) : (
                      <img src={item.url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                      title="Remove file"
                    >
                      <BiX size={16} />
                    </button>

                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-[var(--ink-muted)] uppercase">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PUBLISH CONTROLS */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={uploading}
              className="btn-secondary-editorial text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading || !title.trim() || !content.trim()}
              className="btn-primary-editorial text-sm py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)] border-t-transparent" />
                  Publishing Story...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BiCheckCircle size={17} />
                  Publish to BlogSphere
                </span>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
