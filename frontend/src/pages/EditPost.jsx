import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api";
import {
  BiImageAdd,
  BiX,
  BiArrowBack,
  BiCheckCircle
} from "react-icons/bi";
import Spinner from "../components/Spinner";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingMedia, setExistingMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title || "");
        setContent(res.data.content || "");

        let media = res.data.media || [];
        if (res.data.mediaUrl && media.length === 0) {
          media = [{ url: res.data.mediaUrl, type: res.data.mediaType || "image" }];
        }
        setExistingMedia(media);
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load story for editing");
        navigate("/");
      });
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (existingMedia.length + newFiles.length + selected.length > 10) {
      alert("Maximum 10 media files allowed in total.");
      return;
    }

    setNewFiles((prev) => [...prev, ...selected]);

    const previewUrls = selected.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));
    setNewPreviews((prev) => [...prev, ...previewUrls]);
  };

  const removeExistingMedia = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (newFiles.length === 0) return [];
    const fd = new FormData();
    newFiles.forEach((file) => fd.append("media", file));

    const res = await API.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // Array of { url, type }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedNewMedia = await uploadFiles();
      const finalMedia = [...existingMedia, ...uploadedNewMedia];

      await API.put(`/posts/update/${id}`, {
        title: title.trim(),
        content: content.trim(),
        media: finalMedia,
      });

      navigate(`/post/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto page-fade-in pb-20">
      
      {/* Top navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--line)] mb-8">
        <Link
          to={`/post/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--accent)] transition"
        >
          <BiArrowBack size={15} />
          <span>Cancel &amp; Return</span>
        </Link>
      </div>

      <div className="editorial-card rounded-3xl p-6 sm:p-10 shadow-card">
        <div className="mb-8">
          <span className="editorial-eyebrow mb-1.5 block">Story Editor</span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
            Edit Your Story
          </h1>
          <p className="text-xs text-[var(--ink-secondary)] mt-1">
            Refine your narrative, improve clarity, or update media assets.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
              Story Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] bg-transparent border-b border-[var(--line)] pb-3 outline-none focus:border-[var(--accent)] transition"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
              Content &amp; Narrative
            </label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Revise your story content..."
              className="w-full bg-[var(--surface-hover)] border border-[var(--line)] rounded-2xl p-4 sm:p-5 text-base sm:text-lg text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-sans transition"
            />
          </div>

          {/* Media Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                Media Attachments
              </label>
              <span className="text-[11px] text-[var(--ink-muted)] font-mono">
                {existingMedia.length + newFiles.length}/10 files
              </span>
            </div>

            {/* Existing and new preview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {/* Existing media */}
              {existingMedia.map((item, i) => (
                <div
                  key={`existing-${i}`}
                  className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-[var(--line)] group"
                >
                  {item.type === "video" ? (
                    <video src={item.url} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}

                  <button
                    type="button"
                    onClick={() => removeExistingMedia(i)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                    title="Remove media"
                  >
                    <BiX size={16} />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono bg-black/70 px-1 rounded text-[var(--ink-muted)]">
                    Saved
                  </span>
                </div>
              ))}

              {/* New draft previews */}
              {newPreviews.map((item, i) => (
                <div
                  key={`new-${i}`}
                  className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-[var(--accent)]/50 group"
                >
                  {item.type === "video" ? (
                    <video src={item.url} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}

                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                    title="Remove upload"
                  >
                    <BiX size={16} />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono bg-[var(--accent)] text-[var(--accent-ink)] px-1 rounded font-bold">
                    New
                  </span>
                </div>
              ))}

              {/* Add more button */}
              {existingMedia.length + newFiles.length < 10 && (
                <label className="relative aspect-video rounded-xl border-2 border-dashed border-[var(--line-strong)] hover:border-[var(--accent)] transition flex flex-col items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer bg-[var(--surface-raised)]/40">
                  <BiImageAdd size={22} className="mb-1" />
                  <span className="text-[11px] font-medium">Add Media</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              disabled={loading}
              className="btn-secondary-editorial text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="btn-primary-editorial text-sm py-2.5 px-6 disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
