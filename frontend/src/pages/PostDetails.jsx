import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api";

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
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) return <p className="text-center mt-20 text-white">Loading...</p>;

  // Format text into clean paragraphs
  const formattedContent = post.content
    ?.split("\n")
    .filter((p) => p.trim() !== "")
    .map((p, i) => (
      <p
        key={i}
        className="text-[17px] md:text-[18px] leading-7 text-gray-200 mb-6 whitespace-pre-line"
      >
        {p}
      </p>
    ));

  return (
    <div className="relative min-h-screen">
      {/* Scroll progress */}
      <div
        className="fixed top-0 left-0 h-1 bg-indigo-500 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* IMAGE */}
        {post.mediaUrl && post.mediaType === "image" && (
          <img
            src={post.mediaUrl}
            className="w-full max-h-[450px] object-cover rounded-xl shadow-lg mb-8"
            alt="Post media"
          />
        )}

        {/* VIDEO */}
        {post.mediaUrl && post.mediaType === "video" && (
          <video
            controls
            className="w-full max-h-[450px] rounded-xl shadow-lg mb-8"
          >
            <source src={post.mediaUrl} />
          </video>
        )}

        {/* TITLE */}
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-100 mb-4">
          {post.title}
        </h1>

        {/* AUTHOR + DATE */}
        <div className="flex items-center space-x-2 text-indigo-300 mb-10">
          <Link
            to={`/profile/${post.author?._id}`}
            className="font-semibold hover:text-indigo-400 transition"
          >
            {post.author?.name}
          </Link>

          <span>•</span>

          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>

        {/* EDIT BUTTON — only for author */}
        {loggedUser?.id === post.author?._id && (
          <button
            onClick={() => navigate(`/edit/${post._id}`)}
            className="mb-8 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition"
          >
            Edit Post
          </button>
        )}

        {/* CONTENT */}
        <div>{formattedContent}</div>
      </div>
    </div>
  );
}
