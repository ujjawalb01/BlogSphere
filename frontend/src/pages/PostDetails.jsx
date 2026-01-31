import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch post
  useEffect(() => {
    axios
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
               className="w-full h-[500px]"
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
            <div className="flex items-center space-x-4 mb-6">
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
               <span className="text-gray-500 text-sm ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            {/* TITLE */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-10 tracking-tight leading-tight">
               {post.title}
            </h1>

            {/* BODY */}
            <article className="prose prose-invert lg:prose-xl max-w-none">
               {formattedContent}
            </article>

            {/* FOOTER ACTIONS */}
            <div className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-center">
               <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition">← Back to Feed</Link>
               {loggedUser?.id === post.author?._id && (
                  <button
                    onClick={() => navigate(`/edit/${post._id}`)}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition"
                  >
                    Edit Article
                  </button>
               )}
            </div>
        </div>

      </div>
    </div>
  );
}
