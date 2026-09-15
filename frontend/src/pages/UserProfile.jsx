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
    return <div className="mt-20 text-center text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl py-2 text-white md:py-4">
      <div className="glass-card relative mb-10 overflow-hidden p-6 md:p-8">

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#d9ff65]/70 bg-[#282926] md:h-28 md:w-28">
               <div className="h-full w-full overflow-hidden rounded-full bg-gray-900">
                   {user.avatar ? (
                       <img src={user.avatar} className="w-full h-full object-cover" />
                   ) : (
                       <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#d9ff65]">
                           {user.name?.charAt(0).toUpperCase()}
                       </span>
                   )}
               </div>
            </div>
            <div>
              <p className="eyebrow mb-2">Member profile</p>
              <h2 className="editorial-title mb-1 text-4xl font-semibold text-white">{user.name}</h2>
              <p className="text-sm text-gray-400">@{user.username}</p>
              {/* Optional: Add bio if available */}
            </div>
          </div>

          {loggedUser && (loggedUser.id !== id && loggedUser._id !== id) && (
            <div className="flex items-center space-x-3 w-full md:w-auto justify-center">
              <Link 
                to="/messenger" 
                state={{ chatUser: user }}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Message
              </Link>
              {isFollowing ? (
                <button onClick={unfollow} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-gray-300 hover:border-red-400/60 hover:text-red-300">
                  Following
                </button>
              ) : (
                <button onClick={follow} className="rounded-full px-5 py-2.5 text-sm btn">
                  Follow
                </button>
              )}
            </div>
          )}
        </div>

        {stats && (
          <div className="mt-8 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/15 p-2">
            <Stat title="Followers" value={stats.followers || 0} onClick={() => handleStatClick("followers")} />
            <Stat title="Following" value={stats.following || 0} onClick={() => handleStatClick("following")} />
            <Stat title="Posts" value={stats.posts || 0} onClick={() => handleStatClick("posts")} />
          </div>
        )}
      </div>

      <p className="eyebrow mb-2" id="posts-section">Published work</p>
      <h3 className="editorial-title mb-5 text-3xl font-semibold">Posts</h3>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 py-12 text-center text-gray-400">This user has not posted anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`} className="card group overflow-hidden rounded-xl">
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
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{post.content}</p>
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
    <button onClick={onClick} className="flex-1 rounded-lg p-3 text-center hover:bg-white/10">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{title}</div>
    </button>
  );
}
