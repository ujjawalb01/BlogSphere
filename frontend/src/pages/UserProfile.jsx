// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import UserListModal from "../components/UserListModal";

export default function UserProfile() {
  const { id } = useParams();
  const loggedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch user details
    API.get(`/user/${id}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("User Fetch Error:", err?.response?.data || err.message || err);
      });

    // Fetch stats
    API.get(`/user/${id}/stats`)
      .then((res) => {
        setStats(res.data);
        // defensive check: stats may provide followersList or followers array of ids
        const followersList = res.data.followersList || res.data.followers || [];
        if (loggedUser && (followersList.includes?.(loggedUser.id) || followersList.includes?.(loggedUser._id))) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      })
      .catch((err) => {
        console.error("Stats Error:", err?.response?.data || err.message || err);
      });

    // Fetch posts
    API.get(`/posts?author=${id}`)
      .then((res) => {
        setPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Posts Error:", err?.response?.data || err.message || err);
      });
  }, [id]);

  // Follow user
  // Follow user
  const follow = async () => {
    // Optimistic
    setIsFollowing(true);
    setStats((s) => (s ? { ...s, followers: (s.followers || 0) + 1 } : s));

    if (loggedUser) {
        const updatedUser = { ...loggedUser, following: [...(loggedUser.following || []), id] };
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    try {
      await API.post(`/user/${id}/follow`);
    } catch (err) {
      console.error("Follow error:", err?.response?.data || err.message || err);
      // Revert
      setIsFollowing(false);
      setStats((s) => (s ? { ...s, followers: Math.max((s.followers || 1) - 1, 0) } : s));
      if (loggedUser) localStorage.setItem("user", JSON.stringify(loggedUser));
      alert("Follow failed");
    }
  };

  // Unfollow
  const unfollow = async () => {
    // Optimistic
    setIsFollowing(false);
    setStats((s) => (s ? { ...s, followers: Math.max((s.followers || 1) - 1, 0) } : s));

    if (loggedUser) {
        const updatedUser = { 
           ...loggedUser, 
           following: (loggedUser.following || []).filter(uid => uid !== id) 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    try {
      await API.post(`/user/${id}/unfollow`);
    } catch (err) {
      console.error("Unfollow error:", err?.response?.data || err.message || err);
      // Revert
      setIsFollowing(true);
      setStats((s) => (s ? { ...s, followers: (s.followers || 0) + 1 } : s));
      if (loggedUser) localStorage.setItem("user", JSON.stringify(loggedUser));
      alert("Unfollow failed");
    }
  };

  // Handle stat click
  const handleStatClick = async (type) => {
    if (!id) return;
    try {
      setLoadingModal(true);
      if (type === "followers") {
        const res = await API.get(`/user/${id}/followers`);
        console.log("followers response:", res.data);
        setModalTitle("Followers");
        setModalUsers(res.data || []);
        setShowModal(true);
      } else if (type === "following") {
        const res = await API.get(`/user/${id}/following`);
        console.log("following response:", res.data);
        setModalTitle("Following");
        setModalUsers(res.data || []);
        setShowModal(true);
      } else if (type === "posts") {
        document.getElementById("posts-section")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("handleStatClick error:", err?.response?.data || err.message || err);
      alert("Failed to fetch list. See console/network for details.");
    } finally {
      setLoadingModal(false);
    }
  };

  if (!user) {
    return <div className="text-center text-indigo-200 mt-20">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      <div className="card p-8 rounded-xl mb-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-white/10 text-3xl flex items-center justify-center font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="text-indigo-300">@{user.username}</p>
              <p className="text-indigo-300">{user.email}</p>
            </div>
          </div>

          {loggedUser && (loggedUser.id !== id && loggedUser._id !== id) && (
            <div className="flex items-center space-x-3">
              <Link 
                to="/messenger" 
                state={{ chatUser: user }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md btn hover:bg-indigo-500"
              >
                Message
              </Link>
              {isFollowing ? (
                <button onClick={unfollow} className="px-4 py-2 bg-red-500 text-white rounded-md btn">
                  Unfollow
                </button>
              ) : (
                <button onClick={follow} className="px-4 py-2 bg-primary text-white rounded-md btn">
                  Follow
                </button>
              )}
            </div>
          )}
        </div>

        {stats && (
          <div className="flex justify-between text-center mt-8 bg-white/5 p-4 rounded-lg border border-white/10">
            <Stat title="Followers" value={stats.followers || 0} onClick={() => handleStatClick("followers")} />
            <Stat title="Following" value={stats.following || 0} onClick={() => handleStatClick("following")} />
            <Stat title="Posts" value={stats.posts || 0} onClick={() => handleStatClick("posts")} />
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold mb-4" id="posts-section">Posts</h3>

      {posts.length === 0 ? (
        <p className="text-indigo-300">This user has not posted anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`} className="rounded-xl overflow-hidden card bg-white/5 hover:bg-white/10 transition">
              {post.mediaUrl ? (
                post.mediaType === "image" ? (
                  <img src={post.mediaUrl} className="w-full h-56 object-cover" alt={post.title} />
                ) : (
                  <video className="w-full h-56 object-cover" muted autoPlay loop>
                    <source src={post.mediaUrl} />
                  </video>
                )
              ) : (
                <div className="h-56 bg-white/10 flex items-center justify-center text-indigo-300">No Media</div>
              )}

              <div className="p-4">
                <h4 className="font-semibold text-lg text-white">{post.title}</h4>
                <p className="text-indigo-300 text-sm line-clamp-2 mt-1">{post.content}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <UserListModal
          title={modalTitle}
          users={modalUsers}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function Stat({ title, value, onClick }) {
  return (
    <button onClick={onClick} className="flex-1 text-center cursor-pointer p-2 rounded-lg hover:bg-white/10 transition">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-indigo-300 text-sm">{title}</div>
    </button>
  );
}
