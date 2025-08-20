import { create } from "zustand";
import axios from "axios";
axios.defaults.withCredentials = true;
import { toast } from "react-hot-toast";
const BASE_URL = "http://localhost:5001/api/auth";
const TASK_BASE_URL = "http://localhost:5001/api/tasks"; // New: For fetching students

export const useAuthStore = create((set) => ({
    authUser: null, // Will now also contain 'role'
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    students: [], // New: To store list of students for instructors

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        console.log("🔍 Checking authentication...");
        try {
            const response = await axios.get(`${BASE_URL}/check-user`, { withCredentials: true });
            console.log("✅ Authenticated user:", response.data);
            // New: Store the full user object including role
            set({ authUser: response.data, isCheckingAuth: false });
        } catch (error) {
            console.error("❌ Error checking authentication:", error);
            set({ authUser: null, isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        console.log("✍️ Signing up with data:", data);
        try {
            // Backend defaults role to 'student', so we don't need to send it from frontend register
            const res = await axios.post(`${BASE_URL}/register`, data);
            console.log("✅ Signup successful:", res.data);
            // New: Store the full user object including role
            set({ authUser: res.data });
            toast.success("Account created successfully");
        } catch (error) {
            console.error("❌ Signup error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        console.log("🔐 Logging in with data:", data);
        try {
            const res = await axios.post(`${BASE_URL}/login`, data);
            console.log("✅ Login successful:", res.data);
            // New: Store the full user object including role
            set({ authUser: res.data });
            toast.success("Logged in successfully");
        } catch (error) {
            console.error("❌ Login error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        console.log("🚪 Logging out...");
        try {
            await axios.post(`${BASE_URL}/logout`, { withCredentials: true });
            console.log("✅ Logout successful");
            set({ authUser: null, students: [] }); // Clear students on logout
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("❌ Logout error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    // New: Function for instructors to fetch all students
    getStudents: async () => {
        try {
            const res = await axios.get(`${TASK_BASE_URL}/get-all-students`, { withCredentials: true });
            set({ students: res.data.students });
        } catch (error) {
            console.error("❌ Error fetching students:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Failed to fetch students");
        }
    },
}));
