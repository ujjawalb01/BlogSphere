import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DiscoverySidebar from "./components/DiscoverySidebar";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Bookmarks from "./pages/Bookmarks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import PostDetails from "./pages/PostDetails";
import EditPost from "./pages/EditPost";
import SearchPage from "./pages/SearchPage";
import Messenger from "./pages/Messenger";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const location = useLocation();
  const [globalPosts, setGlobalPosts] = useState([]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  // Determine if right discovery sidebar should show (Home, Explore, Bookmarks, Search)
  const showDiscoverySidebar =
    location.pathname === "/" ||
    location.pathname === "/explore" ||
    location.pathname === "/bookmarks" ||
    location.pathname === "/search";

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 flex-1 flex pb-20 md:pb-12 pt-4 sm:pt-6">
        
        {/* Left Persistent Navigation Sidebar (Desktop) */}
        {!isAuthPage && <Sidebar />}

        {/* Center Routed Content Stream */}
        <main
          className={`flex-1 min-w-0 ${
            !isAuthPage ? "px-0 md:px-6" : "w-full max-w-5xl mx-auto"
          }`}
        >
          <Routes>
            <Route path="/" element={<Home onPostsLoaded={setGlobalPosts} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/messenger" element={<Messenger />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>

        {/* Right Discovery Sidebar (Home / Explore / Bookmarks / Search) */}
        {!isAuthPage && showDiscoverySidebar && (
          <DiscoverySidebar posts={globalPosts} />
        )}

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
