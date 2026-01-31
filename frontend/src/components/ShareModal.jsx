import React, { useState, useEffect } from "react";
import API from "../api";
import { FaSearch, FaPaperPlane, FaTimes } from "react-icons/fa";

export default function ShareModal({ post, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      setLoading(true);
      API.get(`/user/${user._id}/following`)
        .then(res => setResults(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    
    if (!q.trim()) {
      // Revert to following list
      if (user) {
        setLoading(true);
        API.get(`/user/${user._id}/following`)
          .then(res => setResults(res.data))
          .catch(console.error)
          .finally(() => setLoading(false));
      }
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/user/search?q=${q}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (user) => {
    setSendingId(user._id);
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      const text = `Check out this post: ${post.title}\n${postUrl}`;
      
      await API.post("/messages", {
        receiverId: user._id,
        text: text
      });
      alert(`Sent to ${user.name}`);
    } catch (err) {
      alert("Failed to send");
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <FaTimes />
        </button>

        <h3 className="text-xl font-bold text-white mb-4">Share Post</h3>
        
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={query}
            onChange={handleSearch}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {loading ? (
            <p className="text-center text-gray-500 text-sm">Searching...</p>
          ) : results.length > 0 ? (
            results.map(u => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition">
                <div className="flex items-center space-x-3">
                  <img 
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} 
                    alt="" 
                    className="w-10 h-10 rounded-full bg-gray-700"
                  />
                  <div>
                    <h4 className="font-semibold text-white text-sm">{u.name}</h4>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSend(u)}
                  disabled={sendingId === u._id}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  <FaPaperPlane size={12} />
                </button>
              </div>
            ))
          ) : query && (
             <p className="text-center text-gray-500 text-sm">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}
