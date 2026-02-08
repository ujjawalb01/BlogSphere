
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { FaImage, FaTimes, FaFilm } from "react-icons/fa";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingMedia, setExistingMedia] = useState([]);
  
  // New uploads
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get(`/posts/${id}`).then((res) => {
      setTitle(res.data.title);
      setContent(res.data.content);
      
      // Normalize media (handle legacy single url/type if necessary)
      let media = res.data.media || [];
      if (res.data.mediaUrl && media.length === 0) {
        media = [{ url: res.data.mediaUrl, type: res.data.mediaType }];
      }
      setExistingMedia(media);
      setFetching(false);
    }).catch(err => {
      console.error(err);
      alert("Failed to load post");
      navigate("/");
    });
  }, [id, navigate]);

  // Handle new file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Limit total validation if needed (existing + new)
    if (existingMedia.length + newFiles.length + selectedFiles.length > 10) {
      alert("Maximum 10 files allowed in total");
      return;
    }

    setNewFiles([...newFiles, ...selectedFiles]);
    
    const newPreviewUrls = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
    }));
    setNewPreviews([...newPreviews, ...newPreviewUrls]);
  };

  // Remove existing media
  const removeExistingMedia = (index) => {
    const updated = existingMedia.filter((_, i) => i !== index);
    setExistingMedia(updated);
  };

  // Remove new file (draft)
  const removeNewFile = (index) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    const updatedPreviews = newPreviews.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    setNewPreviews(updatedPreviews);
  };

  const uploadFiles = async () => {
        if (newFiles.length === 0) return [];
        const fd = new FormData();
        newFiles.forEach(file => fd.append("media", file));
        
        const res = await API.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data; // Expecting array of {url, type}
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload new files
      const uploadedNewMedia = await uploadFiles();

      // 2. Combine with remaining existing media
      const finalMedia = [...existingMedia, ...uploadedNewMedia];

      // 3. Update Post
      await API.put(`/posts/update/${id}`, {
        title,
        content,
        media: finalMedia
      });

      navigate(`/post/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="max-w-3xl mx-auto pt-10 px-4 pb-20">
      <div className="glass rounded-xl p-8 border border-white/10">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Edit Post</h2>
        
        <form onSubmit={submit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Post Title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Content</label>
            <textarea
              value={content}
              rows="8"
              onChange={(e) => setContent(e.target.value)}
              className="input-field w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Post Content"
            />
          </div>

          {/* MEDIA MANAGEMENT */}
          <div>
             <label className="block text-gray-400 text-sm mb-2">Media</label>
             
             {/* Existing + New Previews Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                
                {/* Existing Media */}
                {existingMedia.map((item, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-lg overflow-hidden group bg-black/50 border border-white/10">
                        {item.type === 'video' ? (
                             <video src={item.url} className="w-full h-full object-cover opacity-80" />
                        ) : (
                             <img src={item.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-1 right-1">
                             <button 
                               type="button" 
                               onClick={() => removeExistingMedia(i)} 
                               className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition"
                               title="Remove media"
                             >
                                <FaTimes size={12} />
                             </button>
                        </div>
                        <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1 rounded text-gray-300">Existing</span>
                    </div>
                ))}

                {/* New Previews */}
                {newPreviews.map((item, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden group bg-black/50 border border-green-500/30">
                        {item.type === 'video' ? (
                             <video src={item.url} className="w-full h-full object-cover opacity-80" />
                        ) : (
                             <img src={item.url} alt="" className="w-full h-full object-cover" />
                        )}
                         <div className="absolute top-1 right-1">
                             <button 
                               type="button" 
                               onClick={() => removeNewFile(i)} 
                               className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition"
                               title="Remove upload"
                             >
                                <FaTimes size={12} />
                             </button>
                        </div>
                        <span className="absolute bottom-1 left-2 text-[10px] bg-green-900/80 px-1 rounded text-green-300">New</span>
                    </div>
                ))}

                {/* Upload Button */}
                <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-white/5">
                    <FaImage size={24} className="mb-1" />
                    <span className="text-xs">Add Media</span>
                    <input
                       type="file"
                       multiple
                       accept="image/*,video/*"
                       onChange={handleFileChange}
                       className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition shadow-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
