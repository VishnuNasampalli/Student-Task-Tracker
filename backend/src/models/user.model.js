import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // New: Add a role field, defaulting to 'student'
    role: {
        type: String,
        enum: ['student', 'instructor'], // Enforce specific roles
        default: 'student',
    }
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);
export default User;