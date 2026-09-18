import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import {
  BiArrowBack,
  BiSearch,
  BiMessageRoundedDots,
  BiEditAlt
} from "react-icons/bi";
import ChatBox from "../components/ChatBox";
import API from "../api";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const searchRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socketUrl = apiUrl.replace("/api", "");
    const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Handle incoming chat request from other pages (e.g. from UserProfile)
  useEffect(() => {
    if (location.state?.chatUser) {
      const chatUser = location.state.chatUser;
      setCurrentChat(chatUser);
      setConversations((prev) => {
        if (!prev.find((c) => (c.user?._id || c._id) === chatUser._id)) {
          return [chatUser, ...prev];
        }
        return prev;
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (socket && user) {
      socket.emit("join_room", user._id || user.id);
      const receiveMessage = (data) => {
        if (currentChat && data.senderId === currentChat._id) {
          setMessages((prev) => [
            ...prev,
            {
              sender: data.senderId,
              text: data.text,
              createdAt: Date.now(),
            },
          ]);
        }
      };
      socket.on("receive_message", receiveMessage);
      return () => socket.off("receive_message", receiveMessage);
    }
  }, [socket, user, currentChat]);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get("/messages/conversations");
        setConversations(res.data || []);
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };
    if (user) fetchConversations();
  }, [user?._id || user?.id]);

  // Fetch messages for active chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const res = await API.get(`/messages/${currentChat._id}`);
        setMessages(res.data || []);

        await API.put("/messages/read", { senderId: currentChat._id });
        window.dispatchEvent(new Event("refreshCounts"));
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();
  }, [currentChat]);

  const handleSearchUsers = (e) => {
    const q = e.target.value;
    if (window.searchTimeout) clearTimeout(window.searchTimeout);

    window.searchTimeout = setTimeout(async () => {
      try {
        if (!q.trim()) {
          const res = await API.get("/messages/conversations");
          setConversations(res.data || []);
          return;
        }
        const res = await API.get(`/user/search?q=${encodeURIComponent(q)}`);
        setConversations(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  return (
    <div className="w-full page-fade-in py-2">
      <div className="editorial-card h-[calc(100vh-140px)] min-h-[520px] max-h-[760px] rounded-3xl overflow-hidden shadow-card flex">
        
        {/* SIDEBAR CONVERSATIONS LIST */}
        <aside
          className={`w-full md:w-80 lg:w-96 border-r border-[var(--line)] bg-[var(--surface-hover)] flex-col shrink-0 ${
            currentChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-[var(--ink)]">Messages</h2>
              <p className="text-[11px] text-[var(--ink-muted)]">Direct conversations</p>
            </div>
            <button
              type="button"
              onClick={() => searchRef.current?.focus()}
              className="p-2 rounded-full hover:bg-[var(--surface)] text-[var(--ink-secondary)] transition"
              title="New message"
            >
              <BiEditAlt size={19} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-4 border-b border-[var(--line)]">
            <div className="relative">
              <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] text-base" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search connections..."
                onChange={handleSearchUsers}
                className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2 pl-9 pr-4 text-xs text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((item) => {
              const c = item.user || item;
              const lastMsg = item.lastMessage?.text;
              const isMe = item.lastMessage?.sender === (user?._id || user?.id);
              const isRead = item.lastMessage ? isMe || item.lastMessage.isRead : true;

              if (!c || !c._id) return null;

              const isSelected = currentChat?._id === c._id;

              return (
                <div
                  key={c._id}
                  onClick={() => setCurrentChat(c)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition ${
                    isSelected
                      ? "bg-[var(--surface)] border-[var(--line-strong)] shadow-sm"
                      : "border-transparent hover:bg-[var(--surface)]/70"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-11 w-11 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--accent)]">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        (c.name?.charAt(0) || "U").toUpperCase()
                      )}
                    </div>

                    {!isMe && !isRead && (
                      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-rose-500 border-2 border-[var(--surface)]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs truncate ${!isRead ? "font-bold text-[var(--ink)]" : "font-medium text-[var(--ink-secondary)]"}`}>
                        {c.name}
                      </h4>
                      {item.lastMessage && (
                        <span className="text-[10px] text-[var(--ink-muted)] font-mono shrink-0">
                          {new Date(item.lastMessage.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${!isRead ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-muted)]"}`}>
                      {lastMsg ? (
                        <>
                          {isMe && <span className="text-[var(--ink-muted)]">You: </span>}
                          {lastMsg}
                        </>
                      ) : (
                        <span className="italic opacity-60">Tap to chat</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            {conversations.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--ink-muted)] italic">
                No active conversations yet. Search above to start chatting with members.
              </div>
            )}
          </div>
        </aside>

        {/* ACTIVE CHAT WORKSPACE */}
        <div className={`flex-1 flex-col h-full bg-[var(--surface)] min-w-0 ${!currentChat ? "hidden md:flex" : "flex"}`}>
          {currentChat ? (
            <div className="h-full flex flex-col">
              {/* Mobile Back Header */}
              <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--surface-hover)] p-3 md:hidden">
                <button
                  type="button"
                  onClick={() => setCurrentChat(null)}
                  className="p-1.5 rounded-full hover:bg-[var(--surface)] text-[var(--ink-secondary)]"
                  aria-label="Back to conversations"
                >
                  <BiArrowBack size={20} />
                </button>
                <div className="h-7 w-7 rounded-full overflow-hidden bg-[var(--surface-raised)]">
                  {currentChat.avatar ? (
                    <img src={currentChat.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--accent)]">
                      {(currentChat.name?.charAt(0) || "U").toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-xs text-[var(--ink)] truncate">
                  {currentChat.name}
                </span>
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
            <div className="hidden md:flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-2xl text-[var(--accent)] mb-4">
                <BiMessageRoundedDots size={28} />
              </div>
              <h3 className="font-serif font-bold text-xl text-[var(--ink)] mb-1">
                Your Direct Messages
              </h3>
              <p className="text-xs text-[var(--ink-muted)] max-w-sm leading-relaxed mb-4">
                Select a conversation from the list or search for a writer to send private thoughts and feedback.
              </p>
              <button
                type="button"
                onClick={() => searchRef.current?.focus()}
                className="btn-secondary-editorial text-xs"
              >
                Search Members
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
