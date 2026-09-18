import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BiCog,
  BiUser,
  BiLockAlt,
  BiLogOut,
  BiX,
  BiTimeFive,
  BiBookmark,
  BiGridAlt,
  BiCheck
} from "react-icons/bi";
import API from "../api";
import Spinner from "../components/Spinner";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'bookmarks'
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  // Settings modals
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState(null); // 'account' | 'password'

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const id = user.id || user._id;

    Promise.all([
      API.get(`/user/${id}/stats`).catch(() => ({ data: { followers: 0, following: 0, posts: 0 } })),
      API.get(`/posts?author=${id}`).catch(() => ({ data: [] })),
      API.get("/posts").catch(() => ({ data: [] }))
    ])
      .then(([statsRes, postsRes, allPostsRes]) => {
        setStats(statsRes.data);
        const filtered = (postsRes.data || []).filter((p) => p.author?._id === id);
        setPosts(filtered);

        // Filter saved bookmarks
        try {
          const savedIds = JSON.parse(localStorage.getItem("bookmarked_posts") || "[]");
          const saved = (allPostsRes.data || []).filter((p) => savedIds.includes(p._id));
          setBookmarkedPosts(saved);
        } catch (e) {
          setBookmarkedPosts([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return (
      <div className="editorial-card rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
        <h2 className="font-serif font-bold text-2xl text-[var(--ink)] mb-3">Your Profile</h2>
        <p className="text-sm text-[var(--ink-secondary)] mb-6">
          Sign in to manage your stories, view your library, and update your account.
        </p>
        <Link to="/login" className="btn-primary-editorial text-xs">
          Sign in
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-full page-fade-in pb-20">
      
      {/* PROFILE HEADER CARD */}
      <div className="editorial-card rounded-3xl overflow-hidden mb-10 shadow-card">
        
        {/* Editorial Cover Texture */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-[#1b1e1b] via-[#252a24] to-[#1a1c18] relative border-b border-[var(--line)]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d8ff65_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition"
            aria-label="Settings"
          >
            <BiCog size={16} />
            <span>Settings</span>
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              
              {/* Avatar */}
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-[var(--surface-raised)] border-4 border-[var(--surface)] shadow-lg flex items-center justify-center font-serif font-bold text-3xl text-[var(--accent)] shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  (user.name?.charAt(0) || "U").toUpperCase()
                )}
              </div>

              <div>
                <span className="editorial-eyebrow block">Member Profile</span>
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
                  {user.name}
                </h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  @{user.username || "creator"} • {user.email}
                </p>
              </div>
            </div>

            <Link
              to="/create"
              className="btn-primary-editorial text-xs py-2 px-4 shadow-sm"
            >
              Write New Story
            </Link>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-3 divide-x divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--surface-hover)] p-3 text-center max-w-md mx-auto sm:mx-0">
              <div className="px-2">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] block">
                  {stats.followers || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                  Followers
                </span>
              </div>
              <div className="px-2">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] block">
                  {stats.following || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                  Following
                </span>
              </div>
              <div className="px-2">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] block">
                  {stats.posts || posts.length || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                  Stories
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB NAVIGATION: Published Stories vs Bookmarks */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
            activeTab === "posts"
              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <BiGridAlt size={16} />
          <span>Published Stories ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookmarks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
            activeTab === "bookmarks"
              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <BiBookmark size={16} />
          <span>Saved Bookmarks ({bookmarkedPosts.length})</span>
        </button>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <Spinner />
      ) : activeTab === "posts" ? (
        posts.length === 0 ? (
          <div className="editorial-card rounded-3xl p-12 text-center">
            <p className="font-serif font-bold text-xl text-[var(--ink)] mb-2">No stories published yet</p>
            <p className="text-sm text-[var(--ink-secondary)] mb-6">Your voice matters. Write your first story and share your perspective.</p>
            <Link to="/create" className="btn-primary-editorial text-xs">
              Write First Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((p) => {
              let img = null;
              if (p.media && p.media.length > 0) img = p.media[0].url;
              else if (p.mediaUrl) img = p.mediaUrl;

              return (
                <article
                  key={p._id}
                  className="editorial-card rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  {img && (
                    <Link to={`/post/${p._id}`} className="block h-48 overflow-hidden bg-black/40">
                      <img
                        src={img}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-[var(--ink-muted)] mb-1.5 font-mono">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                      <Link to={`/post/${p._id}`} className="block mb-2">
                        <h3 className="font-serif font-bold text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition">
                          {p.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-4">
                        {p.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-auto">
                      <span className="text-xs text-[var(--ink-muted)]">
                        {p.likes?.length || 0} likes • {p.comments?.length || 0} responses
                      </span>
                      <Link to={`/edit/${p._id}`} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                        Edit story
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : bookmarkedPosts.length === 0 ? (
        <div className="editorial-card rounded-3xl p-12 text-center">
          <p className="font-serif font-bold text-xl text-[var(--ink)] mb-2">No saved bookmarks</p>
          <p className="text-sm text-[var(--ink-secondary)] mb-6">Bookmark stories from the feed to view them here.</p>
          <Link to="/" className="btn-secondary-editorial text-xs">
            Browse Home Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bookmarkedPosts.map((p) => (
            <article key={p._id} className="editorial-card rounded-2xl p-5 flex flex-col justify-between group">
              <div>
                <p className="text-[11px] text-[var(--ink-muted)] mb-1">
                  By {p.author?.name || "Writer"}
                </p>
                <Link to={`/post/${p._id}`} className="block mb-2">
                  <h3 className="font-serif font-bold text-lg text-[var(--ink)] group-hover:text-[var(--accent)] transition">
                    {p.title}
                  </h3>
                </Link>
                <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-4">
                  {p.content}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-auto">
                <Link to={`/post/${p._id}`} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                  Read story →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* SETTINGS MAIN MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 page-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
              <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Account Settings</h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full text-[var(--ink-muted)] hover:text-[var(--ink)] transition"
              >
                <BiX size={22} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setActiveSettingsModal("account");
                }}
                className="flex items-center gap-3 w-full p-3 rounded-2xl bg-[var(--surface-hover)] text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)] border border-transparent transition"
              >
                <BiUser size={18} className="text-[var(--accent)]" />
                <span>Update Profile Information</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setActiveSettingsModal("password");
                }}
                className="flex items-center gap-3 w-full p-3 rounded-2xl bg-[var(--surface-hover)] text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)] border border-transparent transition"
              >
                <BiLockAlt size={18} className="text-[var(--accent)]" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-2xl bg-rose-500/10 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition"
              >
                <BiLogOut size={18} />
                <span>Sign Out of BlogSphere</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="btn-secondary-editorial w-full py-2.5 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* UPDATE ACCOUNT MODAL */}
      {activeSettingsModal === "account" && (
        <UpdateAccountModal
          user={user}
          onClose={() => setActiveSettingsModal(null)}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {activeSettingsModal === "password" && (
        <ChangePasswordModal
          onClose={() => setActiveSettingsModal(null)}
        />
      )}

    </div>
  );
}

// Subcomponent: Update Account
function UpdateAccountModal({ user, onClose }) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await API.put("/user/update", { name, username, email });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMsg("Profile updated successfully!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error updating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 page-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
          <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Edit Profile</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-[var(--ink-muted)]">
            <BiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="editorial-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="editorial-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="editorial-input"
              required
            />
          </div>

          {msg && (
            <p className="text-xs text-center font-mono py-1 text-[var(--accent)]">{msg}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
            <button type="button" onClick={onClose} className="btn-secondary-editorial text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary-editorial text-xs">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Change Password
function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg("New passwords do not match.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      await API.put("/user/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      setMsg("Password changed successfully!");
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 page-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
          <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Change Password</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-[var(--ink-muted)]">
            <BiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="editorial-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="editorial-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="editorial-input"
              required
            />
          </div>

          {msg && (
            <p className="text-xs text-center font-mono py-1 text-[var(--accent)]">{msg}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
            <button type="button" onClick={onClose} className="btn-secondary-editorial text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary-editorial text-xs">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
