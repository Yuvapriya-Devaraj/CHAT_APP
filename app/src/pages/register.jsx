import React from "react"
import { useState } from  "react";
import { useNavigate } from  "react-router-dom";
import "../App.css"

function Register(){

    const navigate = useNavigate();

    console.log("API URL:", process.env.REACT_APP_API_URL);
    const [form, setForm] = useState({
        user_name:"",
        user_id:"",
        password:"",
        confirm_password:""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  //  const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(form.password !== form.confirm_password){
            alert("Passwords do not match");
            return;
        }
        
        try{
        const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`,{
            method:"POST",
            headers: { "Content-type":"application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if(res.status === 201){
            setSuccess(data.message);
            setForm({user_name:"", user_id: "", password: "", confirm_password: "" });

            setTimeout(() => {
                navigate("/");
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
               
                <form onSubmit={handleSubmit} className="login_container">
                <div className="text">
                Register
                </div>
                <input name="user_name" type="text" value={form.user_name} className="custom-input " onChange={handleChange} placeholder="user_name" required/>
                <input name="user_id" type="text" value={form.user_id} className="custom-input " onChange={handleChange} placeholder="user_id" required />
                <input name="password" type="password" value={form.password} className="custom-input " onChange={handleChange} placeholder="password" required />
                <input name="confirm_password" type="password" value={form.confirm_password} className="custom-input " onChange={handleChange} placeholder="confirm_password" required />
                <button className="btn text" type="submit">register</button>

                {error && <p style={{color: "red"}}>{error}</p>}
                {success && <p style={{color: "green"}}>{success}</p>}
                </form>
            </div>
        </div>
    );
}

export default Register;