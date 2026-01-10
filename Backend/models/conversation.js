const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender_id: String,
  receiver_id: String,
  context: String,    
  fileUrl: String, 
  fileName:String,
  type: { type: String, default: "text" },
  status: { type: String, default: "sent" },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  chat_room: String,
  Messages: [messageSchema],
});

module.exports = mongoose.model("Cons", conversationSchema);
