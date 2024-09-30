import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../generateTokenandSetCookie.js';
import Admin from '../models/admin.model.js';
import User from "../models/user.model.js"; // Make sure the path is correct


// Admin signup controller
export const adminSignup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ error: "Please fill up all fields" });
        }

        const existingAdmin = await Admin.findOne({ email });
        
        if (existingAdmin) {
            return res.status(400).send({ error: "Email is already in use, please try another email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newAdmin = await Admin.create({
            email, 
            password: hashedPassword,
        });

        if (!newAdmin) {
            return res.status(500).send({ error: "Failed to create user" });
        }

        generateTokenAndSetCookie(newAdmin._id,res)

        res.status(201).send(newAdmin);
    } catch (error) {
        console.error(`Error in signup controller: ${error.message}`);
        res.status(500).send("An internal server error occurred, please try again later");
    }
};

// Admin sign-in controller
export const adminSignin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ error: "Please fill up all fields" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).send({ error: "Incorrect email or password" });
        }

        const isCorrectPassword = await bcrypt.compare(password, admin.password);

        if (!isCorrectPassword) {
            return res.status(401).send({ error: "Incorrect email or password" });
        }
        generateTokenAndSetCookie(admin._id,res)

        res.status(200).send({ admin });

    } catch (error) {
        console.error(`Error in signin controller: ${error.message}`);
        res.status(500).send("An internal server error occurred, please try again later");
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params; // Kullanıcı ID'sini request parametrelerinden alın

        if (!userId) {
            return res.status(400).send("Invalid request format. 'userId' is required.");
        }

        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).send("User not found.");
        }

        res.status(200).send("User deleted successfully");
    } catch (error) {
        console.error(`Error in delete user: ${error.message}`);
        res.status(500).send("An internal server error occurred, please try again later");
    }
}


export const  getAllUsers = async(req, res) =>{
    try{

        const users = await User.find({})
        res.status(200).send({ users });
        
    }catch(error){
        console.error(`Error in get all users: ${error.message}`);
        res.status(500).send("An internal server error occurred, please try again later");
    }
}

