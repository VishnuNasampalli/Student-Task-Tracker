import React from 'react';
import {
    LayoutDashboard,
    ListTodo,
    CheckCircle,
    Hourglass,
    Users,
    Briefcase,
    GraduationCap,
    X
} from 'lucide-react';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const defaultStats = {
    personal: { total: 0, completed: 0, pending: 0 },
    instructor: { total: 0, completed: 0, pending: 0 },
    totalTasksAssigned: 0,
    totalStudents: 0,
    totalCompleted: 0,
    totalPending: 0,
};

const Sidebar = ({ isOpen, onClose, userRole, stats = defaultStats }) => {

    const studentStats = (
        <>
            <h3 className="text-lg font-semibold mb-2 text-primary">Personal Tasks</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><ListTodo className="h-4 w-4" />Total</span>
                    <span>{stats?.personal?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-green-500"><CheckCircle className="h-4 w-4" />Completed</span>
                    <span className="text-green-500">{stats?.personal?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-orange-500"><Hourglass className="h-4 w-4" />Pending</span>
                    <span className="text-orange-500">{stats?.personal?.pending || 0}</span>
                </div>
            </div>
            <hr className="my-4" />
            <h3 className="text-lg font-semibold mb-2 text-primary">Instructor Tasks</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><ListTodo className="h-4 w-4" />Total</span>
                    <span>{stats?.instructor?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-green-500"><CheckCircle className="h-4 w-4" />Completed</span>
                    <span className="text-green-500">{stats?.instructor?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-orange-500"><Hourglass className="h-4 w-4" />Pending</span>
                    <span className="text-orange-500">{stats?.instructor?.pending || 0}</span>
                </div>
            </div>
        </>
    );

    const instructorStats = (
        <>
            <h3 className="text-lg font-semibold mb-2 text-primary">Overall Stats</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" />Tasks Assigned</span>
                    <span>{stats?.totalTasksAssigned || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Total Students</span>
                    <span>{stats?.totalStudents || 0}</span>
                </div>
            </div>
            <hr className="my-4" />
            <h3 className="text-lg font-semibold mb-2 text-primary">Task Progress</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-green-500"><CheckCircle className="h-4 w-4" />Total Completed</span>
                    <span className="text-green-500">{stats?.totalCompleted || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-orange-500"><Hourglass className="h-4 w-4" />Total Pending</span>
                    <span className="text-orange-500">{stats?.totalPending || 0}</span>
                </div>
            </div>
        </>
    );

    const content = (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <LayoutDashboard />
                    Stats
                </h2>
                {/* Close button for all screen sizes */}
                <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
            </div>
            <div className="p-6 flex-grow">
                {userRole === 'student' ? studentStats : instructorStats}
            </div>
            <div className="p-6 border-t text-xs text-muted-foreground">
                Task Management System
            </div>
        </div>
    );

    return (
        // **THE FIX IS HERE**: The sidebar is now a single element that is hidden or shown
        // based on the `isOpen` prop. The `translate-x` classes create the slide-in/out animation.
        <aside
            className={cn(
                "fixed top-0 left-0 h-full w-72 bg-card text-card-foreground border-r z-50 transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            {content}
        </aside>
    );
};

export default Sidebar;