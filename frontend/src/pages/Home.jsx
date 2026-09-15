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
    if(user) refreshUser();
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
    const prevPosts = posts;
    if (!user) return alert("Please login to like posts");

    const userId = user._id || user.id;

    // Optimistic Update
    setPosts(prevPosts.map(p => {
        if (p._id === id) {
            const alreadyLiked = p.likes.includes(userId);
            const newLikes = alreadyLiked 
                ? p.likes.filter(uid => uid !== userId)
                : [...p.likes, userId];
            return { ...p, likes: newLikes };
        }
        return p;
    }));

    try {
      await API.post(`/posts/${id}/like`);
    } catch (err) {
      console.error("Like Error:", err);
      setPosts(prevPosts);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error("Delete Error:", err);
      const msg = err.response?.data?.message || "Failed to delete";
      alert(msg);
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
      <header className="mb-8 border-b border-white/10 pb-8 md:mb-10 md:pb-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-3">The community journal</p>
            <h1 className="editorial-title mb-3 text-5xl font-semibold leading-none text-[#f5f3ed] md:text-6xl">Stories &amp; ideas</h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-400 md:text-lg">A community to share your journey through images, videos, and words.</p>
          </div>
          <Link to="/create" className="inline-flex shrink-0 items-center justify-center rounded-full px-5 py-3 text-sm btn">Write a story</Link>
        </div>
      </header>

      {loading ? (
        <Spinner />
      ) : (
        <div>
          <div className="mb-5 flex items-center justify-between"><p className="text-sm font-medium text-gray-300">Latest from the community</p><span className="eyebrow text-gray-500">{posts?.length || 0} stories</span></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.025] py-20 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share something amazing!</p>
                <Link to="/create" className="rounded-full px-5 py-2.5 text-sm btn">Write a post</Link>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </>
  );
}
