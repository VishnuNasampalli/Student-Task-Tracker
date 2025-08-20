import React, { useState, useEffect } from 'react'; // Added useEffect for potential future use
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Receive userRole as a prop
const CreateTask = ({ onCreateTask, onClose, userRole }) => {
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'low',
        // assignedToStudentId: '', // Removed this from state as instructors assign to all
    });

    const handleNewTaskChange = (e) => {
        const { name, value } = e.target;
        setNewTask((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewTaskDateChange = (date) => {
        setNewTask((prev) => ({ ...prev, dueDate: date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.description || !newTask.dueDate) {
            toast.error("Please fill in all required fields for the new task.");
            return;
        }

        // For instructors, assignedToStudentId is not needed as backend assigns to all
        // For students, assignedTo will be handled by backend (defaults to creator)
        const taskDataToSend = {
            title: newTask.title,
            description: newTask.description,
            dueDate: newTask.dueDate,
            priority: newTask.priority,
            // No assignedToStudentId needed here for instructors, as backend handles "all students"
            // No assignedToStudentId needed here for students, as backend handles "personal"
        };

        await onCreateTask(taskDataToSend);
        // Reset form after submission
        setNewTask({
            title: '',
            description: '',
            dueDate: new Date(),
            priority: 'low',
        });
        // onClose is called by Dashboard.jsx after createTask is successful
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Title Field */}
            <div className="grid gap-2">
                <Label htmlFor="new-task-title">Title</Label>
                <Input
                    id="new-task-title"
                    name="title"
                    value={newTask.title}
                    onChange={handleNewTaskChange}
                    placeholder={userRole === 'instructor' ? "e.g., Complete Chapter 5 Reading" : "e.g., Finish Math Homework"}
                    required
                />
            </div>

            {/* Description Field */}
            <div className="grid gap-2">
                <Label htmlFor="new-task-description">Description</Label>
                <Input
                    as="textarea"
                    id="new-task-description"
                    name="description"
                    value={newTask.description}
                    onChange={handleNewTaskChange}
                    rows="3"
                    placeholder={userRole === 'instructor' ? "Detailed explanation for all students..." : "Detailed description of your task..."}
                    required
                />
            </div>

            {/* Due Date Field */}
            <div className="grid gap-2">
                <Label htmlFor="new-task-dueDate">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !newTask.dueDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTask.dueDate ? format(newTask.dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={newTask.dueDate}
                            onSelect={handleNewTaskDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Priority Field */}
            <div className="grid gap-2">
                <Label htmlFor="new-task-priority">Priority</Label>
                <Select
                    value={newTask.priority}
                    onValueChange={(value) => handleNewTaskChange({ target: { name: 'priority', value } })}
                >
                    <SelectTrigger id="new-task-priority">
                        <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-4">
                {userRole === 'instructor' ? "Assign Task to All" : "Add Task"}
            </Button>
        </form>
    );
};

export default CreateTask;
