import express from 'express';
import { protectedRoute } from '../middlewares/protectedRoute.js';
import { createTask, getTask, updateTask, deleteTask, getAllStudents } from '../controllers/task.controller.js';

const router = express.Router();

router.post("/create-task", protectedRoute, createTask); // create a new task
router.get("/get-tasks", protectedRoute, getTask); // view all tasks for a user (personal or assigned)
router.put("/update-task/:id", protectedRoute, updateTask); // update a task by id
router.delete("/delete-task/:id", protectedRoute, deleteTask); // delete a task by id

// New: Route for instructors to get all students
router.get("/get-all-students", protectedRoute, getAllStudents);

export { router as taskRoutes };
