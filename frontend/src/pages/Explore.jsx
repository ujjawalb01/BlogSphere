import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BiCompass,
  BiTrendingUp,
  BiTimeFive,
  BiUserCheck
} from "react-icons/bi";
import API from "../api";
import Spinner from "../components/Spinner";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");

  const topics = [
    { label: "All Topics", value: "all" },
    { label: "#Technology", value: "technology" },
    { label: "#Design", value: "design" },
    { label: "#Writing", value: "writing" },
    { label: "#Culture", value: "culture" },
    { label: "#Productivity", value: "productivity" },
    { label: "#Lifestyle", value: "lifestyle" },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadExploreData = async () => {
      setLoading(true);
      try {
        const [postsRes, writersRes] = await Promise.all([
          API.get("/posts"),
          API.get("/user/search?q=a"),
        ]);

        if (isMounted) {
          setPosts(postsRes.data || []);
          setWriters((writersRes.data || []).slice(0, 6));
        }
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadExploreData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter posts by selected topic
  const filteredPosts = React.useMemo(() => {
    if (selectedTopic === "all") return posts;
    return posts.filter((p) => {
      const text = `${p.title || ""} ${p.content || ""}`.toLowerCase();
      return text.includes(selectedTopic);
    });
  }, [posts, selectedTopic]);

  const leadStory = filteredPosts[0];
  const gridStories = filteredPosts.slice(1);

  return (
    <div className="w-full page-fade-in pb-12">
      
      {/* Header */}
      <div className="mb-8 border-b border-[var(--line)] pb-6">
        <span className="editorial-eyebrow mb-1.5 block">Curated Discovery</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--ink)] tracking-tight">
          Explore Perspectives
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)] max-w-xl leading-relaxed">
          Uncover the most captivating stories, compelling essays, and creative writers across BlogSphere.
        </p>

        {/* Topic Filter Chips */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar py-1">
          {topics.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedTopic(t.value)}
              className={`topic-chip shrink-0 text-xs py-1.5 px-3.5 transition ${
                selectedTopic === t.value
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] font-semibold shadow-sm"
                  : ""
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredPosts.length === 0 ? (
        <div className="editorial-card rounded-3xl p-12 text-center my-8">
          <p className="font-serif font-bold text-xl text-[var(--ink)] mb-2">No stories found in this topic</p>
          <p className="text-sm text-[var(--ink-secondary)] mb-4">Be the first to share an essay tagged with this topic.</p>
          <button
            type="button"
            onClick={() => setSelectedTopic("all")}
            className="btn-secondary-editorial text-xs"
          >
            Show all stories
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* 1. LEAD EDITORIAL STORY (Hero Format) */}
          {leadStory && (
            <article className="editorial-card rounded-3xl overflow-hidden group">
              <div className="grid grid-cols-1 md:grid-cols-12">
                {leadStory.media && leadStory.media.length > 0 ? (
                  <div className="md:col-span-7 h-64 sm:h-80 md:h-auto overflow-hidden bg-black/40">
                    <Link to={`/post/${leadStory._id}`} className="block h-full w-full">
                      <img
                        src={leadStory.media[0].url}
                        alt={leadStory.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                ) : null}

                <div
                  className={`p-6 sm:p-8 flex flex-col justify-between ${
                    leadStory.media && leadStory.media.length > 0
                      ? "md:col-span-5"
                      : "md:col-span-12"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="editorial-eyebrow">Lead Story</span>
                      <span className="text-[10px] text-[var(--ink-muted)] font-mono">
                        {new Date(leadStory.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link to={`/post/${leadStory._id}`} className="block mb-3">
                      <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition">
                        {leadStory.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-[var(--ink-secondary)] leading-relaxed line-clamp-3 mb-6">
                      {leadStory.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                    <Link
                      to={`/profile/${leadStory.author?._id}`}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition"
                    >
                      <div className="h-6 w-6 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center text-[10px] font-bold text-[var(--accent)] overflow-hidden">
                        {leadStory.author?.avatar ? (
                          <img src={leadStory.author.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (leadStory.author?.name?.charAt(0) || "U").toUpperCase()
                        )}
                      </div>
                      <span>{leadStory.author?.name}</span>
                    </Link>

                    <Link
                      to={`/post/${leadStory._id}`}
                      className="btn-primary-editorial text-xs py-1 px-3"
                    >
                      Read story
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* 2. POPULAR CREATORS ROW */}
          {writers && writers.length > 0 && (
            <div className="editorial-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="editorial-eyebrow block mb-1">Active Voices</span>
                  <h3 className="font-serif font-bold text-lg text-[var(--ink)]">Writers to Watch</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {writers.map((w) => (
                  <Link
                    key={w._id}
                    to={`/profile/${w._id}`}
                    className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-[var(--surface-hover)] transition group"
                  >
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-[var(--surface-raised)] border border-[var(--line-strong)] mb-2 group-hover:border-[var(--accent)] transition flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                      {w.avatar ? (
                        <img src={w.avatar} alt={w.name} className="h-full w-full object-cover" />
                      ) : (
                        (w.name?.charAt(0) || "U").toUpperCase()
                      )}
                    </div>
                    <p className="font-semibold text-xs text-[var(--ink)] truncate w-full group-hover:text-[var(--accent)] transition">
                      {w.name}
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate w-full">
                      @{w.username || "writer"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. EDITORIAL MAGAZINE GRID */}
          {gridStories.length > 0 && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Recent Stories</h3>
                <span className="text-xs font-mono text-[var(--ink-muted)]">
                  {gridStories.length} articles
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {gridStories.map((post) => {
                  let img = null;
                  if (post.media && post.media.length > 0) img = post.media[0].url;
                  else if (post.mediaUrl) img = post.mediaUrl;

                  const readingTime = Math.max(
                    1,
                    Math.ceil((post.content?.split(/\s+/).length || 60) / 200)
                  );

                  return (
                    <article
                      key={post._id}
                      className="editorial-card rounded-2xl overflow-hidden flex flex-col justify-between group"
                    >
                      {img && (
                        <Link to={`/post/${post._id}`} className="block h-48 overflow-hidden bg-black/40">
                          <img
                            src={img}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] mb-2">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className="font-mono flex items-center gap-1">
                              <BiTimeFive size={12} /> {readingTime} min
                            </span>
                          </div>

                          <Link to={`/post/${post._id}`} className="block mb-2">
                            <h4 className="font-serif font-bold text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition">
                              {post.title}
                            </h4>
                          </Link>

                          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-2 mb-4">
                            {post.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-auto">
                          <Link
                            to={`/profile/${post.author?._id}`}
                            className="flex items-center gap-2 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                          >
                            <span className="font-medium truncate max-w-[120px]">
                              {post.author?.name}
                            </span>
                          </Link>

                          <Link
                            to={`/post/${post._id}`}
                            className="text-xs font-semibold text-[var(--accent)] hover:underline"
                          >
                            Read →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
