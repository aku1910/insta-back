import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";

const protectRoute = async (request, response, next) => {
    try {
        // Allow access to the /auth/newPassword route without authentication
        if (request.path === '/auth/newPassword') {
            return next();
        }

        const token = request.cookies.jwt;
        if (!token) {
            return response.status(401).send({ error: "No token provided - Unauthorized user" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return response.status(401).send({ error: "Invalid token - Unauthorized user" });
        }

        const user = await User.findOne({ _id: decode._id });
        if (!user) {
            return response.status(401).send({ error: "User not found - Unauthorized user" });
        }

        request.user = user;
        request.userId = decode._id;

        next();
    } catch (error) {
        console.log(`Error in protectRoute middleware: ${error}`);
        response.status(500).send({ error: "Server error" });
    }
};

export default protectRoute;
