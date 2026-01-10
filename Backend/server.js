const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const Conversation = require("./models/conversation.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/uploads", express.static("uploads"));


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

mongoose
  .connect("mongodb://127.0.0.1:27017/ChatApp")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error(err));

function getRoomId(user1, user2) {
  return [user1, user2].sort().join("_"); 
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  
  socket.on("join_chat", async ({ userId, friendId }) => {
    const roomId = getRoomId(userId, friendId);
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);

    let chat = await Conversation.findOne({ chat_room: roomId });
    if (!chat) {
      chat = await Conversation.create({ chat_room: roomId, Messages: [] });
    }

    socket.emit("chat_history", chat.Messages);
  });

  
  socket.on("send_message", async ({ userId, friendId, type, context, fileUrl }) => {
  const roomId = getRoomId(userId, friendId);

  const msgObj = {
    sender_id: userId,
    receiver_id: friendId,
    type: type || "text",
    context: context || null,
    fileUrl: fileUrl || null,
  };

  let chat = await Conversation.findOne({ chat_room: roomId });
  if (!chat) {
    chat = await Conversation.create({ chat_room: roomId, Messages: [msgObj] });
  } else {
    chat.Messages.push(msgObj);
    await chat.save();
  }

  io.to(roomId).emit("new_message", msgObj);
});


  
  socket.on("typing", ({ userId, friendId }) => {
    const roomId = getRoomId(userId, friendId);
    socket.to(roomId).emit("typing", userId);
  });

  socket.on("stop_typing", ({ userId, friendId }) => {
    const roomId = getRoomId(userId, friendId);
    socket.to(roomId).emit("stop_typing", userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
