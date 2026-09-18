import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BiMessageRoundedDots,
  BiUserPlus,
  BiCheck,
  BiTimeFive,
  BiGridAlt
} from "react-icons/bi";
import API from "../api";
import UserListModal from "../components/UserListModal";
import Spinner from "../components/Spinner";

export default function UserProfile() {
  const { id } = useParams();
  const loggedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      API.get(`/user/${id}`).catch(() => ({ data: null })),
      API.get(`/user/${id}/stats`).catch(() => ({ data: null })),
      API.get(`/posts?author=${id}`).catch(() => ({ data: [] })),
    ])
      .then(([userRes, statsRes, postsRes]) => {
        setUser(userRes.data);
        setStats(statsRes.data);
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);

        const followersList = statsRes.data?.followersList || statsRes.data?.followers || [];
        const loggedId = loggedUser?.id || loggedUser?._id;
        if (
          loggedId &&
          (followersList.includes?.(loggedId) ||
            loggedUser?.following?.some((f) => (typeof f === "string" ? f : f?._id) === id))
        ) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    setIsFollowing(true);
    setStats((s) => (s ? { ...s, followers: (s.followers || 0) + 1 } : s));

    if (loggedUser) {
      const updated = {
        ...loggedUser,
        following: [...(loggedUser.following || []), id],
      };
      localStorage.setItem("user", JSON.stringify(updated));
    }

    try {
      await API.post(`/user/${id}/follow`);
    } catch (err) {
      console.error("Follow error:", err);
      setIsFollowing(false);
      setStats((s) => (s ? { ...s, followers: Math.max((s.followers || 1) - 1, 0) } : s));
      if (loggedUser) localStorage.setItem("user", JSON.stringify(loggedUser));
    }
  };

  const handleUnfollow = async () => {
    setIsFollowing(false);
    setStats((s) => (s ? { ...s, followers: Math.max((s.followers || 1) - 1, 0) } : s));

    if (loggedUser) {
      const updated = {
        ...loggedUser,
        following: (loggedUser.following || []).filter((uid) => uid !== id),
      };
      localStorage.setItem("user", JSON.stringify(updated));
    }

    try {
      await API.post(`/user/${id}/unfollow`);
    } catch (err) {
      console.error("Unfollow error:", err);
      setIsFollowing(true);
      setStats((s) => (s ? { ...s, followers: (s.followers || 0) + 1 } : s));
      if (loggedUser) localStorage.setItem("user", JSON.stringify(loggedUser));
    }
  };

  const handleStatClick = async (type) => {
    if (!id) return;
    try {
      if (type === "followers") {
        const res = await API.get(`/user/${id}/followers`);
        setModalTitle("Followers");
        setModalUsers(res.data || []);
        setShowModal(true);
      } else if (type === "following") {
        const res = await API.get(`/user/${id}/following`);
        setModalTitle("Following");
        setModalUsers(res.data || []);
        setShowModal(true);
      } else if (type === "posts") {
        document.getElementById("stories-grid")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("handleStatClick error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="editorial-card rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
        <h2 className="font-serif font-bold text-2xl text-[var(--ink)] mb-2">Member not found</h2>
        <p className="text-sm text-[var(--ink-secondary)] mb-6">The requested user profile does not exist or has been removed.</p>
        <Link to="/" className="btn-secondary-editorial text-xs">
          Return to Feed
        </Link>
      </div>
    );
  }

  const isSelf = loggedUser && (loggedUser.id === id || loggedUser._id === id);

  return (
    <div className="w-full page-fade-in pb-20">
      
      {/* COVER & HEADER CARD */}
      <div className="editorial-card rounded-3xl overflow-hidden mb-10 shadow-card">
        <div className="h-36 sm:h-48 bg-gradient-to-r from-[#1b1e1b] via-[#242923] to-[#1c1d19] relative border-b border-[var(--line)]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d8ff65_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-6 sm:px-10 pb-8 pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-[var(--surface-raised)] border-4 border-[var(--surface)] shadow-lg flex items-center justify-center font-serif font-bold text-3xl text-[var(--accent)] shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  (user.name?.charAt(0) || "U").toUpperCase()
                )}
              </div>

              <div>
                <span className="editorial-eyebrow block">Writer Profile</span>
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
                  {user.name}
                </h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  @{user.username || "creator"}
                </p>
              </div>
            </div>

            {/* Action Buttons for visitors */}
            {!isSelf && loggedUser && (
              <div className="flex items-center gap-3">
                <Link
                  to="/messenger"
                  state={{ chatUser: user }}
                  className="btn-secondary-editorial text-xs py-2 px-4 shadow-sm"
                >
                  <BiMessageRoundedDots size={16} />
                  <span>Message</span>
                </Link>

                {isFollowing ? (
                  <button
                    type="button"
                    onClick={handleUnfollow}
                    className="rounded-full border border-[var(--line-strong)] px-5 py-2 text-xs font-semibold text-[var(--ink-muted)] hover:border-rose-500/50 hover:text-rose-400 transition"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFollow}
                    className="btn-primary-editorial text-xs py-2 px-5 shadow-sm"
                  >
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-3 divide-x divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--surface-hover)] p-3 text-center max-w-md mx-auto sm:mx-0">
              <button
                type="button"
                onClick={() => handleStatClick("followers")}
                className="px-2 hover:opacity-80 transition"
              >
                <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] block">
                  {stats.followers || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                  Followers
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatClick("following")}
                className="px-2 hover:opacity-80 transition"
              >
                <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] block">
                  {stats.following || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                  Following
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatClick("posts")}
                className="px-2 hover:opacity-80 transition"
              >
                <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] block">
                  {stats.posts || posts.length || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                  Stories
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STORIES SECTION */}
      <div id="stories-grid" className="mt-8">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <BiGridAlt className="text-[var(--accent)] text-lg" />
            <h3 className="font-serif font-bold text-xl text-[var(--ink)]">
              Published Stories ({posts.length})
            </h3>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="editorial-card rounded-3xl p-12 text-center">
            <p className="font-serif font-bold text-xl text-[var(--ink)] mb-1">No published stories</p>
            <p className="text-xs text-[var(--ink-secondary)]">This writer has not published any stories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => {
              let img = null;
              if (post.media && post.media.length > 0) img = post.media[0].url;
              else if (post.mediaUrl) img = post.mediaUrl;

              return (
                <article
                  key={post._id}
                  className="editorial-card rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  {img && (
                    <Link to={`/post/${post._id}`} className="block h-48 overflow-hidden bg-black/40">
                      <img
                        src={img}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-[var(--ink-muted)] mb-1 font-mono">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <Link to={`/post/${post._id}`} className="block mb-2">
                        <h4 className="font-serif font-bold text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition">
                          {post.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-4">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-auto">
                      <span className="text-xs text-[var(--ink-muted)]">
                        {post.likes?.length || 0} likes • {post.comments?.length || 0} responses
                      </span>
                      <Link
                        to={`/post/${post._id}`}
                        className="text-xs font-semibold text-[var(--accent)] hover:underline"
                      >
                        Read story →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Followers / Following List Modal */}
      {showModal && (
        <UserListModal
          title={modalTitle}
          users={modalUsers}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
}
