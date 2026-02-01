import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { BiSolidLike, BiLike, BiCommentDetail, BiShare, BiLink, BiDotsVerticalRounded, BiEdit, BiTrash, BiSend } from "react-icons/bi";
import ShareModal from "../components/ShareModal";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(true); // Always show or default open
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // Three dot menu

  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch post
  useEffect(() => {
    API
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
       const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
       const progress = (window.scrollY / totalHeight) * 100;
       setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) return (
     <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  // Normalize media
  let mediaList = post.media || [];
  if (post.mediaUrl && mediaList.length === 0) {
    mediaList = [{ url: post.mediaUrl, type: post.mediaType }];
  }


  // Format text into clean paragraphs
  const formattedContent = post.content
    ?.split("\n")
    .filter((p) => p.trim() !== "")
    .map((p, i) => (
      <p
        key={i}
        className="text-lg md:text-xl leading-relaxed text-gray-300 mb-6 drop-shadow-sm font-light"
      >
        {p}
      </p>
    ));

  // --- ACTIONS ---

  const handleLike = async () => {
      if (!loggedUser) return alert("Please login to like");
      
      const prevPost = { ...post };
      const userId = loggedUser._id || loggedUser.id;

      // Optimistic Update
      const alreadyLiked = post.likes.includes(userId);
      const newLikes = alreadyLiked 
          ? post.likes.filter(uid => uid !== userId)
          : [...post.likes, userId];
      
      setPost({ ...post, likes: newLikes });

      try {
        await API.post(`/posts/${post._id}/like`);
      } catch (err) {
        console.error(err);
        setPost(prevPost);
      }
  };

  const handleCommentSubmit = async () => {
      if (!commentText.trim()) return;
      if (!loggedUser) return alert("Please login to comment");

      try {
          const res = await API.post(`/posts/${post._id}/comment`, { text: commentText });
          // Ideally backend returns the new comment or updated post
          // Simple re-fetch or manual append if we knew structure
          // Let's re-fetch for simplicity or append optimistically if we trust the return
          
          // Optimistic append (assuming success)
          const newComment = {
              user: { name: loggedUser.name, _id: loggedUser._id || loggedUser.id },
              text: commentText
          };
          
          setPost({ ...post, comments: [...post.comments, newComment] });
          setCommentText("");

          // Re-fetch to be safe about user population
          const refreshRes = await API.get(`/posts/${id}`);
          setPost(refreshRes.data);

      } catch (err) {
          console.error(err);
          alert("Failed to comment");
      }
  };

  const handleDelete = async () => {
      if (!confirm("Delete this article?")) return;
      try {
          await API.delete(`/posts/${post._id}`);
          navigate("/");
      } catch (err) {
          console.error(err);
          alert("Failed to delete");
      }
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  const isLiked = post.likes?.includes(loggedUser?._id || loggedUser?.id);
  const isOwner = loggedUser && (loggedUser._id === post.author?._id || loggedUser.id === post.author?._id);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Scroll progress */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        
        {/* MEDIA CAROUSEL (HERO) */}
        {mediaList.length > 0 && (
           <div className="rounded-2xl overflow-hidden glass shadow-2xl mb-12 border border-white/5 relative group">
             <Swiper
               modules={[Pagination, Navigation]}
               pagination={{ clickable: true }}
               navigation
               className="w-full h-[300px] md:h-[500px]"
             >
               {mediaList.map((item, index) => (
                 <SwiperSlide key={index} className="bg-black/80 flex items-center justify-center">
                    {item.type === "video" ? (
                       <video controls className="w-full h-full object-contain">
                          <source src={item.url} />
                       </video>
                    ) : (
                       <img src={item.url} alt="" className="w-full h-full object-contain" />
                    )}
                 </SwiperSlide>
               ))}
             </Swiper>
           </div>
        )}

        {/* CONTENT WRAPPER */}
        <div className="max-w-3xl mx-auto">
            {/* META */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                   <Link to={`/profile/${post.author?._id}`}>
                      <img 
                        src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`} 
                        className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover" 
                        alt="" 
                      />
                   </Link>
                   <div>
                      <h3 className="text-white font-bold text-lg">{post.author?.name}</h3>
                      <p className="text-indigo-400 text-sm">@{post.author?.username}</p>
                   </div>
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-gray-500 text-sm hidden md:block">{new Date(post.createdAt).toLocaleDateString()}</span>
                    
                    {/* Three Dot Menu for Owner */}
                    {isOwner && (
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full transition">
                                <BiDotsVerticalRounded size={24} className="text-gray-300" />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                                    <button 
                                        onClick={() => navigate(`/edit/${post._id}`)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-2 text-sm text-gray-300"
                                    >
                                        <BiEdit /> <span>Edit Post</span>
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-2 text-sm text-red-400"
                                    >
                                        <BiTrash /> <span>Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* TITLE */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6 md:mb-10 tracking-tight leading-tight">
               {post.title}
            </h1>

            {/* BODY */}
            <article className="prose prose-invert lg:prose-xl max-w-none mb-12">
               {formattedContent}
            </article>

            {/* INTERACTION BAR */}
            <div className="flex items-center justify-between py-6 border-t border-b border-gray-800 mb-12">
                 <div className="flex space-x-8">
                     <button 
                       onClick={handleLike}
                       className={`flex items-center space-x-2 text-xl transition ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
                     >
                       {isLiked ? <BiSolidLike /> : <BiLike />}
                       <span>{post.likes?.length || 0}</span>
                     </button>

                     <button 
                       onClick={() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" })}
                       className="flex items-center space-x-2 text-xl text-gray-400 hover:text-indigo-400 transition"
                     >
                       <BiCommentDetail />
                       <span>{post.comments?.length || 0}</span>
                     </button>

                     <button onClick={() => setIsShareOpen(true)} className="flex items-center space-x-2 text-xl text-gray-400 hover:text-blue-400 transition">
                       <BiShare />
                     </button>
                 </div>
                 
                 <button onClick={copyLink} className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-white/10">
                   <BiLink size={24}/>
                 </button>
            </div>

            {/* COMMENTS SECTION */}
            <div id="comments-section" className="mb-20">
                <h3 className="text-2xl font-bold text-white mb-8">Comments ({post.comments?.length || 0})</h3>
                
                {/* Add Comment */}
                <div className="flex space-x-4 mb-10">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {loggedUser?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add to the discussion..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 min-h-[100px]"
                        />
                        <div className="flex justify-end mt-2">
                            <button 
                                onClick={handleCommentSubmit}
                                className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:scale-105 transition flex items-center space-x-2"
                            >
                                <BiSend /> <span>Post Comment</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Comments */}
                <div className="space-y-8">
                    {post.comments?.length > 0 ? (
                        post.comments.map((c, i) => (
                            <div key={i} className="flex space-x-4 animate-fade-in">
                                <Link to={`/profile/${c.user?._id}`}>
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                                        {c.user?.name?.charAt(0) || "U"}
                                    </div>
                                </Link>
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-bold text-white">{c.user?.name}</span>
                                        <span className="text-gray-500 text-xs">• {new Date().toLocaleDateString()}</span> 
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{c.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-10">No comments yet. Be the first to share your thoughts!</p>
                    )}
                </div>
            </div>

            {/* FOOTER NAV */}
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
               <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition">← Back to Feed</Link>
            </div>
        </div>

      </div>

      {isShareOpen && (
        <ShareModal post={post} onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  );
}
