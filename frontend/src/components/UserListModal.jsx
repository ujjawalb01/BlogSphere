// src/components/UserListModal.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function UserListModal({ title = "Users", users = [], onClose = () => {} }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-5 bg-white/6 rounded-xl border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white px-2 py-1 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-3">
          {users && users.length ? (
            users.map((u) => (
              <Link
                key={u._id || u.id}
                to={`/profile/${u._id || u.id}`}
                onClick={onClose}
                className="block p-3 rounded bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white">
                    {(u.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{u.name || u.username || "Unknown"}</div>
                    <div className="text-sm text-indigo-300">@{u.username || u.email || "unknown"}</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-indigo-300">No users found</div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded bg-white/10 text-white hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}
