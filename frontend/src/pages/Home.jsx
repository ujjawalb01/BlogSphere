import React, { useEffect, useState } from "react";
import API from "../api";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);

    try {
      const res = await API.get("/posts");

      const data = res.data.map((p) => ({
        ...p,
        canDelete: user && p.author && p.author._id === user.id,
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

  // Like post
  const handleLike = async (id) => {
    try {
      await API.post(`/posts/${id}/like`);
      fetchPosts();
    } catch (err) {
      console.error("Like Error:", err);
    }
  };

  // Delete post
  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;

    try {
      await API.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // Add comment
  const handleAddComment = async (postId, text) => {
    try {
      await API.post(`/posts/${postId}/comment`, { text });
      fetchPosts(); // Refresh after comment
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  return (
    <>
      {/* Hero Header */}
      <header className="mb-8">
        <div className="rounded-xl card p-6">
          <h1 className="text-3xl font-bold">Discover stories from creators</h1>
          <p className="mt-2 text-indigo-200">
            Create, share and engage — beautiful posts with images and videos.
          </p>
        </div>
      </header>

      {/* Posts Grid */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {posts && posts.length ? (
            posts.map((p) => (
              <PostCard
                key={p._id}
                post={p}
                onLike={handleLike}
                onDelete={handleDelete}
                onAddComment={handleAddComment}

                // Follow/Unfollow not used on Home page
                onFollow={() => {}}
                onUnfollow={() => {}}
              />
            ))
          ) : (
            <div className="text-indigo-200">
              No posts yet. Be the first to create one!
            </div>
          )}
        </div>
      )}
    </>
  );
}
