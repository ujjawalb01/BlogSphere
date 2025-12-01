import { BiSolidLike } from "react-icons/bi";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function PostCard({
  post,
  onLike,
  onDelete,
  onFollow,
  onUnfollow,
  onAddComment,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isFollowing = post.isFollowing;

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(post._id, commentText);
    setCommentText("");
  };

  return (
    <article className="rounded-xl overflow-hidden card shadow-lg transition hover:scale-[1.01]">

      {/* CLICKABLE AREA */}
      <Link to={`/post/${post._id}`}>
        {/* MEDIA */}
        {post.mediaUrl && post.mediaType === "image" && (
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full h-56 object-cover"
          />
        )}

        {post.mediaUrl && post.mediaType === "video" && (
          <video controls className="w-full h-56 object-cover">
            <source src={post.mediaUrl} />
          </video>
        )}

        {/* TITLE + META */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-lg">{post.title}</h3>
          <div className="text-xs text-indigo-200">
            {post.author?.name || "Unknown"} •{" "}
            {new Date(post.createdAt).toLocaleString()}
          </div>

          <p className="mt-3 text-indigo-100 line-clamp-3">
            {post.content}
          </p>
        </div>
      </Link>

      {/* BUTTONS (outside the link) */}
      <div className="px-4 pb-4">
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            
            {/* LIKE */}
            <button
              onClick={() => onLike(post._id)}
              className="px-3 py-1 border rounded-md text-sm bg-white/10 text-white btn"
            >
              <BiSolidLike />  ({post.likes?.length || 0})
            </button>

            {/* FOLLOW/UNFOLLOW */}
            {isFollowing ? (
              <button
                onClick={() => onUnfollow(post.author?._id)}
                className="px-3 py-1 rounded-md text-sm bg-red-500 text-white btn"
              >
                Unfollow
              </button>
            ) : (
              <button
                onClick={() => onFollow(post.author?._id)}
                className="px-3 py-1 rounded-md text-sm bg-primary text-white btn"
              >
                Follow
              </button>
            )}
          </div>

          {/* DELETE BUTTON */}
          {post.canDelete && (
            <button
              onClick={() => onDelete(post._id)}
              className="text-sm text-red-400"
            >
              Delete
            </button>
          )}
        </div>

        {/* COMMENTS */}
        <div className="mt-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-indigo-200 text-sm underline"
          >
            {showComments ? "Hide comments" : "Show comments"}
          </button>

          {showComments && (
            <div className="mt-3 space-y-2">
              
              {/* LIST COMMENTS */}
              {post.comments?.length > 0 ? (
                post.comments.map((c, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-white/5 text-indigo-100 text-sm"
                  >
                    <strong>{c.user?.name || "User"}:</strong> {c.text}
                  </div>
                ))
              ) : (
                <div className="text-indigo-300 text-sm">
                  No comments yet. Be the first!
                </div>
              )}

              {/* ADD COMMENT */}
              <textarea
                className="w-full p-2 rounded bg-white/10 text-white border border-white/10"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              <button
                onClick={handleCommentSubmit}
                className="mt-2 px-3 py-1 bg-primary text-white rounded btn"
              >
                Post Comment
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
