import { Link } from 'react-router-dom';
// Import motion from Framer Motion
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

import {
    ListTodo,
    CalendarDays,
    BellRing,
    BarChart2,
    Users,
    Sparkles,
    ArrowRight,
} from 'lucide-react';

// Animation variants for Framer Motion
// This defines what the animation will look like
const fadeInAnimation = {
    initial: {
        opacity: 0,
        y: 50, // Start 50px below its final position
    },
    animate: {
        opacity: 1,
        y: 0, // End at its final position
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

const Home = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* 🔝 Top Navbar */}
            <nav className="bg-card text-card-foreground shadow-md fixed top-0 left-0 right-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">
                        <Link to="/">Task Tracker</Link>
                    </h1>
                    <ul className="flex space-x-6 font-medium">
                        <li>
                            <Link to="/login" className="hover:text-primary transition-colors">
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" className="hover:text-primary transition-colors">
                                Register
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* ヒーローセクション (Hero Section) */}
            <section className="relative w-full py-24 md:py-32 lg:py-40 flex items-center justify-center text-center bg-gradient-to-br from-primary/10 to-background overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 14v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0 20v-4H4v4H0v2h4v4h2v-4h4v-2H6zM36 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 0v-4H4v4H0v2h4v4h2v-4h4v-2H6zM21 21v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM21 51v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM46 6v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM46 36v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z' fill='%239C92AC'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                {/* We wrap the content in a motion.div to animate it on page load */}
                <motion.div
                    className="relative z-10 max-w-4xl px-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
                        Your Ultimate Task Companion
                    </Badge>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-foreground mb-6">
                        Organize Your Academic Life with Ease
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Effortlessly manage assignments, projects, and deadlines. Stay on top of your studies and achieve your goals.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/login">
                            <Button size="lg" className="px-8 py-3 text-lg">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                                Sign Up Today
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="w-full max-w-6xl mx-auto py-16 px-4">
                {/* Animate the section header as it comes into view */}
                <motion.div
                    className="text-center mb-12"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={fadeInAnimation}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Powerful Features Designed for Students
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        From simple task tracking to smart reminders, we've got everything you need to succeed.
                    </p>
                    <Separator className="my-8 w-24 mx-auto bg-primary" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Animate each feature card individually with a slight delay */}
                    {[
                        { icon: <ListTodo className="h-8 w-8" />, title: "Intuitive Task Management", description: "Create, organize, and prioritize your academic tasks with a user-friendly interface." },
                        { icon: <CalendarDays className="h-8 w-8" />, title: "Smart Deadline Tracking", description: "Never miss a submission with clear due dates and upcoming deadline alerts." },
                        { icon: <BellRing className="h-8 w-8" />, title: "Customizable Reminders", description: "Set personal reminders for tasks, exams, or study sessions to stay focused." },
                        { icon: <BarChart2 className="h-8 w-8" />, title: "Progress Visualization", description: "Track your completion rates and visualize your productivity over time." },
                        { icon: <Users className="h-8 w-8" />, title: "Collaborative Features", description: "(Coming Soon) Work on group projects by sharing tasks and updates with teammates." },
                        { icon: <Sparkles className="h-8 w-8" />, title: "Clean & Responsive Design", description: "Enjoy a seamless experience on any device, from desktop to mobile." },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={{
                                ...fadeInAnimation,
                                animate: {
                                    ...fadeInAnimation.animate,
                                    transition: {
                                        ...fadeInAnimation.animate.transition,
                                        delay: index * 0.1, // Stagger the animation
                                    },
                                },
                            }}
                        >
                            <Card className="h-full flex flex-col items-center text-center p-6 hover:shadow-xl transition-shadow duration-300">
                                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    {feature.description}
                                </CardDescription>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Call to Action / FAQ Section */}
            <section className="w-full max-w-6xl mx-auto py-16 px-4">
                <motion.div
                    className="bg-card rounded-xl shadow-lg p-8 md:p-12"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInAnimation}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                Join thousands of students who are already boosting their productivity.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                                <Link to="/register">
                                    <Button size="lg">Create Your Account</Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" size="lg">Log In</Button>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-6 text-center md:text-left">
                                Frequently Asked Questions
                            </h3>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Is Task Tracker free to use?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Yes, Task Tracker offers a robust free tier with all essential features for students.
                                        Premium features may be introduced in the future.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Can I access it on my phone?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Absolutely! Our application is fully responsive and works seamlessly on all devices,
                                        including smartphones and tablets.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>How do I get support?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        You can reach our support team via email at support@tasktracker.com or
                                        through our contact form after logging in.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-muted-foreground text-sm border-t border-border mt-auto">
                <p>&copy; 2025 Task Tracker. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;