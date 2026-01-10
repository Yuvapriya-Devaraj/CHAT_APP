const User = require ("../models/user.js");
const bcrypt = require("bcrypt");

function isValidPassword(password){
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{1,8}$/;
    return regex.test(password);
}

exports.registerUser = async (req,res) => {

    const { user_name, user_id, password, confirm_password } = req.body;

    if(password !== confirm_password){
        return res.status(400).json({message:"Passwords do not match"});
    }

    if(!isValidPassword(password)){
        return res.status(400).json({ message: "Password invalid" });
    }
    try{
    const existingUser = await User.findOne({ user_id });
    if(existingUser){
        return res.status(400).json({message: "User ID exists" });
    }

    const hashedPassword = await bcrypt.hash(password,10);
    await User.create({ user_name,user_id,password: hashedPassword });

    res.status(201).json({message: "Registration successful"})
   }catch(err){
       console.error(err);
       res.status(500).json({message:"server error"});
   }   
};

exports.loginUser = async (req,res) => {

    const { user_name, user_id, password } =req.body;
    try{
    const user = await User.findOne({ user_id });
    if(!user){
        return res.status(400).json({message: "Invalid user_id or password" });
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid user_id or password"});
    }

    res.status(200).json({message: "Login successful",user_name: user.user_name, user_id: user.user_id})
   }catch(err){
    return res.status(500).json({message: "Server error"});
   }
};