import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
// Import AnimatePresence and motion from Framer Motion
import { AnimatePresence, motion } from 'framer-motion';
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import ThemeSwitcher from "./components/theme-switcher.jsx";

// **THE FIX IS HERE**: Define the new "behind to front" animation
const pageTransition = {
  initial: {
    opacity: 0,
    scale: 0.95, // Start slightly smaller
  },
  animate: {
    opacity: 1,
    scale: 1, // Animate to full size
    transition: {
      type: "tween",
      ease: "circOut", // A smooth easing for this effect
      duration: 0.4, // A bit faster for a snappy feel
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95, // Shrink back down on exit
    transition: {
      type: "tween",
      ease: "circIn",
      duration: 0.4,
    },
  },
};

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation(); // Get the current route location

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth)
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* AnimatePresence handles the exit animations. 
        `mode='wait'` ensures the exiting page finishes its animation before the new one enters.
      */}
      <AnimatePresence mode='wait'>
        {/* We pass the location.key to Routes. This tells AnimatePresence that the route has changed. */}
        <Routes location={location} key={location.key}>
          {/* Public Routes */}
          <Route
            path="/"
            element={!authUser ? <PageWrapper><Home /></PageWrapper> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/login"
            element={!authUser ? <PageWrapper><Login /></PageWrapper> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!authUser ? <PageWrapper><Register /></PageWrapper> : <Navigate to="/dashboard" />}
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              authUser ? (
                authUser.role === 'student' ? (
                  <StudentDashboard /> // Dashboards can have their own internal animations
                ) : (
                  <InstructorDashboard />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </AnimatePresence>

      <Toaster />
      <ThemeSwitcher />
    </div>
  );
}

// A simple wrapper component to apply the animation to each page
const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageTransition}
  >
    {children}
  </motion.div>
);

export default App;