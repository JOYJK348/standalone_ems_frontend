"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Bell,
    BookOpen,
    FileText,
    MessageSquare,
    CheckCircle2,
    Clock,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            type: "assignment",
            title: "New Assignment Posted",
            message: "React Component Assignment has been posted for Web Development course",
            time: "2 hours ago",
            read: false,
            link: "/ems/student/assignments",
        },
        {
            id: 2,
            type: "course",
            title: "New Course Module Available",
            message: "Module 4: Advanced React Concepts is now available",
            time: "5 hours ago",
            read: false,
            link: "/ems/student/courses",
        },
        {
            id: 3,
            type: "doubt",
            title: "Doubt Session Scheduled",
            message: "Your doubt session on React Hooks has been scheduled for Dec 20, 4:00 PM",
            time: "1 day ago",
            read: true,
            link: "/ems/student/doubts",
        },
        {
            id: 4,
            type: "assessment",
            title: "Assessment Graded",
            message: "Your Module 2 Assessment has been graded. Score: 92%",
            time: "2 days ago",
            read: true,
            link: "/ems/student/assessments",
        },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case "assignment": return FileText;
            case "course": return BookOpen;
            case "doubt": return MessageSquare;
            case "assessment": return CheckCircle2;
            default: return Bell;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "assignment": return "green";
            case "course": return "blue";
            case "doubt": return "purple";
            case "assessment": return "orange";
            default: return "gray";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Notifications</h1>
                            <p className="text-gray-600">Stay updated with your learning activities</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Mark All as Read
                        </Button>
                    </div>
                </motion.div>

                <div className="space-y-3">
                    {notifications.map((notification, index) => {
                        const Icon = getIcon(notification.type);
                        const color = getColor(notification.type);

                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={notification.link}>
                                    <Card className={`border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${!notification.read ? "bg-blue-50/50" : "bg-white"
                                        }`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`h-6 w-6 text-${color}-600`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3" />
                                                        {notification.time}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {notifications.length === 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                            <p className="text-gray-600">You're all caught up!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
