import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Setup user socket
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    console.log("User Joined:", userData._id);

    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);

    console.log("Joined Room:", room);
  });

  // Typing indicator
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  // Send message
  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat;

    if (!chat.users) return;

    chat.users.forEach((user) => {

      // Don't send to self
      if (user._id == newMessage.sender._id) return;

      // Send message to each user
      socket.in(user._id).emit(
        "message received",
        newMessage
      );
    });
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});