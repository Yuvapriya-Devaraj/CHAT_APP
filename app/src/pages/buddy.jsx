import React, {useState, useEffect, useCallback } from  "react";
import{ useLocation,useNavigate} from "react-router-dom";
import { getSocket } from "../socket";

import "../App.css";

function Buddy( ){
    const navigate =useNavigate();
    const location = useLocation();
  const user = location.state?.user || localStorage.getItem("userId");
  const name=location.state?.name || localStorage.getItem("name");
  console.log("Logged in user:", user);

    const [contacts,setContacts] = useState([]);
    const [friendId, setFriendId] = useState("");


const addFriend = async () => {
  if (!friendId.trim()) {
    alert("Enter a user id");
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/add-friend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user,
        friend_id: friendId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    setFriendId("");
    loadFriends(); 
  } catch (err) {
    alert("Server error");
  }
};
const loadFriends = useCallback(async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/chat/friends/${user}`
  );
  const data = await res.json();
  setContacts(data);
});
useEffect(() => {
  loadFriends();
}, [user, loadFriends]);

const handleLogout = () => {
  localStorage.clear();

  const socket = getSocket();
  if (socket) {
    socket.disconnect();
  }

  navigate("/");  // go to login page
};

const openChat = (friend) => {
    navigate("/home", {
      state: {
        user: user,
        friend: friend, 
      },
    });
  };
   
    return(
        <div>
            <div className="screen">
        <div className="topper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="profile">
                <div className="text">{name[0].toUpperCase()}</div>
            </div>
            <div className="text pagetop">Chat with Buddy 😉</div>
            <button onClick={handleLogout} className="logout-btn">
    Logout
  </button>
            </div>
    <div className="add-friend-box">
      <input
        className="custom-input"
        placeholder="Enter friend user_id"
        value={friendId}
        onChange={(e) => setFriendId(e.target.value)}
      />
      <button className="btn text" onClick={addFriend}>
        Add Friend
      </button>
    </div >
    <div className="friends-container">
  <div className="friends-grid">
    {contacts.map((c) => (
      <div
        key={c.user_id}
        className="friend-card text"
        onClick={() => openChat(c)}
      >
        <div className="profile">{c.user_name[0].toUpperCase()}</div>
        <span className="friend-name">{c.user_id}</span>
      </div>
    ))}
  </div>
</div>

</div>
</div>
    );
}

export default Buddy;