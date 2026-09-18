import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiBookmark, BiTrash, BiTimeFive, BiCompass } from "react-icons/bi";
import API from "../api";
import Spinner from "../components/Spinner";

export default function Bookmarks() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const savedIds = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      if (savedIds.length === 0) {
        setBookmarkedPosts([]);
        setLoading(false);
        return;
      }

      const res = await API.get("/posts");
      const matched = (res.data || []).filter((p) => savedIds.includes(p._id));
      setBookmarkedPosts(matched);
    } catch (err) {
      console.error("Failed to load bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();

    const handleUpdate = () => loadBookmarks();
    window.addEventListener("bookmarksUpdated", handleUpdate);
    return () => window.removeEventListener("bookmarksUpdated", handleUpdate);
  }, []);

  const removeBookmark = (id) => {
    try {
      const savedIds = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      const updated = savedIds.filter((item) => item !== id);
      localStorage.setItem("bookmarked_posts", JSON.stringify(updated));
      setBookmarkedPosts((prev) => prev.filter((p) => p._id !== id));
      window.dispatchEvent(new Event("bookmarksUpdated"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full page-fade-in pb-12">
      <div className="mb-8 border-b border-[var(--line)] pb-6">
        <span className="editorial-eyebrow mb-1.5 block">Personal Library</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--ink)] tracking-tight">
          Saved Stories
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)] max-w-xl leading-relaxed">
          Articles and reflections you have saved for quiet reading and future inspiration.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : bookmarkedPosts.length === 0 ? (
        <div className="editorial-card rounded-3xl p-12 sm:p-16 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-2xl text-[var(--accent)] mb-4">
            <BiBookmark size={26} />
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] mb-2">
            Your reading list is empty
          </h3>
          <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
            Whenever you come across a story you love, tap the bookmark icon on any card to save it here for later.
          </p>
          <Link to="/explore" className="btn-primary-editorial text-xs">
            <BiCompass size={16} />
            <span>Discover Stories</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedPosts.map((post) => {
            const readingTime = Math.max(
              1,
              Math.ceil((post.content?.split(/\s+/).length || 60) / 200)
            );

            return (
              <article
                key={post._id}
                className="editorial-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)] mb-1.5">
                    <span className="font-semibold text-[var(--ink)]">
                      {post.author?.name || "Writer"}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono flex items-center gap-1">
                      <BiTimeFive size={11} /> {readingTime} min
                    </span>
                  </div>

                  <Link to={`/post/${post._id}`} className="block">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--ink)] group-hover:text-[var(--accent)] transition truncate">
                      {post.title}
                    </h3>
                  </Link>

                  {post.content && (
                    <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 mt-1 leading-relaxed">
                      {post.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--line)]">
                  <Link
                    to={`/post/${post._id}`}
                    className="btn-primary-editorial text-xs py-1.5 px-3.5"
                  >
                    Read
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeBookmark(post._id)}
                    className="p-2 rounded-full border border-[var(--line)] text-[var(--ink-muted)] hover:text-rose-400 hover:border-rose-500/40 transition"
                    title="Remove from saved"
                    aria-label="Remove bookmark"
                  >
                    <BiTrash size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
