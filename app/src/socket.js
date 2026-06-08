import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  socket = io(process.env.REACT_APP_API_URL, {
    transports: ["websocket"],
    auth: {
      token: localStorage.getItem("token"),
    },
  });

  return socket;
};

export const getSocket = () => socket;
