import React, { useEffect, useState, useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader,
    Menu,
    Calendar as CalendarIcon,
    PlusCircle,
    LogOut,
    Edit,
    Trash2,
    Check,
    ListChecks,
    Clock,
    User,
    Award,
    FilePlus2,
    ShieldCheck,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import CreateTask from '../components/CreateTask.jsx';
import Sidebar from '../components/Sidebar.jsx';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
};

const StudentDashboard = () => {
    const { tasks, loading, fetchTasks, deleteTask, updateTask, createTask } = useTaskStore();
    const { authUser, logout } = useAuthStore();

    const [editingTask, setEditingTask] = useState(null);
    const [updatedTaskData, setUpdatedTaskData] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        if (authUser) fetchTasks();
    }, [fetchTasks, authUser]);

    const sidebarStats = useMemo(() => {
        if (!authUser) return {};
        const personal = tasks.filter(t => t.createdBy?._id === authUser.id);
        const instructor = tasks.filter(t => t.createdBy?._id !== authUser.id);
        return {
            personal: { total: personal.length, completed: personal.filter(t => t.status === 'completed').length, pending: personal.filter(t => t.status === 'pending').length },
            instructor: { total: instructor.length, completed: instructor.filter(t => t.status === 'completed').length, pending: instructor.filter(t => t.status === 'pending').length },
        };
    }, [tasks, authUser]);

    const { personalTasks, instructorTasks } = useMemo(() => {
        let filtered = tasks;
        if (searchTerm) filtered = filtered.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterStatus !== 'all') filtered = filtered.filter(task => task.status === filterStatus);
        if (filterPriority !== 'all') filtered = filtered.filter(task => task.priority === filterPriority);
        const personal = filtered.filter(task => task.createdBy?._id === authUser?.id);
        const instructor = filtered.filter(task => task.createdBy?._id !== authUser?.id);
        return { personalTasks: personal, instructorTasks: instructor };
    }, [tasks, authUser, searchTerm, filterStatus, filterPriority]);

    const handleEditClick = (task) => {
        setEditingTask(task);
        setUpdatedTaskData({
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate),
            priority: task.priority,
            status: task.status,
        });
    };

    const handleUpdateTask = async () => {
        if (!editingTask) return;
        try {
            await updateTask(editingTask._id, updatedTaskData);
            setEditingTask(null);
            toast.success("Task updated!");
        } catch (error) {
            toast.error("Failed to update task.");
        }
    };

    const handleDeleteTask = (taskId) => {
        deleteTask(taskId);
    };

    const handleCreateTask = async (taskData) => {
        await createTask(taskData);
        setShowCreateModal(false);
    };

    const PriorityBadge = ({ priority }) => {
        const styles = {
            high: 'border-red-500 bg-red-100 text-red-600',
            medium: 'border-yellow-500 bg-yellow-100 text-yellow-600',
            low: 'border-green-500 bg-green-100 text-green-600',
        };
        return <Badge variant="outline" className={cn('font-semibold capitalize', styles[priority])}>{priority}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/95 text-foreground flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={authUser?.role} stats={sidebarStats} />
            <main className={cn("flex-1 flex flex-col p-4 md:p-8 overflow-y-auto transition-all duration-300", isSidebarOpen ? "md:ml-72" : "md:ml-0")}>
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4"><Menu /></Button>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-3xl font-bold">Welcome, <span className="text-primary">{authUser?.name}</span></h1>
                        </motion.div>
                    </div>
                    <Button variant="destructive" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
                </header>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="mb-8 shadow-sm"><CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div><Label htmlFor="search" className="font-semibold">Search</Label><Input id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Task title..." /></div>
                        <div><Label htmlFor="filter-status" className="font-semibold">Status</Label><Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger id="filter-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
                        <div><Label htmlFor="filter-priority" className="font-semibold">Priority</Label><Select value={filterPriority} onValueChange={setFilterPriority}><SelectTrigger id="filter-priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                    </CardContent></Card>
                </motion.div>

                {loading ? <div className="flex-1 flex items-center justify-center"><Loader className="h-10 w-10 animate-spin text-primary" /></div> : (
                    <div className="space-y-10">
                        <motion.section variants={containerVariants} initial="hidden" animate="visible">
                            <motion.h2 variants={itemVariants} className="text-2xl font-bold flex items-center gap-3 mb-4"><Award className="text-amber-500" />Assigned Tasks</motion.h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {instructorTasks.length > 0 ? instructorTasks.map(task => (
                                        <motion.div key={task._id} variants={itemVariants} layout exit="exit">
                                            <Card className="h-full shadow-sm hover:shadow-lg transition-shadow"><CardHeader><div className="flex justify-between items-start gap-2"><CardTitle className="text-lg">{task.title}</CardTitle><Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className={cn('capitalize', task.status === 'completed' && 'bg-green-600')}>{task.status}</Badge></div><CardDescription>From: {task.createdBy?.name}</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted-foreground min-h-[40px]">{task.description}</p><div className="flex items-center justify-between text-muted-foreground border-t pt-3"><div className="flex items-center gap-2 font-medium"><Clock className="h-4 w-4" />{format(new Date(task.dueDate), "do MMMM")}</div><PriorityBadge priority={task.priority} /></div></CardContent></Card>
                                        </motion.div>
                                    )) : <motion.div key="empty-instructor" variants={itemVariants} className="md:col-span-2 lg:col-span-3 text-center py-10 bg-card border rounded-lg"><ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-2" /><p className="font-semibold">No assignments from your instructor!</p></motion.div>}
                                </AnimatePresence>
                            </div>
                        </motion.section>

                        {/* This is the corrected section around line 227 */}
                        <motion.section variants={containerVariants} initial="hidden" animate="visible">
                            <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3"><User className="text-blue-500" />Personal Tasks</h2>
                                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}><DialogTrigger asChild><Button><FilePlus2 className="mr-2 h-4 w-4" /> Add Task</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create Personal Task</DialogTitle></DialogHeader><CreateTask onCreateTask={handleCreateTask} onClose={() => setShowCreateModal(false)} /></DialogContent></Dialog>
                            </motion.div>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {personalTasks.length > 0 ? personalTasks.map(task => (
                                        <motion.div key={task._id} variants={itemVariants} layout exit="exit" whileHover={{ y: -3 }}>
                                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-2 h-10 rounded-full", task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600')}></div>
                                                        <div><p className="font-semibold">{task.title}</p><p className="text-sm text-muted-foreground">{task.description}</p></div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <PriorityBadge priority={task.priority} /><span className="text-sm text-muted-foreground font-medium w-24 text-right">{format(new Date(task.dueDate), "do MMMM")}</span>
                                                        <Button onClick={() => handleEditClick(task)} size="icon" variant="ghost"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                                                        <Button onClick={() => handleDeleteTask(task._id)} size="icon" variant="ghost" className="text-red-500/90"><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )) : <motion.div key="empty-personal" variants={itemVariants} className="text-center py-10 bg-card border rounded-lg"><ListChecks className="mx-auto h-12 w-12 text-blue-500 mb-2" /><p className="font-semibold">Your to-do list is empty. Add a task!</p></motion.div>}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    </div>
                )}
            </main>

            <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Personal Task</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" value={updatedTaskData.title || ''} onChange={(e) => setUpdatedTaskData({ ...updatedTaskData, title: e.target.value })} /></div>
                        <div className="grid gap-2"><Label htmlFor="edit-desc">Description</Label><Input id="edit-desc" value={updatedTaskData.description || ''} onChange={(e) => setUpdatedTaskData({ ...updatedTaskData, description: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Due Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="font-normal justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{updatedTaskData.dueDate ? format(new Date(updatedTaskData.dueDate), "PPP") : "Pick a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={updatedTaskData.dueDate ? new Date(updatedTaskData.dueDate) : null} onSelect={(date) => date && setUpdatedTaskData({ ...updatedTaskData, dueDate: date })} initialFocus /></PopoverContent></Popover></div>
                        <div className="grid gap-2"><Label htmlFor="edit-priority">Priority</Label><Select value={updatedTaskData.priority} onValueChange={(value) => setUpdatedTaskData({ ...updatedTaskData, priority: value })}><SelectTrigger id="edit-priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                        <div className="grid gap-2"><Label htmlFor="edit-status">Status</Label><Select value={updatedTaskData.status} onValueChange={(value) => setUpdatedTaskData({ ...updatedTaskData, status: value })}><SelectTrigger id="edit-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button><Button onClick={handleUpdateTask}>Save Changes</Button></div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentDashboard;