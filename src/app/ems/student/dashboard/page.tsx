"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    BookOpen,
    FileText,
    Video,
    Calendar,
    Clock,
    Folder,
    PlayCircle,
    ArrowRight,
    Camera,
    Sparkles,
    Award,
    MessageSquare,
    ClipboardCheck,
    Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';
import { AttendanceVerification } from '@/components/ems/attendance/AttendanceVerification';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import Cookies from 'js-cookie';

interface DashboardData {
    student: {
        id: number;
        name: string;
        student_code: string;
        email: string;
    };
    enrolled_courses: any[];
    available_courses: any[];
    pending_assignments: any[];
    recent_materials: any[];
    upcoming_live_classes: any[];
    active_attendance_sessions: any[];
}

export default function StudentDashboard() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        student: {
            id: 0,
            name: 'Student',
            student_code: '',
            email: ''
        },
        enrolled_courses: [],
        available_courses: [],
        pending_assignments: [],
        recent_materials: [],
        upcoming_live_classes: [],
        active_attendance_sessions: []
    });
    const [practiceStatus, setPracticeStatus] = useState<any[]>([]);

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (!token) {
            router.push('/ems/student/login');
            return;
        }
        fetchDashboardData();
        fetchPracticeStatus();
    }, []);

    const fetchPracticeStatus = async () => {
        try {
            const response = await api.get('/ems/practice/student/status');
            if (response.data.success) {
                setPracticeStatus(response.data.data || []);
            }
        } catch (err) { }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/ems/students/dashboard?_t=${Date.now()}`);

            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error: any) {
            console.error("❌ [Student Dashboard] Error:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
            setError(errorMsg);

            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                Cookies.remove('access_token');
                router.push('/ems/student/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceClick = () => {
        if (dashboardData.active_attendance_sessions && dashboardData.active_attendance_sessions.length > 0) {
            setIsAttendanceModalOpen(true);
        } else {
            toast.info("No active attendance sessions available at the moment.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Dashboard</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={fetchDashboardData} className="w-full">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Get the primary course for hero card
    const primaryCourse = dashboardData.enrolled_courses[0];
    const pendingAttendance = dashboardData.active_attendance_sessions.filter((s: any) => s.recommended_action !== 'COMPLETED');

    // Quick actions for mobile
    const quickActions = [
        { id: 'assignments', label: 'Assignments', icon: FileText, href: '/ems/student/assignments', badge: dashboardData.pending_assignments.length },
        { id: 'materials', label: 'Materials', icon: BookOpen, href: '/ems/student/materials' },
        { id: 'doubts', label: 'Doubts', icon: MessageSquare, href: '/ems/student/doubts' },
        { id: 'certificates', label: 'Certificates', icon: Award, href: '#' },
        { id: 'attendance', label: 'Attendance', icon: Calendar, href: '/ems/student/attendance' },
        { id: 'tests', label: 'Tests', icon: ClipboardCheck, href: '/ems/student/assessments' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopNavbar />

            {/* Main Content - Scrollable */}
            <div className="overflow-y-auto">
                {/* Hero Card - Primary Course */}
                {primaryCourse && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative mx-4 sm:mx-6 mb-6 mt-6 rounded-2xl overflow-hidden shadow-xl"
                    >
                        {/* Professional Background */}
                        <div className="absolute inset-0 bg-blue-600">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                        </div>

                        {/* Content */}
                        <div className="relative p-6 sm:p-8 text-white">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-xl sm:text-2xl font-bold mb-2">{primaryCourse.course.course_name}</h2>
                                <p className="text-sm sm:text-base text-white/80 mb-4">
                                    Continue where you left off
                                </p>

                                {/* Progress Ring */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                                        <svg className="transform -rotate-90 w-full h-full">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="45%"
                                                stroke="rgba(255,255,255,0.2)"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <motion.circle
                                                cx="50%"
                                                cy="50%"
                                                r="45%"
                                                stroke="white"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 45}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - (primaryCourse.completion_percentage || 0) / 100) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm sm:text-base font-bold">{Math.round(primaryCourse.completion_percentage || 0)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs sm:text-sm text-white/70 mb-1">Course Progress</div>
                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${primaryCourse.completion_percentage || 0}%` }}
                                                transition={{ duration: 1.5, delay: 0.3 }}
                                                className="h-full bg-white rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Resume CTA */}
                                <Link href={`/ems/student/courses/${primaryCourse.course.id}`}>
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-white text-blue-700 hover:bg-gray-100 shadow-lg font-semibold"
                                    >
                                        <PlayCircle className="h-5 w-5 mr-2" />
                                        Resume Learning
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Continue Learning Carousel */}
                {dashboardData.enrolled_courses.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 px-4 sm:px-6">Continue Learning</h3>
                        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 pb-4">
                            {dashboardData.enrolled_courses.map((enrollment: any, index: number) => (
                                <motion.div
                                    key={enrollment.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-[280px] snap-center"
                                >
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                        {/* Course Thumbnail */}
                                        <div className="h-32 sm:h-36 bg-gradient-to-br from-blue-600 to-indigo-600 relative overflow-hidden">
                                            {enrollment.course.thumbnail_url ? (
                                                <>
                                                    <img
                                                        src={enrollment.course.thumbnail_url}
                                                        alt={enrollment.course.course_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <BookOpen className="h-12 w-12 text-white/30" />
                                                </div>
                                            )}
                                            {/* Progress Badge Overlay */}
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-md">
                                                <span className="text-xs font-bold text-gray-700">{Math.round(enrollment.completion_percentage || 0)}%</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h4 className="font-semibold text-sm mb-1 line-clamp-1">{enrollment.course.course_name}</h4>
                                            <p className="text-xs text-muted-foreground mb-3">{enrollment.batch?.batch_name || 'Self-paced'}</p>

                                            {/* Progress Pill */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${enrollment.completion_percentage || 0}%` }}
                                                        transition={{ duration: 1, delay: index * 0.1 }}
                                                        className="h-full bg-blue-600 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium ml-2 text-gray-600">
                                                    {Math.round(enrollment.completion_percentage || 0)}%
                                                </span>
                                            </div>

                                            {/* Resume CTA */}
                                            <Link href={`/ems/student/courses/${enrollment.course.id}`}>
                                                <Button size="sm" className="w-full" variant="outline">
                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                    Resume
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Attendance Banner - Only if something to do */}
                {pendingAttendance.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAttendanceClick}
                        className="mx-4 sm:mx-6 mb-6 pt-2 cursor-pointer group"
                    >
                        <div className="w-full bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg border-2 border-green-400/30 flex items-center justify-between text-white transition-all group-hover:shadow-emerald-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse group-hover:bg-white/30 transition-colors">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-lg leading-tight tracking-tight">Active Attendance Session!</h4>
                                    <p className="text-green-50 text-xs font-medium">Click anywhere to mark your presence now</p>
                                </div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Upcoming Live Classes Section */}
                {dashboardData.upcoming_live_classes.length > 0 && (
                    <div className="mb-8 px-4 sm:px-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <Video className="h-5 w-5 text-blue-600" />
                                Live Classes
                            </h3>
                            {dashboardData.upcoming_live_classes.length > 1 && (
                                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                                    {dashboardData.upcoming_live_classes.length} SCHEDULED
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            {dashboardData.upcoming_live_classes.slice(0, 3).map((liveClass, idx) => (
                                <motion.div
                                    key={liveClass.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {(liveClass.meeting_link || liveClass.external_link) ? (
                                        <Link href={liveClass.meeting_link || liveClass.external_link} target="_blank">
                                            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-700 to-purple-800 text-white overflow-hidden relative cursor-pointer hover:brightness-110 transition-all">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                                <CardContent className="p-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${liveClass.class_status === 'LIVE' || liveClass.class_status === 'IN_PROGRESS'
                                                                    ? 'bg-red-500 text-white animate-pulse'
                                                                    : 'bg-white/20 text-white/90'
                                                                    }`}>
                                                                    {liveClass.class_status || 'SCHEDULED'}
                                                                </span>
                                                                <span className="text-[10px] text-white/60 font-medium">
                                                                    {new Date(liveClass.scheduled_date).toLocaleDateString()} • {liveClass.start_time}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-lg mb-1">{liveClass.class_title}</h4>
                                                            <p className="text-white/70 text-xs line-clamp-1">{liveClass.course?.course_name}</p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-gray-100 font-bold border-0 shadow-xl pointer-events-none">
                                                                <Video className="h-4 w-4 mr-2" />
                                                                Join Class
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ) : (
                                        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-700 to-purple-800 text-white overflow-hidden relative opacity-75">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                            <CardContent className="p-5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-white/20 text-white/90">
                                                                {liveClass.class_status || 'SCHEDULED'}
                                                            </span>
                                                            <span className="text-[10px] text-white/60 font-medium">
                                                                {new Date(liveClass.scheduled_date).toLocaleDateString()} • {liveClass.start_time}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-lg mb-1">{liveClass.class_title}</h4>
                                                        <p className="text-white/70 text-xs line-clamp-1">{liveClass.course?.course_name}</p>
                                                    </div>
                                                    <Button disabled className="w-full sm:w-auto bg-white/10 text-white/40 border-0">
                                                        Link Pending
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div className="mb-6 px-4 sm:px-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href={action.href}>
                                        <Button
                                            variant="outline"
                                            className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-2 relative"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-xs font-medium">{action.label}</span>
                                            {action.badge && action.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                                    {action.badge}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* My Courses */}
                {dashboardData.enrolled_courses.length > 0 && (
                    <div className="mb-6 px-4 sm:px-6">
                        <h3 className="text-lg font-semibold mb-4">My Courses</h3>
                        <div className="space-y-3">
                            {dashboardData.enrolled_courses.map((enrollment: any) => (
                                <Link key={enrollment.id} href={`/ems/student/courses/${enrollment.course.id}`}>
                                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                    <BookOpen className="h-8 w-8 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm mb-1 truncate">{enrollment.course.course_name}</h4>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {enrollment.lessons_completed || 0} / {enrollment.total_lessons || 0} modules completed
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full"
                                                                style={{ width: `${enrollment.completion_percentage || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {Math.round(enrollment.completion_percentage || 0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Assignments Shortlist */}
                {dashboardData.pending_assignments.length > 0 && (
                    <div className="mb-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Pending Assignments</h3>
                            <Link href="/ems/student/assignments">
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                    View All
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {dashboardData.pending_assignments.slice(0, 3).map((assignment: any) => (
                                <Card key={assignment.id} className="border-0 shadow-md">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm mb-1">{assignment.assignment_title}</h4>
                                                <p className="text-xs text-muted-foreground mb-2">{assignment.course.course_name}</p>
                                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                                    <Clock className="h-3 w-3" />
                                                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Link href={`/ems/student/assignments/${assignment.id}`}>
                                                <Button size="sm" variant="outline">
                                                    Submit
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Attendance Verification Modal */}
            <AnimatePresence>
                {isAttendanceModalOpen && (
                    <AttendanceVerification
                        sessions={dashboardData.active_attendance_sessions}
                        onSuccess={(session: any) => {
                            setIsAttendanceModalOpen(false);
                            fetchDashboardData();

                            if (session && (session.class_mode === 'ONLINE' || session.class_mode === 'HYBRID')) {
                                if (session.live_class?.meeting_link) {
                                    window.open(session.live_class.meeting_link, '_blank');
                                    toast.success("Redirecting to live class...");
                                } else {
                                    toast.info("Class link not available yet.");
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
