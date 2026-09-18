import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BiHeart,
  BiSolidHeart,
  BiCommentDetail,
  BiShareAlt,
  BiBookmark,
  BiSolidBookmark,
  BiLink,
  BiTrash,
  BiSend,
  BiTimeFive
} from "react-icons/bi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ShareModal from "./ShareModal";

export default function PostCard({
  post,
  onLike,
  onDelete,
  onFollow,
  onUnfollow,
  onAddComment,
  currentUser
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Normalize media
  let mediaList = post.media || [];
  if (post.mediaUrl && mediaList.length === 0) {
    mediaList = [{ url: post.mediaUrl, type: post.mediaType || "image" }];
  }

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const authorId = post.author?._id?.toString() || post.author?.toString();
  const isOwner = currentUserId && authorId && currentUserId === authorId;
  const isLiked = post.likes?.some((id) => (id?._id || id)?.toString() === currentUserId);

  const isFollowing = currentUser?.following?.some((id) => {
    const fid = typeof id === "string" ? id : id?._id?.toString() || id?.toString();
    return fid === authorId;
  });

  // Check bookmark status in localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      setIsBookmarked(saved.includes(post._id));
    } catch (e) {
      setIsBookmarked(false);
    }
  }, [post._id]);

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      let updated;
      if (saved.includes(post._id)) {
        updated = saved.filter((id) => id !== post._id);
        setIsBookmarked(false);
      } else {
        updated = [...saved, post._id];
        setIsBookmarked(true);
      }
      localStorage.setItem("bookmarked_posts", JSON.stringify(updated));
      window.dispatchEvent(new Event("bookmarksUpdated"));
    } catch (e) {
      console.error("Bookmark toggle failed", e);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post._id, commentText.trim());
    setCommentText("");
  };

  // Estimated reading time calculation
  const readingTime = Math.max(
    1,
    Math.ceil((post.content?.split(/\s+/).length || 60) / 200)
  );

  // Relative or formatted date
  const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <article className="editorial-card rounded-2xl overflow-hidden mb-6 group transition-all duration-300">
        
        {/* CARD HEADER: Author & Actions */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?._id}`} className="shrink-0">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line-strong)] ring-1 ring-[var(--line)]">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author?.name || "Author"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif font-bold text-sm text-[var(--accent)]">
                    {(post.author?.name?.charAt(0) || "U").toUpperCase()}
                  </span>
                )}
              </div>
            </Link>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${post.author?._id}`}
                  className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--accent)] transition truncate"
                >
                  {post.author?.name || "Anonymous Member"}
                </Link>
                {post.author?.username && (
                  <span className="text-xs text-[var(--ink-muted)] hidden sm:inline truncate">
                    @{post.author.username}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <BiTimeFive size={12} />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Follow Button or Delete Button */}
          <div className="flex items-center gap-2">
            {currentUser && post.author && !isOwner && (
              <button
                type="button"
                onClick={() =>
                  isFollowing ? onUnfollow(post.author._id) : onFollow(post.author._id)
                }
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isFollowing
                    ? "border border-[var(--line-strong)] text-[var(--ink-muted)] hover:border-rose-500/50 hover:text-rose-400"
                    : "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] shadow-sm"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}

            {post.canDelete && (
              <button
                type="button"
                onClick={() => onDelete(post._id)}
                className="text-[var(--ink-muted)] hover:text-rose-400 p-1.5 rounded-full hover:bg-rose-500/10 transition"
                title="Delete story"
                aria-label="Delete story"
              >
                <BiTrash size={17} />
              </button>
            )}
          </div>
        </div>

        {/* MEDIA CAROUSEL (IF PRESENT) */}
        {mediaList.length > 0 && (
          <div className="w-full bg-black/40 border-b border-[var(--line)] overflow-hidden">
            <Swiper
              modules={[Pagination, Navigation]}
              pagination={{ clickable: true }}
              navigation={mediaList.length > 1}
              className="w-full h-72 sm:h-96"
            >
              {mediaList.map((item, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center bg-black/20">
                  {item.type === "video" ? (
                    <video controls className="w-full h-full object-contain">
                      <source src={item.url} />
                    </video>
                  ) : (
                    <Link
                      to={`/post/${post._id}`}
                      className="flex h-full w-full items-center justify-center overflow-hidden"
                      aria-label={`Open ${post.title}`}
                    >
                      <img
                        src={item.url}
                        alt={`Media slide ${index + 1}`}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.015]"
                        loading="lazy"
                      />
                    </Link>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* CARD BODY: Story Title & Excerpt */}
        <div className="p-4 sm:p-6">
          <Link to={`/post/${post._id}`} className="block mb-2.5">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] leading-snug tracking-tight hover:text-[var(--accent)] transition duration-200">
              {post.title}
            </h2>
          </Link>

          {post.content && (
            <Link to={`/post/${post._id}`} className="block mb-4">
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed line-clamp-3">
                {post.content}
              </p>
            </Link>
          )}

          <div className="flex items-center justify-between pt-1">
            <Link
              to={`/post/${post._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Read full story <span>→</span>
            </Link>

            {/* Link Copied Feedback */}
            {copied && (
              <span className="text-[11px] font-mono text-[var(--accent)] bg-[var(--surface-hover)] px-2 py-0.5 rounded">
                Link copied!
              </span>
            )}
          </div>

          {/* ACTION BUTTONS BAR */}
          <div className="flex items-center justify-between border-t border-[var(--line)] mt-4 pt-3.5 text-[var(--ink-secondary)]">
            <div className="flex items-center gap-5 sm:gap-6">
              
              {/* Like Button */}
              <button
                type="button"
                onClick={() => onLike(post._id)}
                className={`flex items-center gap-1.5 text-sm transition ${
                  isLiked ? "text-rose-500 font-semibold" : "hover:text-rose-400"
                }`}
                title={isLiked ? "Unlike" : "Like story"}
              >
                {isLiked ? <BiSolidHeart size={19} /> : <BiHeart size={19} />}
                <span>{post.likes?.length || 0}</span>
              </button>

              {/* Comment Button */}
              <button
                type="button"
                onClick={() => setShowComments((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm hover:text-[var(--accent)] transition"
                title="View discussion"
              >
                <BiCommentDetail size={19} />
                <span>{post.comments?.length || 0}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1.5 text-sm hover:text-sky-400 transition"
                title="Share story"
              >
                <BiShareAlt size={19} />
              </button>
            </div>

            {/* Right: Bookmark & Copy Link */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleBookmark}
                className={`p-1.5 rounded-full hover:bg-[var(--surface-hover)] transition ${
                  isBookmarked ? "text-[var(--accent)]" : "hover:text-[var(--ink)]"
                }`}
                title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
              >
                {isBookmarked ? <BiSolidBookmark size={19} /> : <BiBookmark size={19} />}
              </button>

              <button
                type="button"
                onClick={copyLink}
                className="p-1.5 rounded-full hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
                title="Copy link"
              >
                <BiLink size={19} />
              </button>
            </div>
          </div>

          {/* INLINE COMMENT SECTION */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-[var(--line)] page-fade-in">
              {/* Comment List */}
              <div className="max-h-48 overflow-y-auto space-y-3 mb-4 pr-1">
                {post.comments?.length > 0 ? (
                  post.comments.map((c, idx) => (
                    <div
                      key={c._id || idx}
                      className="flex items-start gap-2.5 text-xs bg-[var(--surface-hover)] rounded-xl p-2.5 border border-[var(--line)]"
                    >
                      <div className="h-6 w-6 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {(c.user?.name?.charAt(0) || "U").toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[var(--ink)] mr-2">
                          {c.user?.name || "Reader"}:
                        </span>
                        <span className="text-[var(--ink-secondary)] leading-relaxed">
                          {c.text}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-[var(--ink-muted)] py-3 italic">
                    No comments yet. Be the first to join the conversation.
                  </p>
                )}
              </div>

              {/* Add Comment Input */}
              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a thoughtful comment..."
                    className="flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    className="btn-primary-editorial text-xs py-2 px-3.5"
                  >
                    <BiSend size={14} />
                    <span>Post</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-[var(--ink-muted)] text-center py-2">
                  <Link to="/login" className="text-[var(--accent)] font-medium hover:underline">
                    Sign in
                  </Link>{" "}
                  to share your thoughts.
                </p>
              )}
            </div>
          )}

        </div>
      </article>

      {/* Share Modal */}
      {isShareOpen && (
        <ShareModal post={post} onClose={() => setIsShareOpen(false)} />
      )}
    </>
  );
}
