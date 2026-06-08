"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeft,
    Loader2,
    RefreshCw,
    MapPin,
    Camera,
    TrendingUp,
    AlertTriangle,
    Video,
    Users,
    Award,
    Fingerprint
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AttendanceVerification } from "@/components/ems/attendance/AttendanceVerification";

export default function AttendancePage() {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    useEffect(() => {
        setMounted(true);
        fetchAttendance();
        fetchActiveSessions();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/attendance?mode=student-history");
            if (response.data.success) {
                const data = response.data.data || [];
                setAttendanceRecords(data);

                const present = data.filter((r: any) => r.status === 'PRESENT').length;
                const total = data.length || 0;
                setStats({
                    total,
                    present,
                    absent: total - present,
                    percentage: total > 0 ? Math.round((present / total) * 100) : 0
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load attendance history");
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveSessions = async () => {
        try {
            console.log("Fetching active sessions from student dashboard...");
            const response = await api.get("/ems/students/dashboard");
            console.log("Active sessions raw response:", response.data);
            if (response.data.success && response.data.data.active_attendance_sessions) {
                const sessions = response.data.data.active_attendance_sessions;
                console.log("Setting active sessions:", sessions);
                setActiveSessions(sessions);

                // Also set a specifically 'pending' count for the UI
                const pending = sessions.filter((s: any) => s.recommended_action !== 'COMPLETED');
                setPendingCount(pending.length);
            } else {
                console.warn("No active sessions data found in response");
            }
        } catch (error) {
            console.error("Critical error fetching active sessions:", error);
        }
    };

    const handleAttendanceClick = () => {
        console.log("Handle attendance click triggered", { activeSessionsCount: activeSessions.length });
        if (activeSessions && activeSessions.length > 0) {
            toast.loading("Opening biometric verification...");
            setIsAttendanceModalOpen(true);
            setTimeout(() => toast.dismiss(), 1000);
        } else {
            console.log("No active sessions, showing info toast");
            toast.info("No active attendance sessions available at the moment.");
        }
    };

    const getAttendanceStatus = (percentage: number) => {
        if (percentage >= 90) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
        if (percentage >= 75) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
        if (percentage >= 60) return { label: "Average", color: "text-orange-600", bg: "bg-orange-50" };
        return { label: "Low", color: "text-red-600", bg: "bg-red-50" };
    };

    const statusInfo = getAttendanceStatus(stats.percentage);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading attendance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopNavbar />

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => window.history.back()}
                    className="mb-4 hover:bg-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance</h1>
                    <p className="text-gray-600">Track your class attendance across all courses</p>
                </motion.div>

                {/* Main Stats Card - Circular Progress */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                        <CardContent className="p-6 sm:p-8 relative">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* Circular Progress */}
                                <div className="relative">
                                    <svg className="transform -rotate-90 w-32 h-32 sm:w-40 sm:h-40">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="45%"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="50%"
                                            cy="50%"
                                            r="45%"
                                            stroke="white"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 45}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - stats.percentage / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl sm:text-4xl font-bold text-white">{stats.percentage}%</span>
                                        <span className="text-xs text-white/80 font-medium">Attendance</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                                    <div className="text-center sm:text-left">
                                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Classes</p>
                                        <p className="text-3xl font-bold text-white">{stats.total}</p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Present</p>
                                        <p className="text-3xl font-bold text-green-300">{stats.present}</p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Absent</p>
                                        <p className="text-3xl font-bold text-orange-300">{stats.absent}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bg} ${statusInfo.color} border-2 border-white/20`}>
                                        {statusInfo.label} Attendance
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchAttendance}
                                    className="text-white hover:bg-white/10"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Mark Attendance Button */}
                <div className="mb-6">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <Card
                            onClick={handleAttendanceClick}
                            className={`border-0 shadow-lg overflow-hidden transition-all group ${pendingCount > 0
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-200/50 cursor-pointer"
                                : "bg-gray-100 opacity-80"
                                }`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${pendingCount > 0
                                            ? "bg-white/20 backdrop-blur-sm group-hover:bg-white/30"
                                            : "bg-gray-200"
                                            }`}>
                                            <Fingerprint className={`h-7 w-7 ${pendingCount > 0 ? "text-white" : "text-gray-400"
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${pendingCount > 0 ? "text-white" : "text-gray-900"
                                                }`}>
                                                {pendingCount > 0 ? "Active Session Available" : "All Caught Up!"}
                                            </h3>
                                            <p className={`text-sm ${pendingCount > 0 ? "text-white/90" : "text-gray-600"
                                                }`}>
                                                {pendingCount > 0
                                                    ? `${pendingCount} session(s) waiting for attendance`
                                                    : "You've marked all pending attendance for today."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className={`p-2 rounded-full transition-colors ${pendingCount > 0 ? "bg-white/20 group-hover:bg-white/30" : "bg-gray-200"}`}>
                                            <ArrowLeft className={`h-6 w-6 rotate-180 ${pendingCount > 0 ? "text-white" : "text-gray-400"}`} />
                                        </div>
                                    </div>
                                    <div className="sm:hidden">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${pendingCount > 0 ? "bg-white/20 group-hover:bg-white/30" : "bg-gray-200"}`}>
                                            <ArrowLeft className={`h-5 w-5 rotate-180 ${pendingCount > 0 ? "text-white" : "text-gray-400"}`} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Warning Card */}
                {stats.percentage < 75 && stats.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Card className="border-0 shadow-md bg-orange-50 border-l-4 border-orange-500">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-orange-900 mb-1">Attendance Alert</h3>
                                        <p className="text-sm text-orange-800">
                                            Your attendance is below 75%. Maintain at least 75% attendance to be eligible for exams.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Attendance Records */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                Recent Activity
                            </h2>
                        </div>

                        {attendanceRecords.length === 0 ? (
                            <Card className="border-2 border-dashed border-gray-200">
                                <CardContent className="p-12 text-center">
                                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Records Found</h3>
                                    <p className="text-gray-600">Your attendance records will appear here</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {attendanceRecords.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Status Icon */}
                                                    <div
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${record.status === "PRESENT"
                                                            ? "bg-green-100"
                                                            : "bg-orange-100"
                                                            }`}
                                                    >
                                                        {record.status === "PRESENT" ? (
                                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                        ) : (
                                                            <XCircle className="h-6 w-6 text-orange-600" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 truncate">
                                                            {record.session?.course?.course_name || "Class Session"}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {mounted
                                                                    ? new Date(record.session?.session_date).toLocaleDateString("en-US", {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric"
                                                                    })
                                                                    : ""}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="flex items-center gap-1">
                                                                {record.session?.class_mode === "ONLINE" ? (
                                                                    <Video className="h-3 w-3" />
                                                                ) : (
                                                                    <Users className="h-3 w-3" />
                                                                )}
                                                                {record.session?.class_mode || "OFFLINE"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className="text-right flex-shrink-0">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${record.status === "PRESENT"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-orange-100 text-orange-700"
                                                                }`}
                                                        >
                                                            {record.status}
                                                        </span>
                                                        <p className="text-[9px] text-gray-400 mt-1 font-medium uppercase">
                                                            {record.verification_status}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Smart Attendance Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-600 to-indigo-600">
                                <CardContent className="p-5 text-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold">Smart Attendance</h3>
                                    </div>
                                    <p className="text-sm text-white/90 mb-4">
                                        Attendance is verified using advanced Face Recognition and GPS technology.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-medium">Campus GPS Verified</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                                <Camera className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-medium">Face ID Recognition</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Attendance Tips */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="border-0 shadow-md">
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        Attendance Tips
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Arrive on time to ensure attendance is marked</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Maintain at least 75% attendance for exam eligibility</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Enable camera and location permissions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Contact your tutor for attendance corrections</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            <BottomNav />

            {/* Attendance Verification Modal */}
            <AnimatePresence>
                {isAttendanceModalOpen && (
                    <AttendanceVerification
                        sessions={activeSessions}
                        onSuccess={(session: any) => {
                            setIsAttendanceModalOpen(false);
                            fetchAttendance();
                            fetchActiveSessions();
                            toast.success("Attendance marked successfully!");

                            if (session && (session.class_mode === 'ONLINE' || session.class_mode === 'HYBRID')) {
                                if (session.live_class?.meeting_link) {
                                    window.open(session.live_class.meeting_link, '_blank');
                                    toast.info("Redirecting to live class...");
                                }
                            }
                        }}
                        onClose={() => setIsAttendanceModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
