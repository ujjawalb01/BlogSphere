import React from "react";
import { Link } from "react-router-dom";
import { BiX } from "react-icons/bi";

export default function UserListModal({ title = "Users", users = [], onClose = () => {} }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 page-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-card">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <h3 className="font-serif font-bold text-xl text-[var(--ink)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition"
            aria-label="Close"
          >
            <BiX size={22} />
          </button>
        </div>

        {/* User List */}
        <div className="max-h-80 overflow-y-auto space-y-2 py-3 pr-1">
          {users && users.length ? (
            users.map((u) => (
              <Link
                key={u._id || u.id}
                to={`/profile/${u._id || u.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--surface-hover)] transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center text-sm font-bold text-[var(--accent)] shrink-0 overflow-hidden">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                    ) : (
                      (u.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition truncate">
                      {u.name || u.username || "Member"}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)] truncate">
                      @{u.username || "member"}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition">
                  View →
                </span>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-[var(--ink-muted)] italic">
              No members to display
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-editorial w-full py-2.5 text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
