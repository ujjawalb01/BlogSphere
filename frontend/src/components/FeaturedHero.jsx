import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiBookmark, BiSolidBookmark, BiTimeFive } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi2";

export default function FeaturedHero({ posts = [] }) {
  // Find top post with media, or first post
  const featuredPost = posts.find((p) => (p.media && p.media.length > 0) || p.mediaUrl) || posts[0];
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!featuredPost?._id) return;
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      setIsBookmarked(saved.includes(featuredPost._id));
    } catch (e) {
      setIsBookmarked(false);
    }
  }, [featuredPost?._id]);

  if (!featuredPost) return null;

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      let updated;
      if (saved.includes(featuredPost._id)) {
        updated = saved.filter((id) => id !== featuredPost._id);
        setIsBookmarked(false);
      } else {
        updated = [...saved, featuredPost._id];
        setIsBookmarked(true);
      }
      localStorage.setItem("bookmarked_posts", JSON.stringify(updated));
      window.dispatchEvent(new Event("bookmarksUpdated"));
    } catch (e) {
      console.error(e);
    }
  };

  let imageUrl = null;
  if (featuredPost.media && featuredPost.media.length > 0) {
    imageUrl = featuredPost.media[0].url;
  } else if (featuredPost.mediaUrl) {
    imageUrl = featuredPost.mediaUrl;
  }

  const readingTime = Math.max(
    1,
    Math.ceil((featuredPost.content?.split(/\s+/).length || 80) / 200)
  );

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-card transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left / Top Image Showcase (if has image) */}
        {imageUrl ? (
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] bg-black/40 overflow-hidden group">
            <Link to={`/post/${featuredPost._id}`} className="block h-full w-full">
              <img
                src={imageUrl}
                alt={featuredPost.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
            </Link>
            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-[var(--accent)] backdrop-blur-md border border-white/10">
              <HiSparkles size={14} />
              Featured Story
            </span>
          </div>
        ) : (
          <div className="lg:col-span-4 hidden lg:flex items-center justify-center p-8 bg-[var(--surface-raised)] border-r border-[var(--line)]">
            <span className="editorial-eyebrow text-sm">Editor's Pick</span>
          </div>
        )}

        {/* Right / Content Details */}
        <div className={`p-6 sm:p-8 flex flex-col justify-between ${imageUrl ? "lg:col-span-5" : "lg:col-span-12"}`}>
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="editorial-eyebrow">
                Spotlight
              </span>
              <button
                type="button"
                onClick={toggleBookmark}
                className={`p-1.5 rounded-full hover:bg-[var(--surface-hover)] transition ${
                  isBookmarked ? "text-[var(--accent)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark story"}
              >
                {isBookmarked ? <BiSolidBookmark size={18} /> : <BiBookmark size={18} />}
              </button>
            </div>

            <Link to={`/post/${featuredPost._id}`} className="block group">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] leading-tight tracking-tight mb-3 group-hover:text-[var(--accent)] transition duration-200">
                {featuredPost.title}
              </h1>
            </Link>

            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed line-clamp-3 mb-6">
              {featuredPost.content}
            </p>
          </div>

          {/* Author info & Reading Time */}
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 mt-2">
            <Link
              to={`/profile/${featuredPost.author?._id}`}
              className="flex items-center gap-2.5 group"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)]">
                {featuredPost.author?.avatar ? (
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-bold text-xs text-[var(--accent)]">
                    {(featuredPost.author?.name?.charAt(0) || "A").toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition">
                  {featuredPost.author?.name || "Writer"}
                </p>
                <p className="text-[10px] text-[var(--ink-muted)] font-mono flex items-center gap-1">
                  <BiTimeFive size={11} />
                  {readingTime} min read
                </p>
              </div>
            </Link>

            <Link
              to={`/post/${featuredPost._id}`}
              className="btn-primary-editorial text-xs py-1.5 px-3.5"
            >
              Read story
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}