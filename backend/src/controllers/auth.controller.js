import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        generateToken(user._id, res);

        // New: Return user's role
        res.status(200).json({ message: "Login successful", id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        console.error("error in login:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const register = async (req, res) => {
    // New: Destructure 'role' from req.body, default to 'student' if not provided
    const { name, email, password, role = "student" } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // New: Validate the provided role
        if (!['student', 'instructor'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = User({
            name,
            email,
            password: hashedPassword,
            role // New: Assign the role
        })

        if (newUser) {
            await newUser.save();
            generateToken(newUser._id, res);
            // New: Return user's role
            return res.status(201).json({ message: "User created successfully", id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role });
        } else {
            return res.status(400).json({ message: "User creation failed" });
        }
    } catch (err) {
        console.error("error in signup:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error("error in logout:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const checkUser = async (req, res) => {
    try {
        // New: Select role as well
        const user = await User.findById(req.userId).select("name email role");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // New: Return user's role
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role // Include role in the response
        });
    } catch (err) {
        console.error("❌ Error in checkUser:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { login, register, logout, checkUser };
