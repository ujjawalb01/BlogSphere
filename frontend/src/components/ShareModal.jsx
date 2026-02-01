import React, { useState, useEffect } from "react";
import API from "../api";
import { FaSearch, FaPaperPlane, FaTimes, FaCheck } from "react-icons/fa";

export default function ShareModal({ post, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
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

  const toggleSelect = (userId) => {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId) 
          : [...prev, userId]
      );
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0) return;
    
    setSending(true);
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      const text = `Check out this post: ${post.title}\n${postUrl}`;
      
      const promises = selectedUsers.map(receiverId => 
          API.post("/messages", {
            receiverId,
            text
          })
      );

      await Promise.all(promises);
      
      onClose();
    } catch (err) {
      alert("Failed to send");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Share Post</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <FaTimes />
            </button>
        </div>
        
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={query}
            onChange={handleSearch}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="overflow-y-auto space-y-2 pr-2 flex-1 min-h-0">
          {loading ? (
            <p className="text-center text-gray-500 text-sm py-4">Searching...</p>
          ) : results.length > 0 ? (
            results.map(u => {
              const isSelected = selectedUsers.includes(u._id);
              return (
                  <div 
                    key={u._id} 
                    onClick={() => toggleSelect(u._id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${isSelected ? "bg-indigo-500/20 border border-indigo-500/50" : "hover:bg-white/5 border border-transparent"}`}
                  >
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
                    
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-gray-500"}`}>
                        {isSelected && <FaCheck size={12} className="text-white" />}
                    </div>
                  </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 text-sm py-8">
              {query ? "No users found" : "You follow no one yet"}
            </p>
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="mt-4 pt-4 border-t border-white/10">
            <button
                onClick={handleSend}
                disabled={selectedUsers.length === 0 || sending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {sending ? (
                    <span>Sending...</span>
                ) : (
                    <>
                        <FaPaperPlane />
                        <span>Send to {selectedUsers.length > 0 ? `${selectedUsers.length} people` : "Selected"}</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
