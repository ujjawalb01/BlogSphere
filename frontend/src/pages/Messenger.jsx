import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { BiArrowBack, BiEditAlt, BiSearch } from "react-icons/bi";
import ChatBox from "../components/ChatBox";
import API from "../api";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const scrollRef = useRef();
  const searchRef = useRef();
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
      socket.emit("join_room", user._id || user.id);
      const receiveMessage = (data) => {
        if (currentChat && data.senderId === currentChat._id) {
            setMessages((prev) => [...prev, {
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now()
            }]);
        }
      };
      socket.on("receive_message", receiveMessage);
      return () => socket.off("receive_message", receiveMessage);
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
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center py-2 md:min-h-[calc(100vh-170px)]">
    <div className="flex h-[calc(100vh-140px)] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#1b1c1a] shadow-2xl md:h-[680px] md:max-h-[calc(100vh-170px)]">
      {/* SIDEBAR */}
      <aside className={`w-full shrink-0 border-r border-white/10 bg-[#20211f] md:w-[320px] overflow-y-auto flex-col ${currentChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9ff65] text-sm font-bold text-[#202318]">{user?.name?.[0]?.toUpperCase() || "U"}</div>}
            <div><h2 className="text-sm font-semibold text-white">{user?.username || user?.name || "Messages"}</h2><p className="text-xs text-gray-500">BlogSphere Direct</p></div>
          </div>
          <button type="button" onClick={() => searchRef.current?.focus()} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white" aria-label="New message"><BiEditAlt size={20} /></button>
        </div>
        <div className="px-5 pt-5">
          <div className="mb-5 flex items-center justify-between"><h3 className="text-base font-semibold text-white">Messages</h3><span className="text-xs text-gray-500">{conversations.length}</span></div>
        
        {/* Search */}
        <div className="relative mb-5">
             <BiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input 
               ref={searchRef}
               type="text" 
               placeholder="Search users..." 
               className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white outline-none"
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

        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
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
              className={`flex cursor-pointer items-center space-x-3 rounded-xl border p-3.5 ${
                currentChat?._id === c._id ? "border-white/10 bg-white/[.09]" : "border-transparent hover:bg-white/[.055]"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                  alt=""
                  className="h-12 w-12 rounded-full border border-white/10 bg-gray-700 object-cover"
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
            <div className="mt-10 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-500">
                <p className="mb-2 font-medium text-gray-300">No conversations yet.</p>
                <p className="text-xs text-gray-500">Use search to start a conversation.</p>
            </div>
          )}
        </div>
      </aside>

      {/* CHAT AREA */}
      <div className={`min-w-0 flex-1 md:flex h-full ${!currentChat ? 'hidden' : 'block'}`}>
        {currentChat ? (
          <div className="h-full flex flex-col">
              {/* Mobile Header to Back */}
              <div className="flex items-center border-b border-white/10 bg-[#20211f] p-3 md:hidden">
                  <button onClick={() => setCurrentChat(null)} className="mr-3 rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Back to conversations">
                      <BiArrowBack size={20} />
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
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-[#1b1c1a] px-6 text-center text-gray-400">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 text-3xl">✦</div>
            <p className="text-lg font-semibold text-gray-100">Your messages</p>
            <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-gray-500">Search for someone from the inbox to begin a private conversation.</p>
            <button type="button" onClick={() => searchRef.current?.focus()} className="mt-5 text-sm font-semibold text-[#d9ff65] hover:text-white">New message →</button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
