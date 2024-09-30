// adminProtect.js (or equivalent)
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js'; // Adjust path if needed

export const adminProtect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).send({ error: "No token provided - Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).send({ error: "Invalid token - Unauthorized" });
        }

        const admin = await Admin.findById(decoded._id);
        if (!admin) {
            return res.status(401).send({ error: "Admin not found - Unauthorized" });
        }

        req.admin = admin; // Make sure to set req.admin
        req.adminId = decoded._id; // Or set req.user if you use user instead of admin

        next();
    } catch (error) {
        console.error(`Error in protectRoute middleware: ${error.message}`);
        res.status(500).send({ error: "Internal Server Error" });
    }
};
