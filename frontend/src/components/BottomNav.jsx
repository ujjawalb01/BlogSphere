import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BiHomeAlt,
  BiCompass,
  BiPlus,
  BiMessageRoundedDots,
  BiUser
} from "react-icons/bi";

export default function BottomNav() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-[var(--canvas)]/95 px-6 py-2 backdrop-blur-md md:hidden transition-colors">
      <div className="flex items-center justify-between max-w-md mx-auto">
        
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 transition ${
            isActive("/") ? "text-[var(--accent)] font-semibold" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
          aria-label="Home"
        >
          <BiHomeAlt size={22} />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Explore */}
        <Link
          to="/explore"
          className={`flex flex-col items-center py-1 transition ${
            isActive("/explore") ? "text-[var(--accent)] font-semibold" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
          aria-label="Explore"
        >
          <BiCompass size={22} />
          <span className="text-[10px] mt-0.5">Explore</span>
        </Link>

        {/* Create Post (Elevated Center Button) */}
        <Link
          to={user ? "/create" : "/login"}
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] shadow-lg hover:scale-105 active:scale-95 transition"
          aria-label="Write a story"
        >
          <BiPlus size={26} />
        </Link>

        {/* Messages */}
        <Link
          to={user ? "/messenger" : "/login"}
          className={`flex flex-col items-center py-1 transition ${
            isActive("/messenger") ? "text-[var(--accent)] font-semibold" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
          aria-label="Messages"
        >
          <BiMessageRoundedDots size={22} />
          <span className="text-[10px] mt-0.5">Messages</span>
        </Link>

        {/* Profile / Account */}
        <Link
          to={user ? "/profile" : "/login"}
          className={`flex flex-col items-center py-1 transition ${
            isActive("/profile") ? "text-[var(--accent)] font-semibold" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
          aria-label="Profile"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className={`h-5 w-5 rounded-full object-cover border ${
                isActive("/profile") ? "border-[var(--accent)]" : "border-[var(--line)]"
              }`}
            />
          ) : (
            <BiUser size={22} />
          )}
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>

      </div>
    </nav>
  );
}
