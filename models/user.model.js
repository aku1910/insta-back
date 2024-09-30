import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
    },
    userName: {
        type:String,
        required:true,
        unique: true

    },
    password: {
        type: String,
        required: true
    },
  
    
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    profilePic: {
        type: String,
        required: true
    }
});


const userModel = mongoose.model("User", userSchema);

export default userModel;
