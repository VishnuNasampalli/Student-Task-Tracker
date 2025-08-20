import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Import User model to fetch role

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.id).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.userId = user._id;
        req.userRole = user.role; // New: Attach user's role to the request
        req.user = user; // Attach full user object for convenience

        next(); // Proceed to the next middleware/controller

    } catch (err) {
        console.error("Error in protectedRoute:", err);
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized - Token expired" });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export { protectedRoute };
