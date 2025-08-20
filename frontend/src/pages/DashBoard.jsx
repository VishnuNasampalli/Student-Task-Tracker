import React, { useEffect, useState, useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { Toaster, toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker'; // Keep this for now, but its styling is overridden
import 'react-datepicker/dist/react-datepicker.css'; // Keep this for base styles
import CreateTask from '../components/CreateTask.jsx';
import Sidebar from '../components/Sidebar.jsx'; // Your existing Sidebar component
import { useAuthStore } from '../store/useAuthStore.js';
import {
    Loader,
    Menu,
    Calendar as CalendarIcon,
    PlusCircle,
    LogOut,
    Search,
    Filter,
    ListTodo,
    CheckCircle,
    Hourglass,
    Clock,
    Briefcase, // For instructor icon
    GraduationCap, // For student icon
    UserCheck, // For assigned student status
    UserX, // For assigned student status
} from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar for styling DatePicker
import { Separator } from '@/components/ui/separator'; // For visual breaks
import { Badge } from '@/components/ui/badge'; // For status/priority display
import { cn } from '@/lib/utils'; // Utility for conditional class names
import { format } from 'date-fns'; // For date formatting in Popover trigger
import { ScrollArea } from '@/components/ui/scroll-area'; // For scrollable student list in instructor view

const DashBoard = () => {
    const { tasks, loading, fetchTasks, deleteTask, updateTask, createTask } = useTaskStore();
    const { authUser, logout } = useAuthStore();

    const [editingTask, setEditingTask] = useState(null);
    const [updatedTaskData, setUpdatedTaskData] = useState({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'low',
        status: 'pending',
    });

    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterDueDate, setFilterDueDate] = useState(null);

    useEffect(() => {
        if (authUser) {
            fetchTasks();
        }
    }, [fetchTasks, authUser]);

    // Memoized function to filter tasks (for students) or group tasks (for instructors)
    const processedTasks = useMemo(() => {
        let currentTasks = tasks;

        // Apply search filter first
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentTasks = currentTasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                    task.description.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            currentTasks = currentTasks.filter((task) => task.status === filterStatus);
        }

        // Apply priority filter
        if (filterPriority !== 'all') {
            currentTasks = currentTasks.filter((task) => task.priority === filterPriority);
        }

        // Apply due date filter
        if (filterDueDate) {
            const selectedDateString = filterDueDate.toDateString();
            currentTasks = currentTasks.filter(
                (task) => new Date(task.dueDate).toDateString() === selectedDateString
            );
        }

        // If instructor, group tasks by title/description
        if (authUser?.role === 'instructor') {
            const grouped = {};
            currentTasks.forEach(task => {
                // Use a composite key for grouping unique tasks created by this instructor
                const key = `${task.title}::${task.description}::${task.createdBy._id}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        _id: task._id, // Keep one ID for potential reference, though not for update/delete all
                        title: task.title,
                        description: task.description,
                        dueDate: task.dueDate,
                        priority: task.priority,
                        createdBy: task.createdBy,
                        assignedStudents: [], // Array to hold students and their statuses for this task
                    };
                }
                grouped[key].assignedStudents.push({
                    studentId: task.assignedTo._id,
                    studentName: task.assignedTo.name,
                    status: task.status,
                    taskId: task._id, // Store the individual task ID for status updates
                });
            });
            return Object.values(grouped);
        }

        // For students, just return the filtered tasks
        return currentTasks;
    }, [tasks, searchTerm, filterStatus, filterPriority, filterDueDate, authUser?.role]);

    // Statistics for the dashboard summary cards (based on all tasks, not filtered/grouped)
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const upcomingDeadlines = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return task.status === 'pending' && dueDate >= today && dueDate <= sevenDaysFromNow;
    }).length;


    const handleEditClick = (task) => {
        setEditingTask(task._id);
        setUpdatedTaskData({
            title: '', // Clear title/description/priority/dueDate when editing a grouped task
            description: '',
            dueDate: new Date(),
            priority: 'low',
            status: task.status, // Keep status as it's the only editable field for students
        });
        // For instructor grouped task, we don't allow editing title/desc/due/priority directly here.
        // If editing a student's personal task, then populate.
        if (authUser?.role === 'student' || (authUser?.role === 'instructor' && task.createdBy._id === authUser.id && task.assignedTo._id === authUser.id)) {
            setUpdatedTaskData({
                title: task.title,
                description: task.description,
                dueDate: new Date(task.dueDate),
                priority: task.priority,
                status: task.status,
            });
        }
    };

    // New: Handle update for instructor's grouped task (only status of assigned student)
    const handleUpdateAssignedStudentStatus = async (taskId, newStatus) => {
        await updateTask(taskId, { status: newStatus });
        toast.success("Student task status updated!");
    };

    const handleUpdateTaskChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTaskData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateTaskDateChange = (date) => {
        setUpdatedTaskData((prev) => ({ ...prev, dueDate: date }));
    };

    const handleUpdateTask = async (taskId) => {
        // For student updating status, only status is needed
        if (canStudentUpdateStatus({ _id: taskId, assignedTo: { _id: authUser.id }, createdBy: { _id: 'dummy' } }) && !canEditTask({ _id: taskId, createdBy: { _id: authUser.id }, assignedTo: { _id: authUser.id } })) {
            await updateTask(taskId, { status: updatedTaskData.status });
            toast.success("Task status updated successfully!");
        } else if (!updatedTaskData.title || !updatedTaskData.description || !updatedTaskData.dueDate) {
            toast.error("Please fill in all required fields for the task update.");
            return;
        } else {
            await updateTask(taskId, updatedTaskData);
            toast.success("Task updated successfully!");
        }
        setEditingTask(null);
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
    };

    const handleDeleteTask = async (taskId) => {
        await deleteTask(taskId);
    };

    const handleCreateTaskInDashboard = async (taskData) => {
        await createTask(taskData);
        setShowCreateTaskModal(false);
    };

    const handleLogout = async () => {
        await logout();
    };

    // Determine if the current user can edit/delete a specific task (for student view)
    const canEditTask = (task) => {
        if (!authUser) return false;
        // Instructor can edit tasks they created (individual instance)
        if (authUser.role === 'instructor' && task.createdBy._id === authUser.id) {
            return true;
        }
        // Student can edit tasks they created (personal tasks)
        if (authUser.role === 'student' && task.createdBy._id === authUser.id && task.assignedTo._id === authUser.id) {
            return true;
        }
        return false;
    };

    const canDeleteTask = (task) => {
        if (!authUser) return false;
        // Only the creator can delete the task
        return task.createdBy._id === authUser.id;
    };

    // Students can only update status of assigned tasks (if not creator)
    const canStudentUpdateStatus = (task) => {
        if (!authUser || authUser.role !== 'student') return false;
        // If assignedTo is current student AND createdBy is NOT current student (assigned by instructor)
        return task.assignedTo._id === authUser.id && task.createdBy._id !== authUser.id;
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar Component (Desktop fixed, Mobile Sheet) */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} authUser={authUser} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
                {/* Header Section */}
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-border sticky top-0 bg-background z-10">
                    <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                        {/* Mobile Sidebar Toggle Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden mr-4"
                            aria-label="Open Sidebar"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary flex-1">Task Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto justify-end">
                        {/* User Info */}
                        {authUser && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                {authUser.role === 'instructor' ? (
                                    <Briefcase className="h-4 w-4 mr-1 text-primary" />
                                ) : (
                                    <GraduationCap className="h-4 w-4 mr-1 text-primary" />
                                )}
                                <span>{authUser.name} ({authUser.role})</span>
                            </div>
                        )}

                        {/* Add New Task Button with Dialog Trigger - Only for Instructors */}
                        {authUser?.role === 'instructor' && (
                            <Dialog open={showCreateTaskModal} onOpenChange={setShowCreateTaskModal}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Assign New Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Assign New Task to All Students</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details for the task to be assigned to all students.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CreateTask
                                        onCreateTask={handleCreateTaskInDashboard}
                                        onClose={() => setShowCreateTaskModal(false)}
                                        userRole={authUser.role}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Add New Task Button for Students (Personal Task) */}
                        {authUser?.role === 'student' && (
                            <Dialog open={showCreateTaskModal} onOpenChange={setShowCreateTaskModal}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Personal Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Personal Task</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details for your personal task.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CreateTask
                                        onCreateTask={handleCreateTaskInDashboard}
                                        onClose={() => setShowCreateTaskModal(false)}
                                        userRole={authUser.role}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Logout Button */}
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                </header>

                {/* Statistics Overview Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Your Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">{totalTasks}</CardTitle>
                                <CardDescription>Total Tasks</CardDescription>
                            </div>
                            <ListTodo className="h-8 w-8 text-primary" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-green-500">{completedTasks}</CardTitle>
                                <CardDescription>Completed</CardDescription>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-orange-500">{pendingTasks}</CardTitle>
                                <CardDescription>Pending</CardDescription>
                            </div>
                            <Hourglass className="h-8 w-8 text-orange-500" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-destructive">{upcomingDeadlines}</CardTitle>
                                <CardDescription>Upcoming (7 days)</CardDescription>
                            </div>
                            <Clock className="h-8 w-8 text-destructive" />
                        </Card>
                    </div>
                </section>

                {/* Search and Filter Section */}
                <section className="mb-8">
                    <Card className="p-6">
                        <CardHeader className="p-0 pb-4">
                            <CardTitle className="text-2xl">Filter & Search Tasks</CardTitle>
                            <CardDescription>Refine your task list by searching or applying filters.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by title or description..."
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Filter by Status */}
                                <div className="grid gap-2">
                                    <Label htmlFor="filter-status">Status</Label>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger id="filter-status">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filter by Priority */}
                                <div className="grid gap-2">
                                    <Label htmlFor="filter-priority">Priority</Label>
                                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                                        <SelectTrigger id="filter-priority">
                                            <SelectValue placeholder="All Priorities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priorities</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filter by Due Date (Shadcn Popover + DatePicker) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="filter-dueDate">Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !filterDueDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filterDueDate ? format(filterDueDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={filterDueDate}
                                                onSelect={setFilterDueDate}
                                                initialFocus
                                            />
                                            {filterDueDate && (
                                                <div className="p-2 border-t flex justify-end">
                                                    <Button variant="ghost" onClick={() => setFilterDueDate(null)} className="h-8 px-2">
                                                        Clear Date
                                                    </Button>
                                                </div>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Task List Section */}
                <section>
                    <Card className="p-6">
                        <CardHeader className="p-0 pb-4">
                            <CardTitle className="text-2xl">Your Tasks</CardTitle>
                            <CardDescription>Manage your pending and completed tasks efficiently.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader className="size-8 animate-spin text-primary" />
                                    <p className="ml-2 text-muted-foreground">Loading tasks...</p>
                                </div>
                            ) : processedTasks.length === 0 ? (
                                <p className="text-center text-muted-foreground p-8">
                                    No tasks found matching your criteria. 😔
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {processedTasks.map((task) => (
                                        <Card
                                            key={task._id} // For instructor, this is the ID of one instance, or a generated key
                                            className="p-4 flex flex-col space-y-3"
                                        >
                                            {/* Task Details */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                                                <p className="text-muted-foreground text-sm">{task.description}</p>
                                                {/* FIX: Changed parent <p> to <div> to avoid hydration error */}
                                                <div className="text-muted-foreground text-xs mt-1 space-x-2 flex flex-wrap items-center gap-y-1">
                                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                    <span className="mx-1">|</span> {/* Added mx-1 for spacing */}
                                                    <span>Priority:{" "}
                                                        <Badge
                                                            variant={
                                                                task.priority === 'high' ? 'destructive' :
                                                                    task.priority === 'medium' ? 'secondary' :
                                                                        'outline'
                                                            }
                                                            className={cn(
                                                                task.priority === 'high' && 'bg-destructive/10 text-destructive',
                                                                task.priority === 'medium' && 'bg-orange-500/10 text-orange-500',
                                                                task.priority === 'low' && 'bg-green-500/10 text-green-500'
                                                            )}
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                    </span>
                                                    {/* Display createdBy info for all users */}
                                                    <span className="block mt-1 text-xs text-muted-foreground">
                                                        {task.createdBy && task.assignedTo && task.createdBy._id === task.assignedTo._id && (
                                                            <span className="italic">Personal task</span>
                                                        )}
                                                        {task.createdBy && task.assignedTo && task.createdBy._id !== task.assignedTo._id && (
                                                            <span className="italic ml-2">Assigned by: {task.createdBy.name}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Instructor View: Assigned Students and their Statuses */}
                                            {authUser?.role === 'instructor' && task.assignedStudents && (
                                                <div className="mt-4 pt-3 border-t border-border">
                                                    <h4 className="text-sm font-semibold text-foreground mb-2">Assigned Students:</h4>
                                                    <ScrollArea className="h-40 w-full rounded-md border p-4 bg-background/50">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {task.assignedStudents.map((student) => (
                                                                <div key={student.studentId} className="flex items-center justify-between text-sm">
                                                                    <span className="flex items-center">
                                                                        <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                                                                        {student.studentName}
                                                                    </span>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Badge
                                                                            variant={student.status === 'completed' ? 'default' : 'secondary'}
                                                                            className={cn(
                                                                                student.status === 'completed' && 'bg-green-600/10 text-green-600',
                                                                                student.status === 'pending' && 'bg-orange-600/10 text-orange-600'
                                                                            )}
                                                                        >
                                                                            {student.status}
                                                                        </Badge>
                                                                        {/* Instructor can update status for each student's task instance */}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleUpdateAssignedStudentStatus(
                                                                                student.taskId,
                                                                                student.status === 'completed' ? 'pending' : 'completed'
                                                                            )}
                                                                            className="h-6 w-6"
                                                                            title={`Toggle status for ${student.studentName}`}
                                                                        >
                                                                            {student.status === 'completed' ? (
                                                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                                            ) : (
                                                                                <UserX className="h-4 w-4 text-orange-600" />
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            )}

                                            {/* Student View: Status and Actions */}
                                            {authUser?.role === 'student' && (
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                                                    {/* FIX: Changed parent <p> to <div> to avoid hydration error */}
                                                    <div className="text-muted-foreground text-xs flex items-center gap-x-1">
                                                        Status:{" "}
                                                        <Badge
                                                            variant={task.status === 'completed' ? 'default' : 'secondary'}
                                                            className={cn(
                                                                task.status === 'completed' && 'bg-green-600/10 text-green-600',
                                                                task.status === 'pending' && 'bg-orange-600/10 text-orange-600'
                                                            )}
                                                        >
                                                            {task.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {/* Edit Button: Only if user can edit the task */}
                                                        {canEditTask(task) && (
                                                            <Button variant="outline" onClick={() => handleEditClick(task)} size="sm">
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {/* Update Status Button (for assigned students only, if not creator) */}
                                                        {canStudentUpdateStatus(task) && !canEditTask(task) && (
                                                            <Button variant="secondary" onClick={() => handleEditClick(task)} size="sm">
                                                                Update Status
                                                            </Button>
                                                        )}
                                                        {/* Delete Button: Only if user can delete the task */}
                                                        {canDeleteTask(task) && (
                                                            <Button variant="destructive" onClick={() => handleDeleteTask(task._id)} size="sm">
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    );
};

export default DashBoard;
