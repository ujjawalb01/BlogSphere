import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  BiHeart,
  BiSolidHeart,
  BiCommentDetail,
  BiShareAlt,
  BiBookmark,
  BiSolidBookmark,
  BiLink,
  BiEdit,
  BiTrash,
  BiSend,
  BiTimeFive,
  BiArrowBack,
  BiDotsHorizontalRounded
} from "react-icons/bi";
import ShareModal from "../components/ShareModal";
import Spinner from "../components/Spinner";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch post data
  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => {
        setPost(res.data);
        const authorId = res.data?.author?._id;
        if (loggedUser && authorId) {
          const isFollowing = loggedUser.following?.some(
            (fid) => (typeof fid === "string" ? fid : fid?._id || fid?.toString()) === authorId.toString()
          );
          setIsFollowingAuthor(Boolean(isFollowing));
        }
      })
      .catch((err) => {
        console.error("Failed to load post:", err);
      });
  }, [id]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check bookmark status
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      setIsBookmarked(saved.includes(id));
    } catch (e) {
      setIsBookmarked(false);
    }
  }, [id]);

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
      let updated;
      if (saved.includes(id)) {
        updated = saved.filter((pid) => pid !== id);
        setIsBookmarked(false);
      } else {
        updated = [...saved, id];
        setIsBookmarked(true);
      }
      localStorage.setItem("bookmarked_posts", JSON.stringify(updated));
      window.dispatchEvent(new Event("bookmarksUpdated"));
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (!loggedUser) return alert("Please sign in to like stories");

    const prevPost = { ...post };
    const userId = loggedUser._id || loggedUser.id;

    const alreadyLiked = post.likes?.some(
      (uid) => (uid?._id || uid)?.toString() === userId?.toString()
    );

    const newLikes = alreadyLiked
      ? post.likes.filter((uid) => (uid?._id || uid)?.toString() !== userId?.toString())
      : [...(post.likes || []), userId];

    setPost({ ...post, likes: newLikes });

    try {
      await API.post(`/posts/${post._id}/like`);
    } catch (err) {
      console.error("Like failed:", err);
      setPost(prevPost);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!loggedUser) return alert("Please sign in to comment");

    try {
      await API.post(`/posts/${post._id}/comment`, { text: commentText.trim() });
      setCommentText("");
      // Refresh post to get populated comments
      const refreshRes = await API.get(`/posts/${id}`);
      setPost(refreshRes.data);
    } catch (err) {
      console.error("Comment failed:", err);
      alert("Failed to submit comment");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await API.delete(`/posts/${post._id}`);
      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleFollowAuthor = async () => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    const authorId = post.author?._id;
    if (!authorId) return;

    const currentlyFollowing = isFollowingAuthor;
    setIsFollowingAuthor(!currentlyFollowing);

    // Update localStorage user
    const currentFollowing = loggedUser.following || [];
    let updated;
    if (currentlyFollowing) {
      updated = currentFollowing.filter(
        (fid) => (typeof fid === "string" ? fid : fid?._id || fid?.toString()) !== authorId.toString()
      );
    } else {
      updated = [...currentFollowing, authorId];
    }
    localStorage.setItem("user", JSON.stringify({ ...loggedUser, following: updated }));

    try {
      if (currentlyFollowing) {
        await API.post(`/user/${authorId}/unfollow`);
      } else {
        await API.post(`/user/${authorId}/follow`);
      }
    } catch (err) {
      console.error("Follow author failed:", err);
      setIsFollowingAuthor(currentlyFollowing);
      localStorage.setItem("user", JSON.stringify(loggedUser));
    }
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner />
      </div>
    );
  }

  // Normalize media
  let mediaList = post.media || [];
  if (post.mediaUrl && mediaList.length === 0) {
    mediaList = [{ url: post.mediaUrl, type: post.mediaType || "image" }];
  }

  const isLiked = post.likes?.some(
    (uid) => (uid?._id || uid)?.toString() === (loggedUser?._id || loggedUser?.id)?.toString()
  );
  const isOwner = loggedUser && (loggedUser._id === post.author?._id || loggedUser.id === post.author?._id);

  const readingTime = Math.max(
    1,
    Math.ceil((post.content?.split(/\s+/).length || 60) / 200)
  );

  // Formatted paragraphs
  const paragraphs = (post.content || "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen pb-24 page-fade-in">
      
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 z-50 h-[3px] bg-[var(--accent)] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back to feed header link */}
      <div className="mx-auto max-w-3xl pt-2 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--accent)] transition"
        >
          <BiArrowBack size={15} />
          <span>Back to Feed</span>
        </Link>
      </div>

      <article className="mx-auto max-w-3xl">
        
        {/* EDITORIAL ARTICLE HEADER */}
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="editorial-eyebrow">Essay</span>
            <span className="text-[11px] text-[var(--ink-muted)]">•</span>
            <span className="text-xs font-mono text-[var(--ink-muted)] flex items-center gap-1">
              <BiTimeFive size={13} /> {readingTime} min read
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--ink)] leading-[1.08] tracking-tight mb-6">
            {post.title}
          </h1>

          {/* AUTHOR METADATA ROW */}
          <div className="flex items-center justify-between border-y border-[var(--line)] py-4 my-6">
            <div className="flex items-center gap-3.5">
              <Link to={`/profile/${post.author?._id}`}>
                <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line-strong)]">
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-bold text-base text-[var(--accent)]">
                      {(post.author?.name?.charAt(0) || "U").toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${post.author?._id}`}
                    className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--accent)] transition"
                  >
                    {post.author?.name || "Writer"}
                  </Link>
                  {loggedUser && !isOwner && (
                    <button
                      type="button"
                      onClick={handleToggleFollowAuthor}
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition ${
                        isFollowingAuthor
                          ? "text-[var(--ink-muted)] border border-[var(--line)] hover:text-rose-400 hover:border-rose-500/40"
                          : "text-[var(--accent)] hover:underline"
                      }`}
                    >
                      {isFollowingAuthor ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
                <p className="text-xs text-[var(--ink-muted)]">
                  Published on {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Author Edit/Delete Menu */}
            {isOwner && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-[var(--surface-hover)] text-[var(--ink-secondary)] transition"
                  title="Post actions"
                  aria-label="Story actions"
                >
                  <BiDotsHorizontalRounded size={22} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-card z-30 page-fade-in">
                    <button
                      type="button"
                      onClick={() => navigate(`/edit/${post._id}`)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-hover)] transition"
                    >
                      <BiEdit size={16} />
                      <span>Edit Story</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <BiTrash size={16} />
                      <span>Delete Story</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* FEATURED MEDIA GALLERY / SWIPER (HERO) */}
        {mediaList.length > 0 && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-[var(--line)] bg-black/40 shadow-card">
            <Swiper
              modules={[Pagination, Navigation]}
              pagination={{ clickable: true }}
              navigation={mediaList.length > 1}
              className="w-full h-80 sm:h-[440px] md:h-[500px]"
            >
              {mediaList.map((item, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center bg-black/30">
                  {item.type === "video" ? (
                    <video controls className="w-full h-full object-contain">
                      <source src={item.url} />
                    </video>
                  ) : (
                    <img
                      src={item.url}
                      alt={`Illustration ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* ARTICLE BODY */}
        <div className="font-serif text-lg sm:text-xl text-[var(--ink)] leading-[1.8] sm:leading-[1.9] space-y-6 mb-12 selection:bg-[var(--accent)]">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-justify sm:text-left">
              {i === 0 ? (
                <span className="float-left text-5xl sm:text-6xl font-serif font-bold text-[var(--ink)] mr-3 leading-none select-none">
                  {para.charAt(0)}
                </span>
              ) : null}
              {i === 0 ? para.slice(1) : para}
            </p>
          ))}
        </div>

        {/* INTERACTIVE ACTIONS BAR */}
        <div className="sticky bottom-4 z-20 my-10 flex items-center justify-between rounded-full border border-[var(--line-strong)] bg-[var(--surface)]/95 px-6 py-3 shadow-card backdrop-blur-md">
          <div className="flex items-center gap-6">
            
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-semibold transition ${
                isLiked ? "text-rose-500" : "text-[var(--ink-secondary)] hover:text-rose-400"
              }`}
            >
              {isLiked ? <BiSolidHeart size={21} /> : <BiHeart size={21} />}
              <span>{post.likes?.length || 0}</span>
            </button>

            {/* Jump to comments */}
            <button
              type="button"
              onClick={() =>
                document.getElementById("discussion")?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-2 text-sm text-[var(--ink-secondary)] hover:text-[var(--accent)] transition"
            >
              <BiCommentDetail size={21} />
              <span>{post.comments?.length || 0}</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="p-1 text-[var(--ink-secondary)] hover:text-sky-400 transition"
              title="Share story"
            >
              <BiShareAlt size={21} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Bookmark */}
            <button
              type="button"
              onClick={toggleBookmark}
              className={`p-1 transition ${
                isBookmarked ? "text-[var(--accent)]" : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Save story"}
            >
              {isBookmarked ? <BiSolidBookmark size={21} /> : <BiBookmark size={21} />}
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={copyLink}
              className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink)] transition relative"
              title="Copy link"
            >
              <BiLink size={21} />
              {copied && (
                <span className="absolute -top-7 right-0 text-[10px] font-mono bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--accent)] px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* AUTHOR PROFILE FOOTER CARD */}
        <div className="editorial-card rounded-3xl p-6 sm:p-8 my-12 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <Link to={`/profile/${post.author?._id}`} className="shrink-0">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line-strong)]">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-bold text-xl text-[var(--accent)]">
                  {(post.author?.name?.charAt(0) || "U").toUpperCase()}
                </span>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <span className="editorial-eyebrow mb-1 block">Written by</span>
            <Link
              to={`/profile/${post.author?._id}`}
              className="font-serif font-bold text-xl text-[var(--ink)] hover:text-[var(--accent)] transition"
            >
              {post.author?.name || "Author"}
            </Link>
            <p className="text-xs text-[var(--ink-muted)] mb-3">
              @{post.author?.username || "creator"}
            </p>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
              Member and writer publishing stories, essays, and ideas on BlogSphere.
            </p>

            {loggedUser && !isOwner && (
              <button
                type="button"
                onClick={handleToggleFollowAuthor}
                className="btn-secondary-editorial text-xs py-1.5 px-4"
              >
                {isFollowingAuthor ? "Following Author" : "Follow Author"}
              </button>
            )}
          </div>
        </div>

        {/* COMMENTS / DISCUSSION SECTION */}
        <section id="discussion" className="mt-14 pt-8 border-t border-[var(--line)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              Responses ({post.comments?.length || 0})
            </h2>
            <span className="text-xs text-[var(--ink-muted)] font-mono">Join the conversation</span>
          </div>

          {/* Comment Form */}
          {loggedUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-10 editorial-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-7 w-7 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold flex items-center justify-center text-xs shrink-0">
                  {(loggedUser.name?.charAt(0) || "U").toUpperCase()}
                </div>
                <span className="font-semibold text-xs text-[var(--ink)]">{loggedUser.name}</span>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts on this story?"
                rows={3}
                className="w-full bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)] resize-none"
              />

              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="btn-primary-editorial text-xs py-2 px-4 disabled:opacity-50"
                >
                  <BiSend size={15} />
                  <span>Respond</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="editorial-card rounded-2xl p-6 text-center mb-10">
              <p className="text-sm text-[var(--ink-secondary)] mb-3">
                Sign in to join the discussion and share your thoughts.
              </p>
              <Link to="/login" className="btn-primary-editorial text-xs">
                Sign in to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((c, idx) => (
                <div
                  key={c._id || idx}
                  className="editorial-card rounded-2xl p-4 sm:p-5 border border-[var(--line)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Link to={`/profile/${c.user?._id || c.user}`}>
                        <div className="h-8 w-8 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--accent)] overflow-hidden">
                          {c.user?.avatar ? (
                            <img src={c.user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            ((c.user?.name || "R").charAt(0)).toUpperCase()
                          )}
                        </div>
                      </Link>
                      <div>
                        <Link
                          to={`/profile/${c.user?._id || c.user}`}
                          className="font-semibold text-xs text-[var(--ink)] hover:text-[var(--accent)] transition"
                        >
                          {c.user?.name || "Reader"}
                        </Link>
                        <p className="text-[10px] text-[var(--ink-muted)]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--ink-secondary)] leading-relaxed pl-10">
                    {c.text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-[var(--ink-muted)] py-10 italic">
                No responses yet. Start the conversation above.
              </p>
            )}
          </div>
        </section>

      </article>

      {/* Share Modal */}
      {isShareOpen && (
        <ShareModal post={post} onClose={() => setIsShareOpen(false)} />
      )}

    </div>
  );
}
