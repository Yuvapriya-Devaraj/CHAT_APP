
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_name: { type:String, required: true},
    user_id: { type:String, unique: true, required: true},
    password: { type:String, required: true},

    friends: [
        {
            user_id: String,
            user_name: String
        }
    ]
});

module.exports =  mongoose.model('User',userSchema);