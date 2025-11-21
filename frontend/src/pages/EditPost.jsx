import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    mediaUrl: "",
    mediaType: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/posts/${id}`).then((res) => {
      setForm({
        title: res.data.title,
        content: res.data.content,
        mediaUrl: res.data.mediaUrl,
        mediaType: res.data.mediaType
      });
    });
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.put(`/posts/update/${id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      navigate(`/post/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-semibold mb-4">Edit Post</h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="w-full p-3 bg-white/10 rounded"
        />

        <textarea
          value={form.content}
          rows="10"
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Content"
          className="w-full p-3 bg-white/10 rounded"
        />

        <button
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
