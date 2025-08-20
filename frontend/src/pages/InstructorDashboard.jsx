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
    GraduationCap,
    Users,
    ChevronDown,
    CheckCircle,
    Hourglass,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
// **THE FIX IS HERE**: Added the missing Select components to the import list.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import CreateTask from '../components/CreateTask.jsx';
import Sidebar from '../components/Sidebar.jsx';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
};

const InstructorDashboard = () => {
    const { tasks, loading, fetchTasks, deleteTask, updateTask, createTask } = useTaskStore();
    const { authUser, logout } = useAuthStore();

    const [editingTask, setEditingTask] = useState(null);
    const [updatedTaskData, setUpdatedTaskData] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (authUser) fetchTasks();
    }, [fetchTasks, authUser]);

    const groupedTasks = useMemo(() => {
        const taskGroups = new Map();
        const instructorTasks = tasks.filter(task => task.createdBy?._id === authUser?.id);

        instructorTasks.forEach(task => {
            const groupKey = `${task.title}::${task.description}`;
            if (!taskGroups.has(groupKey)) {
                taskGroups.set(groupKey, {
                    groupKey, title: task.title, description: task.description, dueDate: task.dueDate, priority: task.priority, instances: []
                });
            }
            if (task.assignedTo) {
                taskGroups.get(groupKey).instances.push({
                    taskId: task._id, studentName: task.assignedTo.name, studentId: task.assignedTo._id, status: task.status
                });
            }
        });

        let finalTasks = Array.from(taskGroups.values()).map(group => {
            const completedCount = group.instances.filter(i => i.status === 'completed').length;
            const totalCount = group.instances.length;
            return {
                ...group,
                completedCount,
                totalCount,
                progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
            };
        });

        if (searchTerm) {
            finalTasks = finalTasks.filter(group =>
                group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.instances.some(instance => instance.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return finalTasks;
    }, [tasks, searchTerm, authUser?.id]);

    const sidebarStats = useMemo(() => {
        if (!authUser || !tasks.length) return {};
        const instructorTasks = tasks.filter(task => task.createdBy?._id === authUser.id);
        const studentSet = new Set(instructorTasks.map(t => t.assignedTo?._id));
        return {
            totalTasksAssigned: groupedTasks.length,
            totalStudents: studentSet.size,
            totalCompleted: instructorTasks.filter(t => t.status === 'completed').length,
            totalPending: instructorTasks.filter(t => t.status === 'pending').length,
        };
    }, [tasks, authUser, groupedTasks]);

    const handleEditClick = (group) => {
        setEditingTask(group);
        setUpdatedTaskData({ title: group.title, description: group.description, dueDate: new Date(group.dueDate), priority: group.priority });
    };

    const handleUpdateGroupTask = async () => {
        if (!editingTask) return;
        const updatePromises = editingTask.instances.map(instance => updateTask(instance.taskId, updatedTaskData));
        await Promise.all(updatePromises);
        setEditingTask(null);
        toast.success("Task group updated!");
    };

    const handleUpdateStudentStatus = async (taskId, newStatus) => {
        await updateTask(taskId, { status: newStatus });
        toast.success(`Status updated for student.`);
    };

    const handleDeleteGroup = async (group) => {
        toast((t) => (
            <div className="text-center">
                <p className="font-semibold">Delete '{group.title}'?</p>
                <p className="text-sm text-muted-foreground">This will delete the task for all {group.totalCount} students.</p>
                <div className="flex gap-2 mt-3 justify-center">
                    <Button variant="destructive" size="sm" onClick={async () => {
                        const deletePromises = group.instances.map(instance => deleteTask(instance.taskId));
                        await Promise.all(deletePromises);
                        toast.dismiss(t.id);
                        toast.success("Task group deleted.");
                    }}>Yes, Delete</Button>
                    <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const handleCreateTask = async (taskData) => {
        await createTask(taskData);
        setShowCreateModal(false);
    };

    const PriorityBadge = ({ priority }) => {
        const styles = { high: 'bg-red-500/10 text-red-500', medium: 'bg-yellow-500/10 text-yellow-500', low: 'bg-green-500/10 text-green-500' };
        return <Badge variant="outline" className={cn('capitalize font-semibold', styles[priority])}>{priority}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-foreground flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={authUser?.role} stats={sidebarStats} />
            <main className={cn("flex-1 flex flex-col p-4 md:p-8 overflow-y-auto transition-all duration-300", isSidebarOpen ? "md:ml-72" : "md:ml-0")}>
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4"><Menu /></Button>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-3xl font-bold">Hello, <span className="text-primary">{authUser?.name}</span></h1>
                            <p className="text-muted-foreground">Manage your assignments and track student progress.</p>
                        </motion.div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}><DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Assign Task</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Assign New Task to All Students</DialogTitle></DialogHeader><CreateTask onCreateTask={handleCreateTask} onClose={() => setShowCreateModal(false)} /></DialogContent></Dialog>
                        <Button variant="destructive" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
                    </div>
                </header>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="mb-8"><CardContent className="p-4"><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks by title or student name..." /></CardContent></Card>
                </motion.div>

                {loading ? <div className="flex-1 flex items-center justify-center"><Loader className="h-10 w-10 animate-spin text-primary" /></div> : (
                    <motion.section variants={containerVariants} initial="hidden" animate="visible">
                        <AnimatePresence>
                            {groupedTasks.length > 0 ? (
                                <Accordion type="single" collapsible className="space-y-4">
                                    {groupedTasks.map(group => (
                                        <motion.div key={group.groupKey} variants={itemVariants} layout exit="exit">
                                            <AccordionItem value={group.groupKey} className="border bg-card rounded-lg shadow-sm">
                                                <AccordionTrigger className="p-4 hover:no-underline">
                                                    <div className="w-full flex flex-col items-start text-left">
                                                        <div className="w-full flex justify-between items-center">
                                                            <h3 className="text-lg font-semibold text-primary">{group.title}</h3>
                                                            <div className="flex items-center gap-4">
                                                                <PriorityBadge priority={group.priority} />
                                                                <div className="text-sm font-medium text-muted-foreground">{format(new Date(group.dueDate), "do MMMM yyyy")}</div>
                                                            </div>
                                                        </div>
                                                        <div className="w-full mt-3">
                                                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                                                <span className="font-medium">Progress</span>
                                                                <span>{group.completedCount} of {group.totalCount} completed</span>
                                                            </div>
                                                            <Progress value={group.progress} />
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 border-t">
                                                    <div className="flex justify-end gap-2 mb-4">
                                                        <Button onClick={() => handleEditClick(group)} size="sm" variant="outline"><Edit className="h-4 w-4 mr-2" />Edit Details</Button>
                                                        <Button onClick={() => handleDeleteGroup(group)} size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Delete for All</Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {group.instances.map(instance => (
                                                            <div key={instance.studentId} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                                                <p className="flex items-center gap-2 font-medium"><GraduationCap className="h-4 w-4 text-muted-foreground" />{instance.studentName}</p>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge variant={instance.status === 'completed' ? 'default' : 'secondary'} className={cn('capitalize', instance.status === 'completed' && 'bg-green-600')}>{instance.status}</Badge>
                                                                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStudentStatus(instance.taskId, instance.status === 'pending' ? 'completed' : 'pending')}>Toggle</Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </motion.div>
                                    ))}
                                </Accordion>
                            ) : (<motion.div key="empty" variants={itemVariants} className="text-center py-16 bg-card rounded-lg"><Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" /><h3 className="text-xl font-semibold">No Tasks Found</h3><p className="text-muted-foreground">Assign a new task to get started.</p></motion.div>)}
                        </AnimatePresence>
                    </motion.section>
                )}

                <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                    <DialogContent><DialogHeader><DialogTitle>Edit Task Group Details</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label>Title</Label><Input value={updatedTaskData.title || ''} onChange={(e) => setUpdatedTaskData({ ...updatedTaskData, title: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Description</Label><Input value={updatedTaskData.description || ''} onChange={(e) => setUpdatedTaskData({ ...updatedTaskData, description: e.g.target.value })} /></div>
                            <div className="grid gap-2"><Label>Due Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="font-normal justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{updatedTaskData.dueDate ? format(new Date(updatedTaskData.dueDate), "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={updatedTaskData.dueDate ? new Date(updatedTaskData.dueDate) : null} onSelect={(date) => date && setUpdatedTaskData({ ...updatedTaskData, dueDate: date })} initialFocus /></PopoverContent></Popover></div>
                            <div className="grid gap-2"><Label>Priority</Label>
                                <Select value={updatedTaskData.priority} onValueChange={(value) => setUpdatedTaskData({ ...updatedTaskData, priority: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button><Button onClick={handleUpdateGroupTask}>Save for All Students</Button></div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default InstructorDashboard;