import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiTrendingUp, BiUserPlus, BiCheck } from "react-icons/bi";
import API from "../api";

export default function DiscoverySidebar({ posts = [] }) {
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch suggested users (from API search or active authors)
  useEffect(() => {
    let isMounted = true;

    const fetchWriters = async () => {
      setLoadingUsers(true);
      try {
        // Query users via search endpoint or fallback to unique authors from posts
        const res = await API.get("/user/search?q=a");
        if (isMounted) {
          const currentId = currentUser?._id || currentUser?.id;
          const filtered = (res.data || [])
            .filter((u) => u._id !== currentId)
            .slice(0, 5);
          setSuggestedUsers(filtered);
        }
      } catch (err) {
        console.error("Discovery sidebar user fetch error:", err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    fetchWriters();

    return () => {
      isMounted = false;
    };
  }, [currentUser?._id || currentUser?.id]);

  // Extract dynamic topics from posts or fallback
  const derivedTopics = React.useMemo(() => {
    const topicCounts = {};
    if (posts && posts.length) {
      posts.forEach((p) => {
        const words = `${p.title || ""} ${p.content || ""}`.match(/#\w+/g) || [];
        words.forEach((tag) => {
          const clean = tag.toLowerCase();
          topicCounts[clean] = (topicCounts[clean] || 0) + 1;
        });
      });
    }

    const tags = Object.keys(topicCounts);
    if (tags.length >= 3) {
      return tags.slice(0, 6);
    }

    // Default curated editorial topics
    return ["#writing", "#technology", "#design", "#creativity", "#culture", "#lifestyle"];
  }, [posts]);

  // Handle follow / unfollow
  const handleToggleFollow = async (authorId) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const currentFollowing = currentUser.following || [];
    const isFollowing = currentFollowing.some(
      (id) => (typeof id === "string" ? id : id?._id || id?.toString()) === authorId
    );

    // Optimistically update localStorage
    let updatedFollowing;
    if (isFollowing) {
      updatedFollowing = currentFollowing.filter(
        (id) => (typeof id === "string" ? id : id?._id || id?.toString()) !== authorId
      );
    } else {
      updatedFollowing = [...currentFollowing, authorId];
    }

    const updatedUser = { ...currentUser, following: updatedFollowing };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Force re-render of button
    setSuggestedUsers((prev) => [...prev]);

    try {
      if (isFollowing) {
        await API.post(`/user/${authorId}/unfollow`);
      } else {
        await API.post(`/user/${authorId}/follow`);
      }
    } catch (err) {
      console.error("Discovery sidebar follow toggle failed:", err);
      // Revert on error
      localStorage.setItem("user", JSON.stringify(currentUser));
      setSuggestedUsers((prev) => [...prev]);
    }
  };

  const isUserFollowed = (userId) => {
    if (!currentUser?.following) return false;
    return currentUser.following.some(
      (id) => (typeof id === "string" ? id : id?._id || id?.toString()) === userId
    );
  };

  return (
    <aside className="sticky top-20 hidden lg:flex flex-col w-72 xl:w-80 shrink-0 py-4 pl-4 space-y-6">
      
      {/* 1. PEOPLE TO FOLLOW */}
      <div className="editorial-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-base text-[var(--ink)]">Who to follow</h3>
          <Link to="/explore" className="text-xs font-semibold text-[var(--accent)] hover:underline">
            See all
          </Link>
        </div>

        <div className="space-y-3.5">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((u) => {
              const following = isUserFollowed(u._id);

              return (
                <div key={u._id} className="flex items-center justify-between gap-3">
                  <Link
                    to={`/profile/${u._id}`}
                    className="flex items-center gap-3 min-w-0 group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-xs font-semibold text-[var(--ink)] overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                      ) : (
                        (u.name?.charAt(0) || "U").toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-[var(--ink-muted)] truncate">
                        @{u.username || "writer"}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(u._id)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      following
                        ? "border border-[var(--line-strong)] bg-transparent text-[var(--ink-muted)] hover:border-rose-500/50 hover:text-rose-400"
                        : "bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[var(--ink-muted)] italic py-2">
              Discovering writers across the community...
            </p>
          )}
        </div>
      </div>

      {/* 2. TRENDING TOPICS */}
      <div className="editorial-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BiTrendingUp className="text-[var(--accent)] text-lg" />
          <h3 className="font-serif font-bold text-base text-[var(--ink)]">Trending Topics</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {derivedTopics.map((topic, i) => (
            <Link
              key={i}
              to={`/search?q=${encodeURIComponent(topic.replace("#", ""))}`}
              className="topic-chip capitalize"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. EDITORIAL DIGEST / NEWSLETTER PROMO */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-left">
        <span className="editorial-eyebrow mb-1 block">Staff Perspective</span>
        <h4 className="font-serif font-bold text-sm text-[var(--ink)] mb-1.5">
          Curated Stories &amp; Cultural Essays
        </h4>
        <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
          Explore thoughtful reflections, creative photography, and deep dives from members worldwide.
        </p>
        <Link to="/explore" className="text-xs font-semibold text-[var(--accent)] hover:underline">
          Explore trending stories →
        </Link>
      </div>

      {/* 4. FOOTER */}
      <div className="text-[11px] text-[var(--ink-muted)] leading-loose px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/explore" className="hover:underline">Explore</Link>
          <Link to="/bookmarks" className="hover:underline">Bookmarks</Link>
          <Link to="/search" className="hover:underline">Search</Link>
        </div>
        <p className="mt-2 text-[10px] opacity-70">
          © {new Date().getFullYear()} BlogSphere, Inc. All rights reserved.
        </p>
      </div>

    </aside>
  );
}
