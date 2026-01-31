# BlogSphere - Modern Social Media Application

BlogSphere is a full-featured, Instagram-like social media platform built with the **MERN Stack** (MongoDB, Express, React, Node.js). It features a sleek glassmorphism UI/UX, real-time messaging, instant notifications, and interactive social features.

## 🚀 Key Features

### 📱 **Interactive Feed**
-   **Media Rich**: Support for multi-image and video posts using Swiper carousels.
-   **Smart Previews**: Long text posts are automatically truncated with a "Read More" option.
-   **Engagement**: Like, Comment, and Share functionality.
-   **Optimized Sharing**: Share posts directly to friends or find users via search.

### 💬 **Real-Time Messaging**
-   **Instant Chat**: WhatsApp-style direct messaging powered by **Socket.io**.
-   **Conversations Sidebar**: View active chats and potential connections.
-   **User Search**: integrated search to find and message any user.
-   **Online Status**: Real-time delivery.

### 🔔 **Notification Center**
-   **Activity Tracking**: Get notified for:
    -   **Likes**: When someone likes your post.
    -   **Comments**: When someone comments on your post.
    -   **Follows**: New followers.
-   **Access**: Dedicated Notifications page accessible via the Navbar Bell icon.

### 👥 **Social Graph**
-   **Follow System**: Follow/Unfollow users with **Optimistic UI** (instant feedback).
-   **Profile Stats**: View Followers, Following, and Post counts.
-   **User Discovery**: Search for users and posts globally.

### 🎨 **Modern UI/UX**
-   **Glassmorphism**: Premium "glass" aesthetic across cards and modals.
-   **Responsive**: Fully responsive design for Desktop and Mobile.
-   **Interactive**: Smooth transitions, hover effects, and loading states.

---

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Swiper.js, React Icons.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose).
-   **Real-Time**: Socket.io (for Messaging and Notifications).
-   **Authentication**: JWT (JSON Web Tokens) & Bcrypt.

---

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js (v14+)
-   MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/blogsphere.git
cd blogsphere
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional if using defaults):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:
```bash
npm run dev
```

---

## 🧩 Usage Guide

1.  **Register/Login**: Create an account to get started.
2.  **Create Post**: Use the **"+" Icon** in the navbar to upload images/videos.
3.  **Explore**: Scroll the home feed to see posts from everyone (or create a logic to filter).
4.  **Connect**: Visit profiles and click **Follow**.
5.  **Chat**: Click the **Message Bubble** to start chatting or hit "Message" on a profile.
6.  **Stay Updated**: Check the **Bell Icon** for your latest notifications.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.
