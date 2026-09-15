import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function ChatBox({ currentChat, currentUser, socket, messages, setMessages }) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: currentUserId,
      receiver: currentChat._id,
      text: newMessage,
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setMessages([...messages, message]);
    setNewMessage("");

    // Send to socket
    socket.emit("send_message", {
      senderId: currentUserId,
      receiverId: currentChat._id,
      text: newMessage,
    });

    // Save to DB
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: currentChat._id,
          text: newMessage,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#1b1c1a]">
      {/* HEADER */}
      <div className="flex items-center justify-center border-b border-white/10 bg-[#20211f] px-4 py-3">
        <div className="flex items-center gap-3">
          {currentChat?.avatar ? <img src={currentChat.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9ff65] text-sm font-bold text-[#202318]">{currentChat?.name?.[0]?.toUpperCase()}</div>}
          <div className="text-left"><h3 className="text-sm font-semibold text-white">{currentChat?.name}</h3><p className="text-[11px] text-gray-500">@{currentChat?.username || "member"}</p></div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6 md:px-8">
        {messages.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center"><div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#282926] text-xl">✦</div><p className="text-sm font-semibold text-gray-200">Say hello to {currentChat?.name}</p><p className="mt-1 text-xs text-gray-500">Messages here are private between the two of you.</p></div>}
        {messages.map((m, index) => (
          <div
            key={index}
            ref={scrollRef}
            className={`flex ${m.sender === currentUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] rounded-[20px] px-4 py-2.5 text-sm leading-relaxed ${
                m.sender === currentUserId
                  ? "bg-[#d9ff65] text-[#202318]"
                  : "bg-[#30312e] text-gray-100"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="border-t border-white/10 bg-[#20211f] p-4 md:px-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-white/10 bg-[#191a18] p-1.5 pl-4">
          <input
            type="text"
            className="flex-1 border-0 bg-transparent px-0 py-2 text-sm text-white outline-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9ff65] text-[#202318] hover:bg-[#e5ff8c]"
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
