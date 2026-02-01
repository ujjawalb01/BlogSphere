import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
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

import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
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
        </Routes>
      </main>
      
      <BottomNav />
    </div>
  );
}
