import Task from "../models/task.model.js";
import User from "../models/user.model.js"; // Import User model to populate names

const createTask = async (req, res) => {
    const { title, description, dueDate, priority } = req.body;
    const createdById = req.userId; // User ID from protectedRoute
    const creatorRole = req.userRole; // Role from protectedRoute

    try {
        if (!title || !description || !dueDate || !priority) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        if (creatorRole === 'instructor') {
            // Instructor is creating a task for ALL students
            const students = await User.find({ role: 'student' }).select('_id'); // Get all student IDs

            if (students.length === 0) {
                return res.status(404).json({ message: "No students found to assign tasks to." });
            }

            const tasksToCreate = students.map(student => ({
                createdBy: createdById,
                assignedTo: student._id, // Assign to each individual student
                title,
                description,
                dueDate,
                priority,
                status: 'pending',
            }));

            const createdTasks = await Task.insertMany(tasksToCreate);
            return res.status(201).json({
                message: `Task created for ${createdTasks.length} students successfully.`,
                tasks: createdTasks
            });

        } else if (creatorRole === 'student') {
            // Student is creating a personal task
            const newTask = new Task({
                createdBy: createdById,
                assignedTo: createdById, // Student's personal task
                title,
                description,
                dueDate,
                priority,
                status: 'pending',
            });

            await newTask.save();
            return res.status(201).json({ message: "Personal task created successfully.", task: newTask });

        } else {
            return res.status(403).json({ message: "Unauthorized role to create tasks." });
        }

    } catch (err) {
        console.error("Error in createTask:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getTask = async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;

    try {
        let tasks;
        if (userRole === 'student') {
            // Students see tasks they created (personal) AND tasks assigned to them by an instructor
            tasks = await Task.find({
                $or: [
                    { createdBy: userId, assignedTo: userId }, // Tasks they personally created
                    { assignedTo: userId, createdBy: { $ne: userId } } // Tasks assigned to them by someone else (instructor)
                ]
            }).populate('createdBy', 'name role').populate('assignedTo', 'name role');
        } else if (userRole === 'instructor') {
            // Instructors see tasks they created (which are assigned to students)
            tasks = await Task.find({ createdBy: userId })
                .populate('createdBy', 'name role')
                .populate('assignedTo', 'name role');
        } else {
            return res.status(403).json({ message: "Unauthorized role." });
        }

        res.status(200).json({ tasks });

    } catch (err) {
        console.error("Error in getTask:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// In task.controller.js

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, priority, status } = req.body;
    const userId = req.userId; // This is an ObjectId object
    const userRole = req.userRole;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Convert Mongoose ObjectIds to strings for comparison
        const taskCreatorId = task.createdBy.toString();
        const taskAssignedToId = task.assignedTo ? task.assignedTo.toString() : null;

        // --- THE FIX ---
        // Convert the userId from the middleware (which is an object) to a string
        const userIdString = userId.toString();

        // --- Authorization Logic ---
        if (userRole === 'student') {
            // Use the string version for all comparisons
            if (taskAssignedToId === userIdString) {
                if (taskCreatorId === userIdString) { // Personal task
                    // Student can update all fields
                    if (title !== undefined) task.title = title;
                    if (description !== undefined) task.description = description;
                    if (dueDate !== undefined) task.dueDate = dueDate;
                    if (priority !== undefined) task.priority = priority;
                    if (status !== undefined) task.status = status;
                } else { // Instructor-assigned task
                    // Student can ONLY update status
                    if (Object.keys(req.body).length === 1 && req.body.hasOwnProperty('status')) {
                        if (status !== undefined) task.status = status;
                    } else {
                        return res.status(403).json({ message: "As a student, you can only update the status of tasks assigned by an instructor." });
                    }
                }
            } else {
                return res.status(403).json({ message: "As a student, you are not authorized to update this task." });
            }
        } else if (userRole === 'instructor') {
            if (taskCreatorId === userIdString) { // Use the string version here too
                if (title !== undefined) task.title = title;
                if (description !== undefined) task.description = description;
                if (dueDate !== undefined) task.dueDate = dueDate;
                if (priority !== undefined) task.priority = priority;
                if (status !== undefined) task.status = status;
            } else {
                return res.status(403).json({ message: "As an instructor, you can only update tasks you have assigned." });
            }
        } else {
            return res.status(403).json({ message: "Unauthorized role." });
        }

        await task.save();
        const updatedTask = await Task.findById(task._id).populate('createdBy', 'name role').populate('assignedTo', 'name role');
        res.status(200).json({ message: "Task updated successfully", task: updatedTask });

    } catch (err){
        console.error("Error in updateTask:", err);
    return res.status(500).json({ message: "Internal server error" });
}
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // This is an ObjectId object
    const userRole = req.userRole;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // --- THE FIX ---
        // Convert the userId from the middleware (which is an object) to a string
        const userIdString = userId.toString();

        if (userRole === 'student') {
            // Use the string version for the comparison
            if (task.createdBy.toString() === userIdString && task.assignedTo.toString() === userIdString) {
                await Task.deleteOne({ _id: id });
                return res.status(200).json({ message: "Task deleted successfully" });
            } else {
                return res.status(403).json({ message: "As a student, you can only delete your personal tasks." });
            }
        } else if (userRole === 'instructor') {
            // Use the string version here too
            if (task.createdBy.toString() === userIdString) {
                await Task.deleteOne({ _id: id });
                return res.status(200).json({ message: "Task deleted successfully" });
            } else {
                return res.status(403).json({ message: "As an instructor, you can only delete tasks you have assigned." });
            }
        } else {
            return res.status(403).json({ message: "Unauthorized role." });
        }

    } catch (err) {
        console.error("Error in deleteTask:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAllStudents = async (req, res) => {
    const userRole = req.userRole;
    try {
        if (userRole !== 'instructor') {
            return res.status(403).json({ message: "Only instructors can view students." });
        }
        const students = await User.find({ role: 'student' }).select('name email');
        res.status(200).json({ students });
    } catch (err) {
        console.error("Error in getAllStudents:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export { createTask, getTask, updateTask, deleteTask, getAllStudents };
