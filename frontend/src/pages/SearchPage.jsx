import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q");

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;

    setLoading(true);

    Promise.all([
      API.get(`/user/search?q=${q}`),   // ✅ FIXED
      API.get(`/posts/search?q=${q}`)   // ✅ FIXED
    ])
      .then(([uRes, pRes]) => {
        setUsers(uRes.data);
        setPosts(pRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [q]);

  if (loading)
    return (
      <div className="text-center mt-20 text-indigo-200 text-xl">
        Searching...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">

      <h2 className="text-3xl font-semibold mb-8">
        Search results for <span className="text-indigo-300">"{q}"</span>
      </h2>

      {/* USERS */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-indigo-200">Users</h3>

        {users.length === 0 ? (
          <p className="text-indigo-300">No users found</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition shadow border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-indigo-100 font-semibold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-indigo-300 text-sm">@{u.username}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* POSTS */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-indigo-200">Posts</h3>

        {posts.length === 0 ? (
          <p className="text-indigo-300">No posts found</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <Link
                key={p._id}
                to={`/post/${p._id}`}
                className="block p-5 rounded-lg bg-white/5 hover:bg-white/10 transition shadow border border-white/10"
              >
                <div className="font-semibold text-lg text-white">{p.title}</div>
                <div className="text-indigo-300 text-sm mt-1">
                  {p.author?.name} • {new Date(p.createdAt).toLocaleDateString()}
                </div>
                <p className="text-indigo-200 text-sm mt-2 line-clamp-2">
                  {p.content}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
