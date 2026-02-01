import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(q);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchTerm(q);
    if (!q) {
        setUsers([]);
        setPosts([]);
        setLoading(false);
        return;
    }

    setLoading(true);

    Promise.all([
      API.get(`/user/search?q=${q}`),
      API.get(`/posts/search?q=${q}`)
    ])
      .then(([uRes, pRes]) => {
        setUsers(uRes.data);
        setPosts(pRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setParams({ q: searchTerm });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 text-white">
      
      {/* Mobile Search Input */}
      <form onSubmit={handleSearch} className="mb-8 relative">
        <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users or posts..."
            className="w-full bg-white/10 border border-white/10 rounded-full px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg shadow-lg"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 font-semibold px-4 py-1 hover:text-white transition">
            Search
        </button>
      </form>

      {!q ? (
         <div className="text-center py-20 text-gray-500 animate-fade-in">
             <div className="text-6xl mb-6 opacity-30">🔍</div>
             <p className="text-xl font-medium">Find friends and interesting stories</p>
             <p className="text-sm mt-2 opacity-60">Enter a name or topic above to get started</p>
         </div>
      ) : (
        <>
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
                Results for <span className="text-indigo-300">"{q}"</span>
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
        </>
      )}
    </div>
  );
}
