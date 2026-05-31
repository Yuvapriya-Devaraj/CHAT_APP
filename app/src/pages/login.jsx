import React from "react"
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import { connectSocket } from "../socket"; 
import "../App.css"

function Login(){
    const navigate = useNavigate();
    
        const [form, setForm] = useState({
            user_name:"",
            user_id:"",
            password:"",
        });
    
        const [error, setError] = useState("");
        const [success, setSuccess] = useState("");
     //   const [showPassword, setShowPassword] = useState(false);
    
        const handleChange = (e) => {
            setForm({ ...form, [e.target.name]: e.target.value });
            setError("");
            setSuccess("");
        }
    
        const handleSubmit = async (e) => {
            e.preventDefault();

            if(!form.user_id || !form.password){
                setError("All fields are required");
                return;
            }
            
            try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`,{
                method:"POST",
                headers: { "Content-type":"application/json" },
                body: JSON.stringify(form)
            });
    console.log("Form sent:", form);

const data = await res.json();
console.log("Response from backend:", data);

            if(res.status === 200){
                setSuccess(data.message);

                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user_id);

                console.log(data.token);
                console.log(data.user_id);
                
                connectSocket();

                setTimeout(() => {
                    navigate("/buddy", {state: {user: data.user_id,name: data.user_name}});
                },1000);
            }else{
                setError(data.message);
            }
        }catch(err){
            alert("Server error");
        }
        };
    return (
        <div className="screen">
             <header className="text title">CHATO</header>
              <div className="login_page">
               
                <div className="login_container">
                <form onSubmit={handleSubmit} className="login_container">
                <div className="text">
                Login
                
                </div>
                <input type="text" name="user_name" className="custom-input " placeholder="user_name" value={form.user_name} onChange={handleChange} />
                <input type="text" name="user_id" className="custom-input " placeholder="user_id" value={form.user_id} onChange={handleChange}/>
                <input type="password" name="password" className="custom-input " placeholder="password" value={form.password} onChange={handleChange} />
                <button className="btn text" type="submit">login</button>
                </form>
            </div>
             <a href="/register" className="link">new user?register</a>
        </div>
        {error && <p style={{color: "red"}}>{error}</p>}
        {success && <p style={{color: "green"}}>{success}</p>}
            </div>
            
    );
}

export default Login;