import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BiSearch,
  BiUser,
  BiBookOpen,
  BiTimeFive,
  BiArrowBack
} from "react-icons/bi";
import API from "../api";
import Spinner from "../components/Spinner";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(q);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'stories' | 'people'

  useEffect(() => {
    setSearchTerm(q);
    if (!q.trim()) {
      setUsers([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      API.get(`/user/search?q=${encodeURIComponent(q)}`).catch(() => ({ data: [] })),
      API.get(`/posts/search?q=${encodeURIComponent(q)}`).catch(() => ({ data: [] })),
    ])
      .then(([uRes, pRes]) => {
        setUsers(uRes.data || []);
        setPosts(pRes.data || []);
      })
      .catch((err) => console.error("Search error:", err))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setParams({ q: searchTerm.trim() });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto page-fade-in pb-20">
      
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative flex items-center">
          <BiSearch className="absolute left-4 text-xl text-[var(--ink-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stories, members, and topics..."
            className="w-full rounded-full border border-[var(--line-strong)] bg-[var(--surface)] py-3.5 pl-12 pr-28 text-base text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none focus:border-[var(--accent)] shadow-sm transition"
          />
          <button
            type="submit"
            className="btn-primary-editorial absolute right-2 text-xs py-2 px-5"
          >
            Search
          </button>
        </div>
      </form>

      {!q.trim() ? (
        <div className="editorial-card rounded-3xl p-12 sm:p-16 text-center my-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] text-2xl text-[var(--accent)] mb-3">
            <BiSearch size={26} />
          </div>
          <h2 className="font-serif font-bold text-2xl text-[var(--ink)] mb-1">
            Search BlogSphere
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] max-w-sm mx-auto">
            Discover creative members, thoughtful essays, or search for topics of your interest.
          </p>
        </div>
      ) : (
        <>
          {/* Header & Tabs */}
          <div className="border-b border-[var(--line)] pb-4 mb-6">
            <span className="editorial-eyebrow mb-1 block">Search Query</span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              Results for <span className="italic text-[var(--accent)]">"{q}"</span>
            </h1>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === "all"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                All ({posts.length + users.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("stories")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === "stories"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                Stories ({posts.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("people")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === "people"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                Members ({users.length})
              </button>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-8">
              
              {/* USERS / PEOPLE SECTION */}
              {(activeTab === "all" || activeTab === "people") && users.length > 0 && (
                <div>
                  <h3 className="font-serif font-bold text-lg text-[var(--ink)] mb-4 flex items-center gap-2">
                    <BiUser className="text-[var(--accent)]" />
                    <span>Members</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {users.map((u) => (
                      <Link
                        key={u._id}
                        to={`/profile/${u._id}`}
                        className="editorial-card rounded-2xl p-4 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--accent)] overflow-hidden shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (u.name?.charAt(0) || "U").toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition truncate">
                              {u.name}
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
                    ))}
                  </div>
                </div>
              )}

              {/* STORIES / POSTS SECTION */}
              {(activeTab === "all" || activeTab === "stories") && (
                <div>
                  <h3 className="font-serif font-bold text-lg text-[var(--ink)] mb-4 flex items-center gap-2">
                    <BiBookOpen className="text-[var(--accent)]" />
                    <span>Stories</span>
                  </h3>

                  {posts.length === 0 ? (
                    <p className="text-xs text-[var(--ink-muted)] italic py-4">
                      No stories matched your search.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => {
                        const readingTime = Math.max(
                          1,
                          Math.ceil((post.content?.split(/\s+/).length || 60) / 200)
                        );

                        return (
                          <article
                            key={post._id}
                            className="editorial-card rounded-2xl p-5 sm:p-6 group"
                          >
                            <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)] mb-1.5">
                              <span className="font-semibold text-[var(--ink)]">
                                {post.author?.name || "Writer"}
                              </span>
                              <span>•</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="font-mono flex items-center gap-1">
                                <BiTimeFive size={11} /> {readingTime} min
                              </span>
                            </div>

                            <Link to={`/post/${post._id}`} className="block mb-2">
                              <h4 className="font-serif font-bold text-lg sm:text-xl text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition">
                                {post.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-3">
                              {post.content}
                            </p>

                            <Link
                              to={`/post/${post._id}`}
                              className="text-xs font-semibold text-[var(--accent)] hover:underline"
                            >
                              Read full story →
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {users.length === 0 && posts.length === 0 && (
                <div className="editorial-card rounded-3xl p-12 text-center">
                  <p className="font-serif font-bold text-xl text-[var(--ink)] mb-1">
                    No results found for "{q}"
                  </p>
                  <p className="text-xs text-[var(--ink-secondary)]">
                    Try checking for spelling errors or searching with broader keywords.
                  </p>
                </div>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}
