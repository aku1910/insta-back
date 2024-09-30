import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../generateTokenandSetCookie.js";
import nodemailer from "nodemailer"

var transport = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: "api",
        pass: "bace1c189f06d8cf801d085d11fc74dc"
    }
});

export const signup = async (request, response) => {
    try {
        const { email, fullName, userName, password } = request.body;
        const file = request.file

        if (!file) {
            return response.status(400).send({ error: "please upload on image" })
        }

        if (!email || !fullName || !userName || !password) {
            return response.status(400).send({ error: "Please fill up all fields" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { userName }] });

        if (existingUser) {
            if (existingUser.email === email) {
                return response.status(400).send({ error: "Email is already in use, please try another email" });
            } else if (existingUser.userName === userName) {
                return response.status(400).send({ error: "Username is already taken, please try another username" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            fullName,
            userName,
            password: hashedPassword,
            profilePic: file.path
        });

        if (!newUser) {
            return response.status(500).send({ error: "Failed to create user" });
        }

        generateTokenAndSetCookie(newUser._id, response);


        response.status(201).send(newUser);
    } catch (error) {
        console.error(`Error in signup controller: ${error.message}`);
        response.status(500).send("An internal server error occurred, please try again later");
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { email, fullName, userName, password } = req.body;
        const userId = req.user.id;

        const updates = {};
        if (email) updates.email = email;
        if (fullName) updates.fullName = fullName;
        if (userName) updates.userName = userName;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }
        if (req.file) updates.profilePic = req.file.path;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(400).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(`Error in updateProfile: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signin = async (request, response) => {
    try {
        const { email, password } = request.body
        if (!email || !password) {
            return response.status(404).send({ error: "please filled up all fields" })
        }
        const user = await User.findOne({ email }).populate('followers', 'fullName userName profilePic').populate('following', 'fullName userName profilePic');

        if (!user) {
            return response.status(404).send({ error: "incorrect email or password" })
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)

        if (!isCorrectPassword) {
            return response.status(404).send({ error: "incorrect email or password" })
        }

        generateTokenAndSetCookie(user._id, response)

        response.status(201).send({ user })

    } catch (error) {
        console.error(`Error in signup controller: ${error.message}`);
        response.status(500).send("An internal server error occurred, please try again later");
    }
}

export const getUserProfile = async (request, response) => {
    try {
        const userId = request.params.userId;

        if (!userId) {
            return response.status(400).send({ message: 'User ID is required' });
        }

        const user = await User.findById(userId).populate('followers following');

        if (user) {
            response.json(user);
        } else {
            response.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        response.status(400).send({ message: error.message });
    }
};

export const followUser = async (request, response) => {
    try {
        const userToFollow = await User.findById(request.params.id);
        const loggedInUser = await User.findById(request.userId);

        if (!userToFollow) {
            return response.status(404).send({ error: "User to follow not found" });
        }

        if (!loggedInUser) {
            return response.status(404).send({ error: "Logged in user not found" });
        }

        if (userToFollow._id.toString() === loggedInUser._id.toString()) {
            return response.status(400).send({ error: "Users cannot follow themselves" });
        }

        const isFollowing = loggedInUser.following.includes(userToFollow._id);

        if (isFollowing) {
            loggedInUser.following = loggedInUser.following.filter(
                userId => userId.toString() !== userToFollow._id.toString()
            );
            userToFollow.followers = userToFollow.followers.filter(
                userId => userId.toString() !== loggedInUser._id.toString()
            );

            await loggedInUser.save();
            await userToFollow.save();

            return response.status(200).send({ message: "User Unfollowed" });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            return response.status(200).send({ message: "User Followed" });
        }
    } catch (error) {
        console.error("Error in followUser:", error);
        return response.status(500).send({ error: "Internal Server Error" });
    }
};

export const resetPassword = async (request, response) => {
    const { email, newPassword, confirmPassword } = request.body
    if (!email || !newPassword || !confirmPassword) {
        return response.status(400).send({ error: "Please fill up all fields" })
    }

    const user = await User.findOne({ email })
    
    
    if (!user) {
        return response.status(404).send({ error: "User not found" })
    }

    if (newPassword !== confirmPassword) {
        return response.status(404).send({ error: "New Password and Confirm Paswword not equal" })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findOneAndUpdate({ email }, { $set: { password: hashedPassword } })

    if (!updatedUser) {
        return response.status(404).send({ error: "Could't update the password" })
    }

    return response.status(200).send(updatedUser)

}

export const forgetPassword = async (request, response) => {
    const { email } = request.body

    if (!email) {
        return response.status(404).send({ error: "Please filled up all fields" })
    }

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
        return response.status(404).send({ error: "You re not sign up. Please create an account" })
    }

    transport.sendMail({
        from: "facebook@demomailtrap.com",
        to: email,
        subject: "Forget Password",
        html: "<a href='http://localhost:3000/auth/newPassword'>Reset Password Link</a>",
    })
}

export const logout = async (request, response) => {
    response.cookie("jwt", "")
    response.status(201).send({ message: "logout is succesfully" })
}


