import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiPlusCircle, BiMessageRoundedDots, BiBell } from "react-icons/bi";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${query}`);
  };

  return (
    <nav className="py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            B
          </div>
          <div>
            <div className="font-semibold text-white text-lg">BlogSphere</div>
            <div className="text-xs text-indigo-200">Post. Share. Inspire.</div>
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

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-6">
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
          </Link>

          <Link
            to="/notifications"
            className="text-gray-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <BiBell size={26} />
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                  {user.name.charAt(0).toUpperCase()}
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
      </div>
    </nav>
  );
}
