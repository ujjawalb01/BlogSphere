import React from "react";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
      <span className="text-xs text-[var(--ink-muted)] font-mono tracking-wider">Loading stories...</span>
    </div>
  );
}
