import React, { useEffect, useState } from "react";
import API from "../api";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse user and safely access properties
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      const data = res.data.map((p) => ({
        ...p,
        canDelete: user && p.author && p.author._id === (user._id || user.id), 
        // Logic to check if we are following
        isFollowing: user?.following?.includes(p.author?._id)
      }));
      setPosts(data);
    } catch (err) {
      console.error("Fetch Posts Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Update user in local storage to keep "following" list fresh
  const refreshUser = async () => {
      if(!user) return;
      try {
          const res = await API.get(`/user/${user._id || user.id}`);
          localStorage.setItem("user", JSON.stringify(res.data));
          // Also refresh posts to update UI
          fetchPosts(); 
      } catch(err) {
          console.error(err);
      }
  };

  const handleLike = async (id) => {
    try {
      await API.post(`/posts/${id}/like`);
      fetchPosts(); 
    } catch (err) {
      console.error("Like Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      await API.post(`/posts/${postId}/comment`, { text });
      fetchPosts();
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  const handleFollow = async (authorId) => {
      // Optimistic Update
      const prevPosts = posts;
      const prevUser = user;
      
      // Update local posts state
      setPosts(posts.map(p => 
        p.author._id === authorId 
          ? { ...p, isFollowing: true } 
          : p
      ));

      // Update local user state if exists
      if (user) {
        const updatedUser = { ...user, following: [...(user.following || []), authorId] };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      try {
          await API.post(`/user/${authorId}/follow`);
          // user data is already updated in localStorage optimistically, but we might want to fetch fresh data eventually
          // refreshUser(); 
      } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || "Follow failed");
          // Revert on failure
          setPosts(prevPosts);
          if (prevUser) localStorage.setItem("user", JSON.stringify(prevUser));
      }
  };

  const handleUnfollow = async (authorId) => {
      // Optimistic Update
      const prevPosts = posts;
      const prevUser = user;

      setPosts(posts.map(p => 
        p.author._id === authorId 
          ? { ...p, isFollowing: false } 
          : p
      ));

      if (user) {
         const updatedUser = { 
           ...user, 
           following: (user.following || []).filter(id => id !== authorId) 
         };
         localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      try {
          await API.post(`/user/${authorId}/unfollow`);
      } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || "Unfollow failed");
          setPosts(prevPosts);
          if (prevUser) localStorage.setItem("user", JSON.stringify(prevUser));
      }
  };

  return (
    <>
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
           Stories & Ideas
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A community to share your journey through images, videos, and words.
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {posts && posts.length ? (
            posts.map((p) => (
              <PostCard
                key={p._id}
                post={p}
                currentUser={user}
                onLike={handleLike}
                onDelete={handleDelete}
                onAddComment={handleAddComment}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share something amazing!</p>
                <Link to="/create" className="px-6 py-2 bg-primary text-white rounded-full hover:scale-105 transition btn">Create Post</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
