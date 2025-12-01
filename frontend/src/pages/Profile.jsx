import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);

  // SETTINGS CONTROLLERS
  const [showSettings, setShowSettings] = useState(false);
  const [submenu, setSubmenu] = useState(null);
  const [formType, setFormType] = useState(null);

  useEffect(() => {
    if (!user) return;

    const id = user.id || user._id;

    API.get(`/user/${id}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));

    API.get(`/posts?author=${id}`)
      .then((res) => {
        const filtered = res.data.filter((p) => p.author?._id === id);
        setPosts(filtered);
      })
      .catch((err) => console.log(err));
  }, []);

  if (!user) return <div className="text-indigo-200">Please login.</div>;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeAll = () => {
    setShowSettings(false);
    setSubmenu(null);
    setFormType(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">

      {/* LEVEL 1 MENU */}
      {showSettings && !submenu && !formType && (
        <Modal>
          <h2 className="text-xl font-semibold mb-4">Settings</h2>

          <MenuItem onClick={() => setSubmenu("account")}>
            Account Details →
          </MenuItem>

          <MenuItem onClick={() => setSubmenu("privacy")}>
            Privacy →
          </MenuItem>

          <button
            onClick={logout}
            className="w-full text-left bg-red-500 p-3 rounded-lg mb-3 hover:bg-red-600"
          >
            Logout
          </button>

          <CloseButton onClick={closeAll} />
        </Modal>
      )}

      {/* ACCOUNT SUBMENU */}
      {submenu === "account" && !formType && (
        <Modal>
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>

          <MenuItem onClick={() => setFormType("name")}>
            Update Name →
          </MenuItem>

          <MenuItem onClick={() => setFormType("username")}>
            Update Username →
          </MenuItem>

          <MenuItem onClick={() => setFormType("email")}>
            Update Email →
          </MenuItem>

          <CloseButton onClick={() => setSubmenu(null)} text="Back" />
        </Modal>
      )}

      {/* PRIVACY SUBMENU */}
      {submenu === "privacy" && !formType && (
        <Modal>
          <h2 className="text-xl font-semibold mb-4">Privacy</h2>

          <MenuItem onClick={() => setFormType("password")}>
            Change Password →
          </MenuItem>

          <CloseButton onClick={() => setSubmenu(null)} text="Back" />
        </Modal>
      )}

      {/* FORMS */}
      {formType === "name" && (
        <UpdateAccountForm
          title="Update Name"
          field="name"
          placeholder="New Name"
          onClose={closeAll}
        />
      )}

      {formType === "username" && (
        <UpdateAccountForm
          title="Update Username"
          field="username"
          placeholder="New Username"
          onClose={closeAll}
        />
      )}

      {formType === "email" && (
        <UpdateAccountForm
          title="Update Email"
          field="email"
          placeholder="New Email"
          onClose={closeAll}
        />
      )}

      {formType === "password" && (
        <PasswordForm onClose={closeAll} />
      )}

      {/* PROFILE HEADER */}
      <div className="card p-8 rounded-xl mb-10 relative">

        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-6 right-6 bg-white/10 border border-white/20 p-2 rounded-full hover:bg-white/20"
        >
          ⚙️
        </button>

        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-white/10 text-3xl flex items-center justify-center font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-indigo-300">@{user.username}</p>
            <p className="text-indigo-300">{user.email}</p>
          </div>
        </div>

        {stats && (
          <div className="flex justify-between text-center mt-8 bg-white/5 p-4 rounded-lg border border-white/10">
            <Stat title="Followers" value={stats.followers} />
            <Stat title="Following" value={stats.following} />
            <Stat title="Posts" value={stats.posts} />
          </div>
        )}
      </div>

      {/* POSTS GRID */}
      <h3 className="text-xl font-semibold mb-4">Your Posts</h3>

      {posts.length === 0 ? (
        <p className="text-indigo-300">You haven't posted anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              className="rounded-xl overflow-hidden card bg-white/5 hover:bg-white/10 transition"
            >
              {post.mediaUrl ? (
                post.mediaType === "image" ? (
                  <img src={post.mediaUrl} className="w-full h-56 object-cover" />
                ) : (
                  <video className="w-full h-56 object-cover" muted autoPlay loop>
                    <source src={post.mediaUrl} />
                  </video>
                )
              ) : (
                <div className="h-56 bg-white/10 flex items-center justify-center text-indigo-300">
                  No Media
                </div>
              )}

              <div className="p-4">
                <h4 className="font-semibold text-lg text-white">
                  {post.title}
                </h4>
                <p className="text-indigo-300 text-sm line-clamp-2 mt-1">
                  {post.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* Components Used Below */

function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/10 p-6 rounded-xl w-full max-w-sm border border-white/20 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/5 p-3 rounded-lg mb-3 hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function CloseButton({ onClick, text = "Close" }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/10 p-3 rounded-lg"
    >
      {text}
    </button>
  );
}

function Stat({ title, value }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-indigo-300 text-sm">{title}</div>
    </div>
  );
}

/* UPDATE ACCOUNT FORM */
function UpdateAccountForm({ title, field, placeholder, onClose }) {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    if (!value.trim()) return setMsg("Field cannot be empty");

    try {
      const res = await API.put("/user/update", { [field]: value });

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMsg("Updated successfully!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error updating");
    }
  };

  return (
    <Modal>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      <input
        placeholder={placeholder}
        className="w-full p-3 rounded bg-white/10 border border-white/20 text-white mb-3"
        onChange={(e) => setValue(e.target.value)}
      />

      {msg && <p className="text-indigo-200 mb-3">{msg}</p>}

      <button
        onClick={handleSave}
        className="w-full bg-primary py-2 rounded-lg mb-2 text-white btn"
      >
        Save
      </button>

      <CloseButton onClick={onClose} />
    </Modal>
  );
}

/* PASSWORD FORM */
function PasswordForm({ onClose }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");

  const savePassword = async () => {
    if (!oldPass || !newPass || !confirmPass)
      return setMsg("All fields required");

    try {
      const res = await API.put("/user/change-password", {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmPassword: confirmPass
      });

      setMsg("Password updated!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <Modal>
      <h2 className="text-2xl font-semibold mb-4">Change Password</h2>

      <input
        type="password"
        placeholder="Old Password"
        className="w-full p-3 rounded bg-white/10 border border-white/20 text-white mb-2"
        onChange={(e) => setOldPass(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        className="w-full p-3 rounded bg-white/10 border border-white/20 text-white mb-2"
        onChange={(e) => setNewPass(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        className="w-full p-3 rounded bg-white/10 border border-white/20 text-white mb-3"
        onChange={(e) => setConfirmPass(e.target.value)}
      />

      {msg && <p className="text-indigo-200 mb-3">{msg}</p>}

      <button
        onClick={savePassword}
        className="w-full bg-primary py-2 rounded-lg mb-2 text-white btn"
      >
        Save Password
      </button>

      <CloseButton onClick={onClose} />
    </Modal>
  );
}

