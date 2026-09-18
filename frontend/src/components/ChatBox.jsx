import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiSend, BiUser } from "react-icons/bi";

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
      text: newMessage.trim(),
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, message]);
    const sentText = newMessage.trim();
    setNewMessage("");

    // Send via socket
    if (socket) {
      socket.emit("send_message", {
        senderId: currentUserId,
        receiverId: currentChat._id,
        text: sentText,
      });
    }

    // Save to database
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
          text: sentText,
        }),
      });
    } catch (err) {
      console.error("Failed to save message to backend:", err);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--surface)]">
      
      {/* CHAT HEADER */}
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-hover)] px-5 py-3.5">
        <Link
          to={`/profile/${currentChat?._id}`}
          className="flex items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--accent)]">
            {currentChat?.avatar ? (
              <img src={currentChat.avatar} alt={currentChat.name} className="h-full w-full object-cover" />
            ) : (
              (currentChat?.name?.charAt(0) || "U").toUpperCase()
            )}
          </div>

          <div>
            <h3 className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition">
              {currentChat?.name}
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)]">
              @{currentChat?.username || "member"}
            </p>
          </div>
        </Link>
      </div>

      {/* MESSAGE STREAM */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-xl text-[var(--accent)] mb-3">
              ✦
            </div>
            <p className="font-serif font-bold text-base text-[var(--ink)]">
              Say hello to {currentChat?.name}
            </p>
            <p className="text-xs text-[var(--ink-muted)] mt-1 max-w-xs">
              Direct messages are private between you and {currentChat?.name}.
            </p>
          </div>
        ) : (
          messages.map((m, index) => {
            const isMe = m.sender === currentUserId;

            return (
              <div
                key={index}
                ref={scrollRef}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-[var(--accent)] text-[var(--accent-ink)] font-medium rounded-br-xs"
                      : "bg-[var(--surface-raised)] text-[var(--ink)] border border-[var(--line)] rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] font-mono text-[var(--ink-muted)] mt-1 px-1">
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* INPUT FORM */}
      <div className="border-t border-[var(--line)] bg-[var(--surface-hover)] p-3 sm:p-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] p-1.5 pl-4 focus-within:border-[var(--accent)] transition"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send"
          >
            <BiSend size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}
