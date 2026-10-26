import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
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

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname =
  path.dirname(__filename);

// ===============================
// Environment validation
// ===============================

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is missing"
  );

  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is missing"
  );

  process.exit(1);
}

// ===============================
// Express
// ===============================

const app = express();

const server =
  http.createServer(app);

// ===============================
// Socket.IO
// ===============================

const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    methods: [
      "GET",
      "POST"
    ]
  }
});

// Make Socket.IO available globally
global.io = io;

// ===============================
// Socket events
// ===============================

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // Join user's room
  socket.on(
    "join_room",
    (userId) => {
      socket.join(
        userId.toString()
      );
    }
  );

  // Send message
  socket.on(
    "send_message",
    (data) => {
      if (
        data &&
        data.receiver
      ) {
        io
          .to(
            data.receiver.toString()
          )
          .emit(
            "newMessage",
            data
          );
      }
    }
  );

  socket.on(
    "disconnect",
    () => {
      console.log(
        "Socket disconnected:",
        socket.id
      );
    }
  );
});

// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173"
  })
);

// ===============================
// Body parser
// ===============================

app.use(
  express.json()
);

// ===============================
// Static uploads
// ===============================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// ===============================
// API routes
// ===============================

app.use(
  "/api/user",
  userRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/follow",
  followRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// ===============================
// Error handler
// ===============================

app.use(errorHandler);

// ===============================
// MongoDB connection
// ===============================

mongoose
  .connect(
    process.env.MONGODB_URI
  )
  .then(() => {
    console.log(
      "MongoDB connected"
    );

    const PORT =
      process.env.PORT || 5000;

    server.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );

    process.exit(1);
  });