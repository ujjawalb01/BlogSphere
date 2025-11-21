import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";

export default function UserProfile() {
  const { id } = useParams();
  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch user details
    API.get(`/user/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.log("User Fetch Error:", err));

    // Fetch stats
    API.get(`/user/${id}/stats`)
      .then((res) => {
        setStats(res.data);
        if (res.data.followersList?.includes(loggedUser.id)) {
          setIsFollowing(true);
        }
      })
      .catch((err) => console.log("Stats Error:", err));

    // Fetch posts
    API.get(`/posts?author=${id}`)
      .then((res) => {
        const filtered = res.data.filter((p) => p.author?._id === id);
        setPosts(filtered);
      })
      .catch((err) => console.log("Posts Error:", err));
  }, [id]);

  if (!user)
    return (
      <div className="text-center text-indigo-200 mt-20">
        Loading profile...
      </div>
    );

  const follow = async () => {
    try {
      await API.post(`/user/${id}/follow`);
      setIsFollowing(true);
      setStats({ ...stats, followers: stats.followers + 1 });
    } catch (err) {
      console.log(err);
    }
  };

  const unfollow = async () => {
    try {
      await API.post(`/user/${id}/unfollow`);
      setIsFollowing(false);
      setStats({ ...stats, followers: stats.followers - 1 });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">

      {/* PROFILE HEADER */}
      <div className="card p-8 rounded-xl mb-10 relative">

        <div className="flex items-center justify-between">
          {/* Avatar + Info */}
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

          {/* Follow Button (hide on own profile) */}
          {loggedUser.id !== id && (
            <div>
              {isFollowing ? (
                <button
                  onClick={unfollow}
                  className="px-4 py-2 bg-red-500 text-white rounded-md btn"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={follow}
                  className="px-4 py-2 bg-primary text-white rounded-md btn"
                >
                  Follow
                </button>
              )}
            </div>
          )}
        </div>

        {/* USER STATS */}
        {stats && (
          <div className="flex justify-between text-center mt-8 bg-white/5 p-4 rounded-lg border border-white/10">
            <Stat title="Followers" value={stats.followers} />
            <Stat title="Following" value={stats.following} />
            <Stat title="Posts" value={stats.posts} />
          </div>
        )}
      </div>

      {/* POSTS GRID */}
      <h3 className="text-xl font-semibold mb-4">Posts</h3>

      {posts.length === 0 ? (
        <p className="text-indigo-300">This user has not posted anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              className="rounded-xl overflow-hidden card bg-white/5 hover:bg-white/10 transition"
            >
              {/* MEDIA */}
              {post.mediaUrl ? (
                post.mediaType === "image" ? (
                  <img src={post.mediaUrl} className="w-full h-56 object-cover" />
                ) : (
                  <video className="w-full h-56 object-cover" muted autoPlay loop>
                    <source src={post.mediaUrl} />
                  </video>
                )
              ) : (
                <div className="h-56 bg-white/10 flex items-center justify-center text-indigo-300">
                  No Media
                </div>
              )}

              <div className="p-4">
                <h4 className="font-semibold text-lg text-white">{post.title}</h4>
                <p className="text-indigo-300 text-sm line-clamp-2 mt-1">
                  {post.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* STAT BOX COMPONENT */
function Stat({ title, value }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-indigo-300 text-sm">{title}</div>
    </div>
  );
}
