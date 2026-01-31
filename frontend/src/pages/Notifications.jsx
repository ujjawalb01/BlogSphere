import React, { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaUserPlus } from "react-icons/fa";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
      // Mark as read after fetching
      if (res.data.length > 0) {
          await API.put("/notifications/read");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like": return <FaHeart className="text-red-500" />;
      case "comment": return <FaComment className="text-blue-500" />;
      case "follow": return <FaUserPlus className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
      
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white/5 rounded-xl border border-white/10">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n._id} 
              className={`flex items-center space-x-4 p-4 rounded-xl border transition ${
                !n.read ? "bg-white/10 border-indigo-500/50" : "bg-white/5 border-white/5"
              }`}
            >
              <div className="p-2 bg-white/5 rounded-full">
                {getIcon(n.type)}
              </div>
              
              <Link to={`/profile/${n.sender._id}`} className="shrink-0">
                <img 
                  src={n.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender.name}`} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>

              <div className="flex-1">
                <p className="text-white text-sm">
                  <span className="font-bold">{n.sender.name}</span>
                  {" "}
                  {n.type === "like" && "liked your post"}
                  {n.type === "comment" && "commented on your post"}
                  {n.type === "follow" && "started following you"}
                </p>
                {n.post && (n.type === "like" || n.type === "comment") && (
                   <Link to={`/post/${n.post._id || n.post}`} className="text-xs text-indigo-300 hover:underline line-clamp-1 block mt-1">
                     {n.post.title || "View Post"}
                   </Link>
                )}
                {n.text && <p className="text-xs text-gray-400 mt-1 italic">"{n.text}"</p>}
                <p className="text-[10px] text-gray-500 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
