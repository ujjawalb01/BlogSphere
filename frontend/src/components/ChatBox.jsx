import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function ChatBox({ currentChat, currentUser, socket, messages, setMessages }) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: currentUser._id,
      receiver: currentChat._id,
      text: newMessage,
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setMessages([...messages, message]);
    setNewMessage("");

    // Send to socket
    socket.emit("send_message", {
      senderId: currentUser._id,
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
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 bg-black/20 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
          {currentChat?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-white">{currentChat?.name}</h3>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, index) => (
          <div
            key={index}
            ref={scrollRef}
            className={`flex ${m.sender === currentUser._id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                m.sender === currentUser._id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-200 rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-black/20 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 bg-gray-800/50 border border-gray-600 rounded-full px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors"
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
