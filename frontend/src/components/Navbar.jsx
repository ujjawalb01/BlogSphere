import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BiSearch,
  BiMessageRoundedDots,
  BiBell,
  BiSun,
  BiMoon,
  BiEdit,
  BiBookmark,
  BiUser,
  BiLogOut,
  BiChevronDown
} from "react-icons/bi";
import API from "../api";
import { io } from "socket.io-client";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [query, setQuery] = useState("");
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread counts & socket events
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const notifRes = await API.get("/notifications/unread/count");
        setUnreadNotifs(notifRes.data?.count || 0);

        const msgRes = await API.get("/messages/unread/count");
        setUnreadMsgs(msgRes.data?.count || 0);
      } catch (err) {
        console.error("Failed to fetch unread counts", err);
      }
    };

    fetchCounts();

    const handleRefresh = () => fetchCounts();
    window.addEventListener("refreshCounts", handleRefresh);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socketUrl = apiUrl.replace("/api", "");
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      socket.emit("join_room", user._id || user.id);
    });

    socket.on("newNotification", () => {
      setUnreadNotifs((prev) => prev + 1);
    });

    socket.on("newMessage", () => {
      setUnreadMsgs((prev) => prev + 1);
    });

    return () => {
      window.removeEventListener("refreshCounts", handleRefresh);
      socket.disconnect();
    };
  }, [user?._id || user?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--canvas)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: Logo Wordmark */}
        <div className="flex items-center gap-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-raised)] border border-[var(--line-strong)] text-[var(--accent)] font-serif font-bold text-lg tracking-tight shadow-sm transition group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-ink)]">
              B
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--ink)] transition group-hover:opacity-90">
                BlogSphere
              </span>
              <span className="editorial-eyebrow text-[9px] -mt-1 tracking-widest text-[var(--ink-muted)] hidden sm:block">
                Editorial &amp; Community
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full relative">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] text-lg" />
            <input
              type="text"
              placeholder="Search blogs, people, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2 pl-10 pr-4 text-sm text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-hover)]"
            />
          </form>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? <BiSun size={18} /> : <BiMoon size={18} />}
          </button>

          {/* User Logged In Actions */}
          {user ? (
            <>
              {/* Write Story CTA (Desktop) */}
              <Link
                to="/create"
                className="hidden sm:inline-flex btn-primary-editorial text-xs py-2 px-3.5"
                title="Write a new story"
              >
                <BiEdit size={16} />
                <span>Write</span>
              </Link>

              {/* Messages Link */}
              <Link
                to="/messenger"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
                title="Direct Messages"
              >
                <BiMessageRoundedDots size={19} />
                {unreadMsgs > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadMsgs > 9 ? "9+" : unreadMsgs}
                  </span>
                )}
              </Link>

              {/* Notifications Link */}
              <Link
                to="/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
                title="Notifications"
              >
                <BiBell size={19} />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </span>
                )}
              </Link>

              {/* User Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 pr-2 hover:border-[var(--line-strong)] transition"
                  aria-expanded={dropdownOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] font-semibold text-xs text-[var(--accent-ink)] overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      (user.name?.charAt(0) || "U").toUpperCase()
                    )}
                  </div>
                  <BiChevronDown size={14} className="text-[var(--ink-muted)]" />
                </button>

                {/* Dropdown Card */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-card z-50 page-fade-in">
                    <div className="border-b border-[var(--line)] px-3 py-2.5">
                      <p className="font-semibold text-sm text-[var(--ink)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--ink-muted)] truncate">@{user.username || user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
                      >
                        <BiUser size={17} />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
                      >
                        <BiBookmark size={17} />
                        <span>Saved Bookmarks</span>
                      </Link>

                      <Link
                        to="/create"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition sm:hidden"
                      >
                        <BiEdit size={17} />
                        <span>Write Story</span>
                      </Link>
                    </div>

                    <div className="border-t border-[var(--line)] pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <BiLogOut size={17} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary-editorial text-xs py-1.5 px-3.5"
              >
                Get started
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
