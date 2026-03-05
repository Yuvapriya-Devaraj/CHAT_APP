require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const Conversation = require("./models/conversation.js");
const socketAuth = require("./middlewares/socketAuth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect("mongodb://127.0.0.1:27017/ChatApp")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error(err));


// ================== SOCKET LOGIC ==================

function getRoomId(user1, user2) {
  return [String(user1), String(user2)]
    .sort()
    .join("_");   // 👈 THIS IS THE FIX
}

const onlineUsers = new Map();

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  console.log("Authenticated user:", socket.user.id);

  const userId = socket.user.user_id; // always from token
  onlineUsers.set(userId, socket.id);
  io.emit("user_online", userId);

  // ---------------- JOIN CHAT ----------------
  socket.on("join_chat", async ({ userId, friendId }) => {
    if (!friendId) return console.log("join_chat missing friendId");

    const roomId = getRoomId(userId, friendId);
    socket.join(roomId);

    console.log(`${userId} joined room ${roomId}`);

    let chat = await Conversation.findOne({ chat_room: roomId });
    if (!chat) {
      chat = await Conversation.create({ chat_room: roomId, Messages: [] });
    }

    socket.emit("chat_history", chat.Messages);
  });

  socket.on("mark_seen", async ({ friendId }) => {
  const roomId = getRoomId(userId, friendId);

  await Conversation.updateOne(
    { chat_room: roomId },
    { $set: { "Messages.$[elem].status": "seen" } },
    { arrayFilters: [{ "elem.receiver_id": userId }] }
  );

  io.to(roomId).emit("message_seen");
});

  // ---------------- SEND MESSAGE ----------------
  socket.on("send_message", async ({ friendId, type, context, fileUrl }) => {
    if (!friendId) return console.log("send_message missing friendId");

    const roomId = getRoomId(userId, friendId);

    const msgObj = {
      sender_id: userId,
      receiver_id: friendId,
      type: type || "text",
      context,
      fileUrl,
    };

    let chat = await Conversation.findOne({ chat_room: roomId });
    if (!chat) {
      chat = await Conversation.create({ chat_room: roomId, Messages: [msgObj] });
    } else {
      chat.Messages.push(msgObj);
      await chat.save();
    }

    console.log("Emitting new_message to room:", roomId, msgObj);
    io.to(roomId).emit("new_message", msgObj);
  });


  // ---------------- TYPING ----------------
  socket.on("typing", ({ friendId }) => {
    const userId = socket.user.id;
    const roomId = getRoomId(userId, friendId);

    socket.to(roomId).emit("typing", userId);
  });

  socket.on("stop_typing", ({ friendId }) => {
    const userId = socket.user.id;
    const roomId = getRoomId(userId, friendId);

    socket.to(roomId).emit("stop_typing", userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    onlineUsers.delete(userId);
    io.emit("user_offline", userId);
  });
});

server.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
