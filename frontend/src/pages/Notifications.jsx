import React, { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaUserPlus, FaRegNewspaper, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";

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
      
      // Mark as read immediately if there are unread items
      const hasUnread = res.data.some(n => !n.read);
      if (hasUnread) {
          await API.put("/notifications/read");
          // Dispatch event to update Navbar badges immediately
          window.dispatchEvent(new Event("refreshCounts"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like": return <FaHeart className="text-red-500 text-xl" />;
      case "comment": return <FaComment className="text-blue-500 text-xl" />;
      case "follow": return <FaUserPlus className="text-green-500 text-xl" />;
      case "friend_post": return <FaRegNewspaper className="text-purple-500 text-xl" />;
      default: return <FaBell className="text-gray-400 text-xl" />;
    }
  };

  const getMessage = (n) => {
      switch(n.type) {
          case "like": return "liked your post";
          case "comment": return "commented on your post";
          case "follow": return "started following you";
          case "friend_post": return "posted a new update";
          default: return "interacted with you";
      }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Notifications
          </h2>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-indigo-300 border border-white/5">
              {notifications.filter(n => !n.read).length} New
          </span>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRegNewspaper className="text-2xl text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">No notifications yet</p>
          <p className="text-gray-600 text-sm mt-2">When people interact with you, it will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={n._id} 
              className={`relative overflow-hidden flex items-start space-x-4 p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                !n.read 
                    ? "bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
              }`}
            >
              {/* Unread Indicator Dot */}
              {!n.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
              )}

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-inner shrink-0">
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <Link to={`/profile/${n.sender._id}`}>
                            <img 
                            src={n.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender.name}`} 
                            alt={n.sender.name}
                            className="w-6 h-6 rounded-full object-cover border border-white/20"
                            />
                        </Link>
                        <Link to={`/profile/${n.sender._id}`} className="font-bold text-white hover:text-indigo-400 transition-colors truncate max-w-[150px]">
                            {n.sender.name}
                        </Link>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500 space-x-1">
                        <FaClock />
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {getMessage(n)}
                </p>

                {/* Additional Context (Post Title or Comment) */}
                {n.post && (n.type === "like" || n.type === "comment" || n.type === "friend_post") && (
                   <Link 
                        to={`/post/${n.post._id || n.post}`} 
                        className="mt-3 block p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition group"
                   >
                     <p className="text-xs text-indigo-300 font-medium group-hover:text-indigo-200 truncate">
                        {n.post.title || "View Post Content"}
                     </p>
                   </Link>
                )}
                
                {n.text && n.type === "comment" && (
                    <div className="mt-2 text-xs text-gray-400 italic border-l-2 border-gray-600 pl-2">
                        "{n.text}"
                    </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
