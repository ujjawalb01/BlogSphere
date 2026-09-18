import React, { useState, useEffect } from "react";
import API from "../api";
import {
  BiSearch,
  BiSend,
  BiX,
  BiCheck,
  BiLink,
  BiShareAlt
} from "react-icons/bi";

export default function ShareModal({ post, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Load following list as default suggestions
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      API.get(`/user/${currentUser._id || currentUser.id}/following`)
        .then((res) => setResults(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentUser?._id || currentUser?.id]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);

    if (!q.trim()) {
      if (currentUser) {
        setLoading(true);
        API.get(`/user/${currentUser._id || currentUser.id}/following`)
          .then((res) => setResults(res.data || []))
          .catch(console.error)
          .finally(() => setLoading(false));
      }
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/user/search?q=${encodeURIComponent(q)}`);
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0) return;

    setSending(true);
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      const text = `Thought you'd find this interesting: "${post.title}"\n${postUrl}`;

      const promises = selectedUsers.map((receiverId) =>
        API.post("/messages", {
          receiverId,
          text,
        })
      );

      await Promise.all(promises);
      onClose();
    } catch (err) {
      alert("Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const copyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 page-fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-card">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <BiShareAlt className="text-[var(--accent)] text-xl" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--ink)]">Share Story</h3>
              <p className="text-xs text-[var(--ink-muted)] truncate max-w-[240px]">
                {post.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
          >
            <BiX size={22} />
          </button>
        </div>

        {/* Copy Link Direct Action */}
        <div className="my-4 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-3">
          <div className="flex items-center gap-2 min-w-0">
            <BiLink className="text-[var(--ink-muted)] shrink-0 text-lg" />
            <span className="text-xs text-[var(--ink-secondary)] truncate font-mono">
              {`${window.location.origin}/post/${post._id}`}
            </span>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 ml-2 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] transition"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[var(--accent)]">
                <BiCheck size={14} /> Copied
              </span>
            ) : (
              "Copy"
            )}
          </button>
        </div>

        {/* Search Users to DM */}
        <div className="relative mb-3">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] text-base" />
          <input
            type="text"
            placeholder="Search connections to message..."
            value={query}
            onChange={handleSearch}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] py-2 pl-9 pr-4 text-xs text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[260px]">
          {loading ? (
            <p className="text-center text-xs text-[var(--ink-muted)] py-6">Searching members...</p>
          ) : results.length > 0 ? (
            results.map((u) => {
              const isSelected = selectedUsers.includes(u._id);

              return (
                <div
                  key={u._id}
                  onClick={() => toggleSelect(u._id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition ${
                    isSelected
                      ? "bg-[var(--surface-hover)] border-[var(--accent)]"
                      : "border-transparent hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[var(--accent)]">
                          {(u.name?.charAt(0) || "U").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--ink)] truncate">{u.name}</p>
                      <p className="text-[10px] text-[var(--ink-muted)] truncate">@{u.username || "writer"}</p>
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
                      isSelected
                        ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-ink)]"
                        : "border-[var(--line-strong)]"
                    }`}
                  >
                    {isSelected && <BiCheck size={14} />}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-[var(--ink-muted)] py-6 italic">
              {query ? "No members found" : "Search to share with connections"}
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-4 pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={handleSend}
            disabled={selectedUsers.length === 0 || sending}
            className="btn-primary-editorial w-full py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <span>Sending...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <BiSend size={15} />
                Send via Direct Message ({selectedUsers.length})
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
