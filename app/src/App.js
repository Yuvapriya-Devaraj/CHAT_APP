import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import Buddy from "./pages/buddy";
import {connectSocket} from socket.js;
import {useEffect} from "react";


function App(){
  useEffect(() => {
    connectSocket(); 
  }, []);

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/buddy" element={<Buddy />} />
      <Route path="/home" element={<Home />} />
    </Routes>
    </BrowserRouter>
  )
};

export default App;