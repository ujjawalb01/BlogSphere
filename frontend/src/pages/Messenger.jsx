import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import API from "../api";

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
             const res = await API.get("/messages/conversations");
             // Response is [{ user: {...}, lastMessage: {...} }]
             setConversations(res.data);
        } catch(err) {
            console.error(err);
        }
    };
    if(user) fetchConversations();
  }, [user?._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const res = await API.get(`/messages/${currentChat._id}`);
        setMessages(res.data);
        
        // Mark as read
        await API.put("/messages/read", { senderId: currentChat._id });
        
        // Trigger navbar update
        window.dispatchEvent(new Event("refreshCounts"));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [currentChat]);

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex gap-4 relative">
      {/* SIDEBAR */}
      <div className={`w-full md:w-1/3 glass rounded-xl p-4 overflow-y-auto flex-col ${currentChat ? 'hidden md:flex' : 'flex'}`}>
        <h2 className="text-xl font-bold mb-4 text-white">Direct Messages</h2>
        
        {/* Search */}
        <div className="mb-4 relative">
             <input 
               type="text" 
               placeholder="Search users..." 
               className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
               onChange={(e) => {
                   const q = e.target.value;
                   
                   // Clear timeout if exists
                   if (window.searchTimeout) clearTimeout(window.searchTimeout);

                   window.searchTimeout = setTimeout(async () => {
                       try {
                           if(!q.trim()) {
                               const res = await API.get("/messages/conversations");
                               setConversations(res.data);
                               return;
                           }
                           const res = await API.get(`/user/search?q=${q}`);
                           setConversations(res.data);
                       } catch(err) {
                           console.error(err);
                       }
                   }, 500);
               }}
             />
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {conversations.map((item) => {
             // Handle both structure types:
             // 1. Conversation object: { user: {...}, lastMessage: {...} }
             // 2. Search result (User object): { _id: ..., name: ... }
             const c = item.user || item; 
             const lastMsg = item.lastMessage?.text;
             const isMe = item.lastMessage?.sender === user._id;
             const isRead = item.lastMessage ? (isMe || item.lastMessage.isRead) : true;

             if (!c || !c._id) return null;

             return (
            <div
              key={c._id}
              onClick={() => setCurrentChat(c)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentChat?._id === c._id ? "bg-indigo-600/30 border border-indigo-500/50" : "hover:bg-white/5"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                  alt=""
                  className="w-12 h-12 rounded-full bg-gray-700 object-cover border border-white/10"
                />
                {!isMe && !isRead && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm truncate ${!isRead ? "font-bold text-white" : "font-medium text-gray-200"}`}>
                        {c.name}
                    </h3>
                    {item.lastMessage && (
                        <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                             {new Date(item.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <p className={`text-xs truncate ${!isRead ? "font-bold text-gray-100" : "text-gray-400"}`}>
                    {lastMsg ? (
                        <>
                            {isMe && "You: "} {lastMsg}
                        </>
                    ) : (
                        <span className="italic opacity-50">Draft</span>
                    )}
                </p>
              </div>
            </div>
          )})}
          {conversations.length === 0 && (
            <div className="text-gray-500 text-sm text-center mt-10 p-4">
                <p className="mb-2">No active chats.</p> 
                <p className="text-xs text-gray-600">Search for a friend to start a conversation.</p>
            </div>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 md:flex h-full ${!currentChat ? 'hidden' : 'block'}`}>
        {currentChat ? (
          <div className="h-full flex flex-col">
              {/* Mobile Header to Back */}
              <div className="md:hidden flex items-center p-2 border-b border-white/10">
                  <button onClick={() => setCurrentChat(null)} className="mr-3 text-gray-400 hover:text-white">
                      ← Back
                  </button>
                  <img src={currentChat.avatar} className="w-8 h-8 rounded-full mr-2"/>
                  <span className="font-bold text-white">{currentChat.name}</span>
              </div>
              <ChatBox
                currentChat={currentChat}
                currentUser={user}
                socket={socket}
                messages={messages}
                setMessages={setMessages}
              />
          </div>
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
