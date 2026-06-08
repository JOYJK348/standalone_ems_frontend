"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Video,
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    Timer,
    Eye,
    Edit,
    Trash2,
    UserCheck,
    Play
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface LiveClass {
    id: number;
    class_title: string;
    class_description: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: string;
    meeting_id: string;
    meeting_platform: string;
    courses: { course_name: string; course_code: string };
}

export default function TutorLiveClasses() {
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        fetchClasses();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ems/live-classes");
            if (res.data.success) setClasses(res.data.data || []);
        } catch (error) {
            console.error("Error fetching classes:", error);
            toast.error("Failed to load classes");
        } finally {
            setLoading(false);
        }
    };

    const startClass = (liveClass: LiveClass) => {
        if (liveClass.meeting_platform === 'JITSI') {
            router.push(`/ems/live-room/${liveClass.meeting_id}?role=tutor`);
        }
    };

    const getClassStatus = (liveClass: LiveClass) => {
        const classDate = new Date(`${liveClass.scheduled_date}T${liveClass.start_time}`);
        const endDate = new Date(`${liveClass.scheduled_date}T${liveClass.end_time}`);

        if (currentTime >= classDate && currentTime <= endDate) {
            return { label: "LIVE NOW", color: "bg-red-100 text-red-600", dot: true };
        } else if (currentTime < classDate) {
            return { label: "UPCOMING", color: "bg-blue-100 text-blue-600", dot: false };
        } else {
            return { label: "COMPLETED", color: "bg-gray-100 text-gray-600", dot: false };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                My Live Classes
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
                                <Timer className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-mono font-bold">
                                    {mounted ? format(currentTime, "HH:mm:ss") : "--:--:--"}
                                </span>
                            </div>
                            <Link href="/ems/tutor/live-classes/create">
                                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                                    <Video className="h-4 w-4 mr-2" />
                                    Schedule Class
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : classes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Video className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Classes Scheduled</h3>
                        <p className="text-gray-500 mb-6">Start by creating your first live class session</p>
                        <Link href="/ems/tutor/live-classes/create">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Schedule Class
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {classes.map((c, index) => {
                            const status = getClassStatus(c);
                            return (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                        <CardContent className="p-0">
                                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                                {/* Left Section - Class Info */}
                                                <div className="lg:col-span-8 p-6 sm:p-8">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">
                                                            {c.courses?.course_code || 'EMS'}
                                                        </div>
                                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${status.color}`}>
                                                            {status.dot && <div className="h-2 w-2 bg-current rounded-full animate-ping" />}
                                                            <span className="text-xs font-bold uppercase">{status.label}</span>
                                                        </div>
                                                    </div>

                                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                                        {c.class_title}
                                                    </h2>
                                                    <p className="text-gray-600 mb-6 line-clamp-2">
                                                        {c.class_description || c.courses?.course_name || "N/A"}
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {format(new Date(c.scheduled_date), "MMM do, yyyy")}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            {c.start_time} - {c.end_time}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Video className="h-4 w-4" />
                                                            {c.meeting_platform}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Section - Actions */}
                                                <div className="lg:col-span-4 bg-gray-50 border-t lg:border-t-0 lg:border-l p-6 sm:p-8 flex flex-col gap-3">
                                                    <Link href={`/ems/tutor/live-classes/${c.id}/attendance`}>
                                                        <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md">
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            View Attendance
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        className="w-full bg-blue-600 hover:bg-blue-700 shadow-md"
                                                        onClick={() => startClass(c)}
                                                    >
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Start Class
                                                    </Button>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Link href={`/ems/tutor/live-classes/${c.id}/edit`}>
                                                            <Button variant="outline" className="w-full">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
