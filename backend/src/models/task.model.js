import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    // Renamed from userId to createdBy to indicate who initiated the task
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // New: If an instructor assigns a task, this will store the student's ID
    // If it's a personal task, this can be null or the same as createdBy
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Default to null, meaning not assigned to a specific student initially
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    }
}, {
    timestamps: true,
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
