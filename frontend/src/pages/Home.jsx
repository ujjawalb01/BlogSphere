import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BiCompass, BiTrendingUp, BiUserCheck, BiPlus } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi2";
import API from "../api";
import PostCard from "../components/PostCard";
import FeaturedHero from "../components/FeaturedHero";
import Spinner from "../components/Spinner";

export default function Home({ onPostsLoaded }) {
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("forYou"); // 'forYou' | 'following' | 'trending'

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch all posts from existing API
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      const currentUserId = user?._id || user?.id;

      const data = (res.data || []).map((p) => {
        const authorId = p.author?._id || p.author?.id || p.author;
        return {
          ...p,
          canDelete: Boolean(user && authorId && authorId.toString() === currentUserId?.toString()),
          isFollowing: Boolean(
            user?.following?.some((id) => {
              const fid = typeof id === "string" ? id : id?._id || id?.toString();
              return fid === authorId?.toString();
            })
          ),
        };
      });

      setPosts(data);
      if (onPostsLoaded) onPostsLoaded(data);
    } catch (err) {
      console.error("Fetch Posts Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (user) refreshUser();
  }, []);

  // Update user in local storage to keep "following" list fresh
  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await API.get(`/user/${user._id || user.id}`);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    if (!user) return alert("Please sign in to like stories");

    const userId = user._id || user.id;
    const prevPosts = posts;

    // Optimistic Update
    setPosts(
      prevPosts.map((p) => {
        if (p._id === id) {
          const alreadyLiked = p.likes?.some(
            (uid) => (uid?._id || uid)?.toString() === userId?.toString()
          );
          const newLikes = alreadyLiked
            ? p.likes.filter((uid) => (uid?._id || uid)?.toString() !== userId?.toString())
            : [...(p.likes || []), userId];
          return { ...p, likes: newLikes };
        }
        return p;
      })
    );

    try {
      await API.post(`/posts/${id}/like`);
    } catch (err) {
      console.error("Like Error:", err);
      setPosts(prevPosts);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await API.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error("Delete Error:", err);
      const msg = err.response?.data?.message || "Failed to delete";
      alert(msg);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      await API.post(`/posts/${postId}/comment`, { text });
      fetchPosts();
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  const handleFollow = async (authorId) => {
    const prevPosts = posts;
    const prevUser = user;

    setPosts(
      posts.map((p) =>
        p.author?._id === authorId ? { ...p, isFollowing: true } : p
      )
    );

    if (user) {
      const updatedUser = {
        ...user,
        following: [...(user.following || []), authorId],
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    try {
      await API.post(`/user/${authorId}/follow`);
    } catch (err) {
      console.error("Follow error:", err);
      setPosts(prevPosts);
      if (prevUser) localStorage.setItem("user", JSON.stringify(prevUser));
    }
  };

  const handleUnfollow = async (authorId) => {
    const prevPosts = posts;
    const prevUser = user;

    setPosts(
      posts.map((p) =>
        p.author?._id === authorId ? { ...p, isFollowing: false } : p
      )
    );

    if (user) {
      const updatedUser = {
        ...user,
        following: (user.following || []).filter(
          (id) => (typeof id === "string" ? id : id?._id || id?.toString()) !== authorId
        ),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    try {
      await API.post(`/user/${authorId}/unfollow`);
    } catch (err) {
      console.error("Unfollow error:", err);
      setPosts(prevPosts);
      if (prevUser) localStorage.setItem("user", JSON.stringify(prevUser));
    }
  };

  // Filter and sort posts by active tab
  const displayedPosts = useMemo(() => {
    if (!posts) return [];

    if (activeTab === "following") {
      if (!user) return [];
      return posts.filter((p) => {
        const aid = p.author?._id || p.author?.id || p.author;
        return user.following?.some(
          (id) => (typeof id === "string" ? id : id?._id || id?.toString()) === aid?.toString()
        );
      });
    }

    if (activeTab === "trending") {
      return [...posts].sort((a, b) => {
        const scoreA = (a.likes?.length || 0) * 2 + (a.comments?.length || 0);
        const scoreB = (b.likes?.length || 0) * 2 + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    }

    // Default: For You (all posts by createdAt)
    return posts;
  }, [posts, activeTab, user]);

  return (
    <div className="w-full page-fade-in">
      
      {/* Editorial Header & Welcome */}
      <div className="mb-6 sm:mb-8 border-b border-[var(--line)] pb-5 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="editorial-eyebrow mb-1.5 block">
              The Daily Edition
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--ink)] tracking-tight">
              Stories &amp; Perspective
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-secondary)] max-w-xl leading-relaxed">
              Explore thoughtful essays, visual narratives, and insights published by creative thinkers.
            </p>
          </div>

          <Link
            to="/create"
            className="sm:hidden btn-primary-editorial text-xs py-2 w-full justify-center"
          >
            <BiPlus size={16} />
            <span>Write a Story</span>
          </Link>
        </div>

        {/* FEED TABS */}
        <div className="flex items-center gap-1 sm:gap-2 mt-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("forYou")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeTab === "forYou"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <HiSparkles size={15} />
            <span>For You</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeTab === "following"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <BiUserCheck size={15} />
            <span>Following</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeTab === "trending"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <BiTrendingUp size={15} />
            <span>Trending</span>
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* FEATURED STORY SPOTLIGHT (Shown on 'For You' tab if stories exist) */}
          {activeTab === "forYou" && posts && posts.length > 0 && (
            <FeaturedHero posts={posts} />
          )}

          {/* MAIN POST STREAM */}
          {displayedPosts && displayedPosts.length > 0 ? (
            <div className="space-y-6">
              {displayedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onAddComment={handleAddComment}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
              ))}
            </div>
          ) : (
            <div className="editorial-card rounded-3xl p-10 sm:p-16 text-center my-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-2xl text-[var(--accent)] mb-4">
                ✦
              </div>

              {activeTab === "following" ? (
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] mb-2">
                    No stories from followed writers yet
                  </h3>
                  <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
                    {user
                      ? "You aren't following anyone yet or your connections haven't published recently. Discover writers on the right rail or Explore tab to curate your feed."
                      : "Sign in to follow your favorite writers and see their latest stories here."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forYou")}
                    className="btn-secondary-editorial text-xs"
                  >
                    Browse For You Feed
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
                    Be the first to publish a thoughtful piece on BlogSphere. Share your experiences, tutorials, or creative work.
                  </p>
                  <Link to="/create" className="btn-primary-editorial text-xs">
                    Write First Story
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
