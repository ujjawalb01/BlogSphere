import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
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

  if (!user) return <div className="py-20 text-center text-gray-400">Please login to view your profile.</div>;

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
    <div className="mx-auto max-w-5xl py-2 text-white md:py-4">

      {/* LEVEL 1 MENU */}
      {showSettings && !submenu && !formType && (
        <Modal>
          <h2 className="text-xl font-semibold mb-4">Settings</h2>

          <MenuItem onClick={() => setSubmenu("account")}>
            Account Details 
          </MenuItem>

          <MenuItem onClick={() => setSubmenu("privacy")}>
            Privacy 
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
            Update Name
          </MenuItem>

          <MenuItem onClick={() => setFormType("username")}>
            Update Username
          </MenuItem>

          <MenuItem onClick={() => setFormType("email")}>
            Update Email
          </MenuItem>

          <CloseButton onClick={() => setSubmenu(null)} text="Back" />
        </Modal>
      )}

      {/* PRIVACY SUBMENU */}
      {submenu === "privacy" && !formType && (
        <Modal>
          <h2 className="text-xl font-semibold mb-4">Privacy</h2>

          <MenuItem onClick={() => setFormType("password")}>
            Change Password
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
      <div className="card relative mb-10 rounded-2xl p-6 md:p-8">

        <button
          onClick={() => setShowSettings(true)}
          className="absolute right-5 top-5 rounded-full border border-white/15 p-2.5 hover:bg-white/10 md:right-6 md:top-6"
          aria-label="Settings"
        >
          <FaBars className="text-lg md:text-xl text-white/90" />
        </button>

        <div className="flex items-center space-x-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d9ff65] text-3xl font-semibold text-[#202318]">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="eyebrow mb-2">Your profile</p>
            <h2 className="editorial-title text-4xl font-semibold">{user.name}</h2>
            <p className="mt-1 text-sm text-gray-400">@{user.username} · {user.email}</p>
          </div>
        </div>

        {stats && (
          <div className="mt-8 flex justify-between rounded-xl border border-white/10 bg-black/15 p-3 text-center">
            <Stat title="Followers" value={stats.followers} />
            <Stat title="Following" value={stats.following} />
            <Stat title="Posts" value={stats.posts} />
          </div>
        )}
      </div>

      {/* POSTS GRID */}
      <p className="eyebrow mb-2">Your published work</p>
      <h3 className="editorial-title mb-5 text-3xl font-semibold">Your posts</h3>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 py-12 text-center text-gray-400">You haven't posted anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              className="card overflow-hidden rounded-xl"
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
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
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
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#20211f] p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mb-3 w-full rounded-lg bg-white/5 p-3 text-left hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function CloseButton({ onClick, text = "Close" }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-white/10 bg-white/10 p-3 hover:bg-white/15"
    >
      {text}
    </button>
  );
}

function Stat({ title, value }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{title}</div>
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
        className="input-field mb-3"
        onChange={(e) => setValue(e.target.value)}
      />

      {msg && <p className="text-indigo-200 mb-3">{msg}</p>}

      <button
        onClick={handleSave}
        className="btn mb-2 w-full rounded-full py-2.5"
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
