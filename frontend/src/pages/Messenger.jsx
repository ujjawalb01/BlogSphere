import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import ChatBox from "../components/ChatBox";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const scrollRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Handle incoming chat request from other pages
  useEffect(() => {
    if (location.state?.chatUser) {
      const chatUser = location.state.chatUser;
      setCurrentChat(chatUser);
      setConversations(prev => {
        if (!prev.find(c => c._id === chatUser._id)) {
          return [chatUser, ...prev];
        }
        return prev;
      });
      // Clear state to prevent resetting on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (socket && user) {
      socket.emit("join_room", user._id);
      socket.on("receive_message", (data) => {
        if (currentChat && data.senderId === currentChat._id) {
            setMessages((prev) => [...prev, {
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now()
            }]);
        }
      });
    }
  }, [socket, user, currentChat]);

  // Fetch "sidebar" users (For now, fetch all users or following)
  // To keep it simple, let's fetch users we follow
  useEffect(() => {
    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem("token");
            // Fetch real conversations
             const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/messages/conversations`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             const data = await res.json();
             // The endpoint returns { user, lastMessage }. We just want the user list for now + last message maybe?
             // For simplicity in this structure:
             const users = data.map(item => item.user);
             setConversations(users);
        } catch(err) {
            console.error(err);
        }
    };
    if(user) fetchConversations();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/messages/${currentChat._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [currentChat]);

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* SIDEBAR */}
      <div className="w-1/3 glass rounded-xl p-4 overflow-y-auto hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-white">Direct Messages</h2>
        
        {/* Search */}
        <div className="mb-4 relative">
             <input 
               type="text" 
               placeholder="Search users..." 
               className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
               onChange={async (e) => {
                   const q = e.target.value;
                   if(!q.trim()) {
                       // Reload conversations
                       const token = localStorage.getItem("token");
                       if(token) {
                           const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/messages/conversations`, {
                             headers: { Authorization: `Bearer ${token}` }
                           });
                           const data = await res.json();
                           // Mapping format from backend {user, lastMessage} -> user object
                           setConversations(data.map(c => c.user));
                       }
                       return;
                   }
                   // Search for users
                   try {
                       const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/user/search?q=${q}`);
                       const data = await res.json();
                       setConversations(data);
                   } catch(err) {
                       console.error(err);
                   }
               }}
             />
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c._id}
              onClick={() => setCurrentChat(c)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentChat?._id === c._id ? "bg-indigo-600/30 border border-indigo-500/50" : "hover:bg-white/5"
              }`}
            >
              <div className="relative">
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                  alt=""
                  className="w-10 h-10 rounded-full bg-gray-700 object-cover"
                />
                {/* Online indicator could go here */}
              </div>
              <div>
                <h3 className="font-medium text-white">{c.name}</h3>
                <p className="text-xs text-gray-400">@{c.username || "user"}</p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-gray-500 text-sm text-center mt-10">
                No conversations found. Search for a user to start chatting.
            </div>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1">
        {currentChat ? (
          <ChatBox
            currentChat={currentChat}
            currentUser={user}
            socket={socket}
            messages={messages}
            setMessages={setMessages}
          />
        ) : (
          <div className="h-full glass rounded-xl flex items-center justify-center text-gray-400 flex-col">
            <div className="text-6xl mb-4">💬</div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
