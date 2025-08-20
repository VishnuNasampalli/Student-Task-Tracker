import { create } from "zustand";
import axios from "axios";
axios.defaults.withCredentials = true;
import { toast } from "react-hot-toast";
const BASE_URL = "http://localhost:5001";

// A helper function to get the fetchTasks function from the store
const getFetchTasks = (get) => get().fetchTasks;

export const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    fetchTasks: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`${BASE_URL}/api/tasks/get-tasks`, { withCredentials: true });
            // Ensure the fetched data is always an array
            if (res.data && Array.isArray(res.data.tasks)) {
                set({ tasks: res.data.tasks });
            } else {
                console.error("Fetched tasks data is not an array:", res.data);
                set({ tasks: [] });
            }
        } catch (err) {
            toast.error("Failed to fetch tasks");
            // Also set tasks to an empty array on failure to avoid stale data
            set({ tasks: [] });
        } finally {
            set({ loading: false });
        }
    },
    deleteTask: async (taskId) => {
        try {
            await axios.delete(`${BASE_URL}/api/tasks/delete-task/${taskId}`, { withCredentials: true });
            set((state) => ({
                tasks: state.tasks.filter((task) => task._id !== taskId),
            }));
            toast.success("Task deleted successfully");
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
            throw error;
        }
    },
    updateTask: async (taskId, updatedData) => {
        try {
            const res = await axios.put(`${BASE_URL}/api/tasks/update-task/${taskId}`, updatedData, { withCredentials: true });
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task._id === taskId ? { ...task, ...res.data.task } : task
                ),
            }));
            toast.success("Task updated successfully");
            // FIX: After a successful update, refetch all tasks to ensure data consistency
            // This is especially important if the update changes populated fields.
            await getFetchTasks(get)();
            return res.data.task;
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error(error.response?.data?.message || "Failed to update task");
            throw error;
        }
    },
    /**
     * FIX: Instead of trying to manually add the new task to the local state,
     * we will simply call fetchTasks() again. This guarantees that the new
     * task object is fully populated with creator and assignee details,
     * just like the ones loaded initially.
     */
    createTask: async (taskData) => {
        set({ loading: true }); // Set loading to true to give user feedback
        try {
            const res = await axios.post(`${BASE_URL}/api/tasks/create-task`, taskData, { withCredentials: true });
            toast.success(res.data.message || "Task created successfully");

            // THE FIX IS HERE: Refetch all tasks after creating a new one.
            await getFetchTasks(get)();

        } catch (error) {
            console.error("Error creating task:", error);
            toast.error(error.response?.data?.message || "Failed to create task");
            throw error; // Re-throw the error for the component to handle if needed
        } finally {
            set({ loading: false }); // Ensure loading is set to false
        }
    },
}));