import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiPlusCircle, BiMessageRoundedDots, BiBell, BiGlobe, BiPlanet } from "react-icons/bi";
import API from "../api";
import { io } from "socket.io-client";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [query, setQuery] = useState("");
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

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

  return (
    <nav className="py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-80 blur-sm"></div>
            <div className="relative w-full h-full bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
               <BiPlanet className="text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-pink-400" style={{color: '#818cf8'}} />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              BlogSphere
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300/80 font-medium">
              Explore the World
            </p>
          </div>
        </Link>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <input
            type="text"
            placeholder="Search posts or users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 text-white placeholder-indigo-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary w-52 md:w-72"
          />
        </form>

        {/* RIGHT SIDE - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/create"
            className="text-gray-300 hover:text-white transition-colors"
            title="Create Post"
          >
            <BiPlusCircle size={28} />
          </Link>
          
          <Link
            to="/messenger"
            className="text-gray-300 hover:text-white transition-colors relative"
            title="Messages"
          >
            <BiMessageRoundedDots size={26} />
            {unreadMsgs > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                {unreadMsgs > 9 ? "9+" : unreadMsgs}
              </span>
            )}
          </Link>

          <Link
            to="/notifications"
            className="text-gray-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <BiBell size={26} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                  {(user.name && user.name.charAt(0).toUpperCase()) || "U"}
                </div>
                <div className="text-white/90">{user.name}</div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm text-indigo-100">
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 bg-primary text-white rounded-md text-sm btn"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Right Side: Notifications & Login only (since Navbar has Create/Msg) */}
        <div className="flex md:hidden items-center space-x-4">
             {location.pathname !== "/profile" && (
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
             {!user && <Link to="/login" className="text-sm font-bold text-indigo-400">Login</Link>}
        </div>
      </div>
    </nav>
  );
}
