import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiPlusCircle, BiMessageRoundedDots, BiBell, BiPlanet, BiMoon, BiSun } from "react-icons/bi";
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch initial unread counts and set up socket listeners
  useEffect(() => {
    if (!user) return;

    // Fetch Counts
    const fetchCounts = async () => {
       try {
          const notifRes = await API.get("/notifications/unread/count");
          setUnreadNotifs(notifRes.data.count);
          
          const msgRes = await API.get("/messages/unread/count");
          setUnreadMsgs(msgRes.data.count);
       } catch (err) {
          console.error("Failed to fetch unread counts", err);
       }
    };
    fetchCounts();

    // Listen for global refresh events (e.g. from Messenger/Notifications page)
    const handleRefresh = () => fetchCounts();
    window.addEventListener("refreshCounts", handleRefresh);

    // Socket Listener
    // Note: Assuming socket is initialized elsewhere or we use a simple approach here.
    // If not global, we might need to rely on polling or a context. 
    // However, since Messenger uses its own socket, checking if we can reuse or just use a new one.
    // For now, let's try to reuse the socket from window/global if available or just wait for refresh.
    // Actually, best strictly here is to reuse logic. 
    // But since `io` isn't imported, let's import it.
    
    // Changing strategy: Import io matching Messenger.jsx
    // Fix: Remove "/api" if present in the URL for socket connection
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socketUrl = apiUrl.replace("/api", "");
    
    const socket = io(socketUrl);
    
    socket.on("connect", () => {
        console.log("Navbar Socket Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Navbar Socket Connection Error:", err);
    });
    
    socket.emit("join_room", user._id || user.id);

    socket.on("newNotification", () => {
        setUnreadNotifs(prev => prev + 1);
    });

    socket.on("newMessage", () => {
        setUnreadMsgs(prev => prev + 1);
    });

    return () => {
        socket.disconnect();
    };
  }, [user?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${query}`);
  };

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#171817]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 md:px-8">

        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ff65]/60 text-[#d9ff65] group-hover:bg-[#d9ff65] group-hover:text-[#202318]">
             <BiPlanet className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#f5f3ed]">BlogSphere</h1>
            <p className="eyebrow mt-0.5 text-[8px]">Stories in common</p>
          </div>
        </Link>

        {/* SEARCH BAR */}
        {user && <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <input
            type="text"
            placeholder="Search posts or users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-52 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#d9ff65]/70 md:w-72"
          />
        </form>}

        {/* RIGHT SIDE - Desktop */}
        <div className="hidden md:flex items-center space-x-5">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-white/10 p-2 text-gray-400 hover:border-white/25 hover:text-[#d9ff65]"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <BiSun size={19} /> : <BiMoon size={19} />}
          </button>
          {user && <Link
            to="/create"
            className="text-gray-400 hover:text-[#d9ff65]"
            title="Create Post"
          >
            <BiPlusCircle size={28} />
          </Link>}
          
          {user && <Link
            to="/messenger"
            className="relative text-gray-400 hover:text-[#d9ff65]"
            title="Messages"
          >
            <BiMessageRoundedDots size={26} />
            {unreadMsgs > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                {unreadMsgs > 9 ? "9+" : unreadMsgs}
              </span>
            )}
          </Link>}

          {user && <Link
            to="/notifications"
            className="relative text-gray-400 hover:text-[#d9ff65]"
            title="Notifications"
          >
            <BiBell size={26} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
          </Link>}

          {user ? (
            <>
              <Link to="/profile" className="flex items-center space-x-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ff65] text-sm font-semibold text-[#202318]">
                  {(user.name && user.name.charAt(0).toUpperCase()) || "U"}
                </div>
                <div className="text-sm text-white/90">{user.name}</div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm text-gray-300 hover:text-white">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full px-4 py-2 text-sm btn"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Right Side: Notifications & Login only (since Navbar has Create/Msg) */}
        <div className="flex md:hidden items-center space-x-3">
             <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-[#d9ff65]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
             >
                {theme === "dark" ? <BiSun size={21} /> : <BiMoon size={21} />}
             </button>
             {user && location.pathname !== "/profile" && (
                 <Link
                    to="/notifications"
                    className="text-gray-300 hover:text-white transition-colors relative"
                 >
                    <BiBell size={24} />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-gray-900">
                        {unreadNotifs > 9 ? "9+" : unreadNotifs}
                      </span>
                    )}
                 </Link>
             )}
             {!user && <>
               <Link to="/login" className="text-sm font-semibold text-gray-200 hover:text-white">Login</Link>
               <Link to="/register" className="rounded-full px-3 py-1.5 text-xs btn">Sign up</Link>
             </>}
        </div>
      </div>
    </nav>
  );
}
