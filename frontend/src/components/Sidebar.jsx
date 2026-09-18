import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BiHomeAlt,
  BiCompass,
  BiBookmark,
  BiMessageRoundedDots,
  BiBell,
  BiUser,
  BiPlusCircle,
  BiTrendingUp
} from "react-icons/bi";

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: "Home", path: "/", icon: BiHomeAlt },
    { label: "Explore", path: "/explore", icon: BiCompass },
    { label: "Bookmarks", path: "/bookmarks", icon: BiBookmark },
    ...(user
      ? [
          { label: "Messages", path: "/messenger", icon: BiMessageRoundedDots },
          { label: "Notifications", path: "/notifications", icon: BiBell },
          { label: "Profile", path: "/profile", icon: BiUser },
        ]
      : []),
  ];

  return (
    <aside className="sticky top-20 hidden md:flex flex-col w-56 lg:w-64 shrink-0 py-4 pr-4">
      {/* Navigation List */}
      <nav className="space-y-1.5 mb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition ${
                active
                  ? "bg-[var(--surface)] text-[var(--accent)] border border-[var(--line-strong)] font-semibold shadow-sm"
                  : "text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
              }`}
            >
              <Icon size={21} className={active ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Primary Write Button */}
      {user ? (
        <Link
          to="/create"
          className="btn-primary-editorial w-full py-3 text-sm shadow-md"
        >
          <BiPlusCircle size={19} />
          <span>Write a Story</span>
        </Link>
      ) : (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center">
          <p className="font-serif font-semibold text-sm text-[var(--ink)] mb-1">Join BlogSphere</p>
          <p className="text-xs text-[var(--ink-muted)] mb-3">Share your stories and connect with curious readers.</p>
          <Link to="/register" className="btn-primary-editorial w-full py-2 text-xs">
            Create Account
          </Link>
        </div>
      )}

      {/* Editorial Quote / Footer Notice */}
      <div className="mt-auto pt-8 border-t border-[var(--line)] px-2">
        <p className="font-serif italic text-xs text-[var(--ink-muted)] leading-relaxed">
          “Words can be like X-rays if you use them properly—they’ll go through anything.”
        </p>
        <p className="text-[10px] text-[var(--ink-muted)] mt-2 font-mono uppercase tracking-wider">
          BlogSphere Publishing
        </p>
      </div>
    </aside>
  );
}
