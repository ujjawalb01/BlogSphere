
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import http from "http";

import { fileURLToPath } from "url";
import { Server } from "socket.io";

// Routes
import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import uploadRoutes from "./routes/upload.js";
import followRoutes from "./routes/follow.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

// ===============================
// __dirname for ES Modules
// ===============================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// Environment validation
// ===============================

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`${key} is missing`);
    process.exit(1);
  }
}

// ===============================
// Express
// ===============================

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

app.use(helmet());

// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===============================
// Body parser and cookies
// ===============================

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ===============================
// Socket.IO
// ===============================

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.io = io;

// ===============================
// Socket events
// ===============================

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId.toString());
  });

  socket.on("send_message", (data) => {
    if (data && data.receiver) {
      io.to(data.receiver.toString()).emit("newMessage", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ===============================
// Static uploads
// ===============================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===============================
// API routes
// ===============================

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// ===============================
// Error handler
// ===============================

app.use(errorHandler);

// ===============================
// MongoDB connection
// ===============================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
