import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BiHeart,
  BiCommentDetail,
  BiUserPlus,
  BiNews,
  BiBell,
  BiTimeFive
} from "react-icons/bi";
import API from "../api";
import Spinner from "../components/Spinner";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      const list = res.data || [];
      setNotifications(list);

      const hasUnread = list.some((n) => !n.read);
      if (hasUnread) {
        await API.put("/notifications/read");
        window.dispatchEvent(new Event("refreshCounts"));
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <BiHeart className="text-rose-500" size={18} />;
      case "comment":
        return <BiCommentDetail className="text-sky-400" size={18} />;
      case "follow":
        return <BiUserPlus className="text-emerald-400" size={18} />;
      case "friend_post":
        return <BiNews className="text-[var(--accent)]" size={18} />;
      default:
        return <BiBell className="text-[var(--ink-muted)]" size={18} />;
    }
  };

  const getActionText = (n) => {
    switch (n.type) {
      case "like":
        return "liked your story";
      case "comment":
        return "commented on your story";
      case "follow":
        return "started following you";
      case "friend_post":
        return "published a new story";
      default:
        return "interacted with you";
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "likes") return n.type === "like";
    if (filter === "comments") return n.type === "comment";
    if (filter === "follows") return n.type === "follow";
    return true;
  });

  return (
    <div className="w-full max-w-3xl mx-auto page-fade-in pb-20">
      
      {/* Header */}
      <div className="mb-6 border-b border-[var(--line)] pb-5">
        <span className="editorial-eyebrow mb-1.5 block">Activity Stream</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">
          Stay informed about who is engaging with your writing and stories.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar">
          {[
            { label: "All Activity", value: "all" },
            { label: "Likes", value: "likes" },
            { label: "Comments", value: "comments" },
            { label: "Followers", value: "follows" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === tab.value
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="editorial-card rounded-3xl p-12 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-2xl text-[var(--ink-muted)] mb-3">
            <BiBell size={24} />
          </div>
          <h3 className="font-serif font-bold text-xl text-[var(--ink)] mb-1">
            No notifications yet
          </h3>
          <p className="text-xs text-[var(--ink-muted)] max-w-sm mx-auto">
            When people like your stories, leave thoughtful responses, or follow your profile, you'll see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={`editorial-card rounded-2xl p-4 sm:p-5 flex items-start gap-4 transition ${
                !n.read ? "border-[var(--accent)]/50 bg-[var(--surface-hover)]" : ""
              }`}
            >
              {/* Type Icon Badge */}
              <div className="h-10 w-10 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link to={`/profile/${n.sender?._id}`}>
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)]">
                        {n.sender?.avatar ? (
                          <img src={n.sender.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[var(--accent)]">
                            {(n.sender?.name?.charAt(0) || "U").toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <Link
                      to={`/profile/${n.sender?._id}`}
                      className="font-semibold text-xs text-[var(--ink)] hover:text-[var(--accent)] transition truncate"
                    >
                      {n.sender?.name || "Someone"}
                    </Link>

                    <span className="text-xs text-[var(--ink-secondary)]">
                      {getActionText(n)}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--ink-muted)] shrink-0 flex items-center gap-1">
                    <BiTimeFive size={11} />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Additional context (linked post or comment text) */}
                {n.post && (
                  <Link
                    to={`/post/${n.post._id || n.post}`}
                    className="mt-2 block rounded-xl bg-[var(--surface-raised)] p-2.5 border border-[var(--line)] text-xs text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:border-[var(--line-strong)] transition truncate"
                  >
                    "{n.post.title || "View Post"}"
                  </Link>
                )}

                {n.text && (
                  <p className="mt-2 text-xs text-[var(--ink-secondary)] italic border-l-2 border-[var(--line-strong)] pl-3">
                    "{n.text}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
