import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BiSolidLike, BiLike, BiCommentDetail, BiShare, BiLink } from "react-icons/bi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";

import ShareModal from "./ShareModal";

export default function PostCard({
  post,
  onLike,
  onDelete,
  onFollow,
  onUnfollow,
  onAddComment,
  currentUser
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isLiked = post.likes?.includes(currentUser?._id);

  // Normalize media to array
  let mediaList = post.media || [];
  if (post.mediaUrl && mediaList.length === 0) {
    mediaList = [{ url: post.mediaUrl, type: post.mediaType }];
  }

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const authorId = post.author?._id?.toString() || post.author?.toString();
  const isOwner = currentUserId && authorId && currentUserId === authorId;

  // Fix: Check if currentUser is following this author (robust check)
  const isFollowing = currentUser?.following?.some(id => 
     (typeof id === 'string' ? id : id?._id?.toString() || id?.toString()) === authorId
  );

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(post._id, commentText);
    setCommentText("");
  };

  const copyLink = () => {
    const link = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  return (
    <>
      <article className="glass-card group mb-0 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 flex items-center justify-between">
          <Link to={`/profile/${post.author?._id}`} className="flex items-center space-x-3">
            <img 
              src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`} 
              alt="avatar" 
              className="w-10 h-10 rounded-full bg-gray-700 object-cover ring-1 ring-white/10"
            />
            <div>
              <h3 className="text-sm font-semibold text-white">{post.author?.name || "Unknown"}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </Link>
          
          {/* Follow/Unfollow/Delete Actions */}
          <div className="flex items-center space-x-2">
             {currentUser && post.author && !isOwner && (
               isFollowing ? (
                  <button onClick={() => onUnfollow(post.author?._id)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-red-400/60 hover:text-red-300">Following</button>
               ) : (
                  <button onClick={() => onFollow(post.author?._id)} className="rounded-full border border-[#d9ff65]/70 px-3 py-1.5 text-xs font-semibold text-[#d9ff65] hover:bg-[#d9ff65] hover:text-[#202318]">Follow</button>
               )
             )}
             {post.canDelete && (
               <button onClick={() => onDelete(post._id)} className="text-red-500 hover:text-red-400 transition text-xl">×</button>
             )}
          </div>
        </div>

        {/* MEDIA CAROUSEL */}
        {mediaList.length > 0 && (
           <Swiper
             modules={[Pagination, Navigation]}
             pagination={{ clickable: true }}
             navigation
             className="w-full h-[360px] bg-black/30 md:h-[400px]"
           >
             {mediaList.map((item, index) => (
               <SwiperSlide key={index} className="flex items-center justify-center">
                 {item.type === "video" ? (
                   <video controls className="w-full h-full object-contain">
                     <source src={item.url} />
                   </video>
                 ) : (
                   <Link to={`/post/${post._id}`} className="flex h-full w-full items-center justify-center" aria-label={`Open ${post.title}`}>
                     <img src={item.url} alt={`Slide ${index}`} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.015]" />
                   </Link>
                 )}
               </SwiperSlide>
             ))}
           </Swiper>
        )}

        {/* CONTENT */}
        <div className="p-5">
           <Link to={`/post/${post._id}`} className="block">
             <h2 className="editorial-title mb-3 text-left text-2xl font-semibold leading-tight text-white transition group-hover:text-[#d9ff65]">{post.title}</h2>
           </Link>
           
           <Link to={`/post/${post._id}`} className="block">
             <div className="mb-4 text-left text-sm leading-relaxed text-gray-400 whitespace-pre-wrap line-clamp-3">{post.content}</div>
           </Link>
           
           <Link to={`/post/${post._id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d9ff65] hover:text-white">
             Open story <span aria-hidden="true">→</span>
           </Link>
           
           {/* ACTION BUTTONS */}
           <div className="flex items-center justify-between border-t border-white/10 pt-4">
             <div className="flex space-x-6">
                <button 
                  onClick={() => onLike(post._id)}
                  className={`flex items-center space-x-2 text-lg transition ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
                >
                  {isLiked ? <BiSolidLike /> : <BiLike />}
                  <span className="text-sm">{post.likes?.length || 0}</span>
                </button>

                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 text-lg text-gray-400 hover:text-indigo-400 transition"
                >
                  <BiCommentDetail />
                  <span className="text-sm">{post.comments?.length || 0}</span>
                </button>

                <button onClick={() => setIsShareOpen(true)} className="flex items-center space-x-2 text-lg text-gray-400 hover:text-blue-400 transition">
                  <BiShare />
                </button>
             </div>
             
             <button onClick={copyLink} className="text-gray-400 hover:text-white transition">
               <BiLink size={20}/>
             </button>
           </div>

           {/* COMMENTS SECTION */}
           {showComments && (
              <div className="mt-4 pt-4 border-t border-white/10 page-enter">
                 <div className="max-h-40 overflow-y-auto space-y-3 mb-4 pr-2">
                   {post.comments?.length > 0 ? (
                      post.comments.map((c, i) => (
                        <div key={i} className="flex space-x-2 text-sm text-left">
                          <span className="font-bold text-indigo-300 whitespace-nowrap">{c.user?.name}:</span>
                          <span className="text-gray-300">{c.text}</span>
                        </div>
                      ))
                   ) : (
                     <p className="text-gray-500 text-xs text-center">No comments yet</p>
                   )}
                 </div>
                 
                 <div className="flex space-x-2">
                   <input 
                     type="text" 
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                     placeholder="Add a comment..."
                   />
                   <button onClick={handleCommentSubmit} className="text-indigo-400 font-semibold hover:text-indigo-300 px-2">Post</button>
                 </div>
              </div>
           )}
        </div>
      </article>

      {isShareOpen && (
        <ShareModal post={post} onClose={() => setIsShareOpen(false)} />
      )}
    </>
  );
}
