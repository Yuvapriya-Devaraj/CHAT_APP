import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
//import socket from "../socket";
import { getSocket } from "../socket";

function Home() {
  const socket = getSocket();

  const joinedRef = useRef(false);
  const messagesEndRef = useRef(null);

  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);

const location = useLocation();

// Logged-in user
  const userId = location.state?.user || localStorage.getItem("userId");
  const friend = location.state?.friend || JSON.parse(localStorage.getItem("friend"));
  const friendId = friend.user_id;

// Chatting friend
//const friend =
 // location.state?.friend ||
  //JSON.parse(localStorage.getItem("chatFriend"));
//const friendId = friend?._id;

  useEffect(() => {
  if (!socket || !friendId) return;
  console.log("My ID:", userId);
console.log("Friend ID:", friendId);


  socket.emit("join_chat", { userId, friendId });

  socket.off("chat_history");
  socket.off("new_message");
  socket.off("typing");
  socket.off("stop_typing");

  socket.on("chat_history", (history) => {
  setMessages(
    history.map((m) => ({
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      message: m.context || "",  
      fileUrl: m.fileUrl || "",  
      type: m.type || "text",    
      status: m.status || "sent",
    }))
  );
});

socket.on("new_message", (msg) => {
  setMessages((prev) => [
    ...prev,
    {
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      message: msg.context || "",
      fileUrl: msg.fileUrl || "",
      type: msg.type || "text",
      status: msg.status || "sent",
    },
  ]);
});


  socket.on("typing", (id) => {
    if (id === friendId) setTyping(true);
  });

  socket.on("stop_typing", () => setTyping(false));

  return () => {
    socket.off("chat_history");
    socket.off("new_message");
    socket.off("typing");
    socket.off("stop_typing");
  };
}, [ friendId]);

  const sendMessage = () => {
  if (!message.trim()) return;
  socket.emit("send_message", {
    friendId,
    type: "text",
    context: message,  
    fileUrl: null,
    filename:null,
  });
  setMessage("");
};



  
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { friendId });
    setTimeout(() => socket.emit("stop_typing", { friendId }), 1000);
  };

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect =() => {
    fileInputRef.current.click();
  }

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("sender_id", userId);
  formData.append("receiver_id", friendId);

  const res = await fetch("http://localhost:5000/chat/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  socket.emit("send_message", {
    friendId,
    type: data.type,      
    context: null,
    fileUrl: data.url,
     filename: data.filename,
  });
};

  return (
    <div className="screen">
      <div className="topper">
        <div className="profile">
          <div className="text">{friend.user_name[0].toUpperCase()}</div>
        </div>
        <div className="text pagetop">Its your buddy "{friend.user_id}"</div>
      </div>

      <div className="chat-window ">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.sender_id === userId ? "message-sent" : "message-received"
            }
          >
          <div className="text" style={{color:"black"}}>  {msg.type === "text" && msg.message}

{msg.type === "image" && (
  <img src={`http://localhost:5000${msg.fileUrl}`} className="chat-image" alt="sent" />
)}

{msg.type === "video" && (
  <video controls className="chat-video" src={`http://localhost:5000${msg.fileUrl}`} />
)}

{msg.type === "file" && (
  <a
    href={`http://localhost:5000${msg.fileUrl}`}
    target="_blank"
    rel="noopener noreferrer"
    className="chat-file"
  >
    📄 {msg.filename || "Download file"}
  </a>
)}
</div>
      
          </div>
        ))}
        {typing && <div className="typing">{friend.user_name} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-prompt">
        <button className="add-btn text" onClick={handleFileSelect}>+</button>
        <input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  onChange={handleFileUpload}
/>

        <input
          value={message}
          onChange={handleTyping}
          className="custom-input"
          placeholder="Type a message..."
        />
        <button className="send-btn text" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Home;
