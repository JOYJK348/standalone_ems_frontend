"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Users,
    GraduationCap,
    Calendar,
    Plus,
    PlusCircle,
    TrendingUp,
    ArrowRight,
    Building2,
    Loader2,
    Folder,
    Video,
    Clock,
    Clock3,
    Layers
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { UnifiedScheduleModal } from "@/components/ems/dashboard/UnifiedScheduleModal";

interface DashboardStats {
    totalCourses: number;
    publishedCourses: number;
    totalBatches: number;
    totalStudents: number;
    totalTutors: number;
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
}

interface CourseMapping {
    courseId: number;
    courseCode: string;
    courseName: string;
    status: string;
    isPublished: boolean;
    tutor: {
        id: number;
        name: string;
        email: string;
    } | null;
    students: Array<{
        id: number;
        name: string;
        email: string;
        studentCode: string;
    }>;
    studentCount: number;
}

export default function AcademicManagerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [courseMappings, setCourseMappings] = useState<CourseMapping[]>([]);
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mappingsLoading, setMappingsLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [todayClasses, setTodayClasses] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardStats();
        fetchCourseMappings();
        // Get company name from cookies or storage
        const storedCompanyName = Cookies.get('company_name') || 'Your Institution';
        setCompanyName(storedCompanyName);
        fetchTodayClasses();
    }, []);

    const fetchTodayClasses = async () => {
        try {
            const date = new Date().toISOString().split('T')[0];
            const response = await api.get(`/ems/attendance?mode=schedule&date=${date}`);
            if (response.data.success) {
                const scheduleData = response.data.data.schedule || response.data.data || [];
                setTodayClasses(Array.isArray(scheduleData) ? scheduleData : []);
            }
        } catch (err) { }
    };

    const fetchDashboardStats = async () => {
        try {
            const [statsRes, recentRes] = await Promise.all([
                api.get('/ems/dashboard/stats'),
                api.get('/ems/quizzes/recent-attempts')
            ]);
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
                setRecentResults(recentRes.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseMappings = async () => {
        try {
            setMappingsLoading(true);
            const response = await api.get('/ems/dashboard/course-mapping');
            if (response.data.success) {
                setCourseMappings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching course mappings:', error);
        } finally {
            setMappingsLoading(false);
        }
    };

    const statCards = stats ? [
        {
            label: "Public Courses",
            value: stats.publishedCourses.toString(),
            icon: BookOpen,
            color: "purple",
            href: "/ems/academic-manager/courses",
            bgColor: "bg-purple-100",
            textColor: "text-purple-600"
        },
        {
            label: "Total Batches",
            value: stats.totalBatches.toString(),
            icon: Calendar,
            color: "blue",
            href: "/ems/academic-manager/batches",
            bgColor: "bg-blue-100",
            textColor: "text-blue-600"
        },
        {
            label: "Total Students",
            value: stats.totalStudents.toString(),
            icon: Users,
            color: "green",
            href: "/ems/academic-manager/students",
            bgColor: "bg-green-100",
            textColor: "text-green-600"
        },
        {
            label: "Total Tutors",
            value: stats.totalTutors.toString(),
            icon: GraduationCap,
            color: "orange",
            href: "/ems/academic-manager/tutors",
            bgColor: "bg-orange-100",
            textColor: "text-orange-600"
        },
    ] : [];

    const quickActions = [
        { label: "Create Course", icon: BookOpen, href: "/ems/academic-manager/courses", color: "purple" },
        { label: "Create Batch", icon: Calendar, href: "/ems/academic-manager/batches", color: "blue" },
        { label: "Assign Tutor", icon: GraduationCap, href: "/ems/academic-manager/tutors", color: "green" },
        { label: "Enroll Student", icon: Users, href: "/ems/academic-manager/students", color: "orange" },
        { label: "Upload Material", icon: Folder, href: "/ems/academic-manager/materials", color: "pink" },
        {
            label: "Quick Schedule",
            icon: PlusCircle,
            onClick: () => setIsScheduleModalOpen(true),
            color: "indigo",
            isAction: true
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Company Context Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 mb-6 rounded-lg shadow-sm"
                >
                    <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                            <p className="text-sm font-semibold text-purple-900">
                                {companyName} - Learning Management System
                            </p>
                            <p className="text-xs text-purple-700">
                                Company-wide academic management dashboard
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Welcome Back, Academic Manager!
                    </h1>
                    <p className="text-gray-600">Manage your institution's academic ecosystem</p>
                </motion.div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Loading dashboard statistics...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={stat.href}>
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white group">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                                </div>
                                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {quickActions.map((action, index) => {
                            const Content = (
                                <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group h-full">
                                    <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${action.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{action.label}</p>
                                    </CardContent>
                                </Card>
                            );

                            return (action as any).isAction ? (
                                <div key={index} onClick={(action as any).onClick}>{Content}</div>
                            ) : (
                                <Link key={index} href={(action as any).href}>{Content}</Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Today's Unified Schedule Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Today's Scheduled Classes</h2>
                        <Link href="/ems/academic-manager/attendance">
                            <Button variant="ghost" size="sm" className="text-purple-600">
                                View Full Schedule <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {todayClasses.length === 0 ? (
                        <Card className="border-0 shadow-md bg-white p-8 text-center bg-gray-50/50">
                            <Clock3 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">No classes scheduled for today.</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsScheduleModalOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" /> Schedule First Class
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {todayClasses.map((cls, idx) => (
                                <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden bg-white">
                                    <CardContent className="p-0">
                                        <div className={`h-1.5 w-full ${cls.class_mode === 'ONLINE' ? 'bg-purple-500' :
                                            cls.class_mode === 'HYBRID' ? 'bg-orange-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        {cls.course?.course_code || 'COURSE'}
                                                    </span>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                                                        {cls.batch_name}
                                                    </h4>
                                                </div>
                                                <div className={`p-2 rounded-xl bg-gray-50 flex items-center gap-1.5`}>
                                                    {cls.class_mode === 'ONLINE' ? <Video className="h-3.5 w-3.5 text-purple-600" /> :
                                                        cls.class_mode === 'HYBRID' ? <Layers className="h-3.5 w-3.5 text-orange-600" /> :
                                                            <Building2 className="h-3.5 w-3.5 text-blue-600" />}
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase">{cls.class_mode || 'OFFLINE'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-bold">{cls.start_time?.substring(0, 5) || '09:00'} - {cls.end_time?.substring(0, 5) || '10:00'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-bold">{cls.total_students || 0} Students</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {cls.class_mode !== 'OFFLINE' && (
                                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-[10px] font-black uppercase border-purple-100 hover:bg-purple-50 text-purple-600 h-9">
                                                        Join Class
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => router.push(cls.session ? `/ems/academic-manager/attendance/${cls.session.id}` : `/ems/academic-manager/attendance`)}
                                                    className={`flex-1 rounded-xl text-[10px] font-black uppercase h-9 ${cls.session?.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                                        }`}>
                                                    {cls.session?.status === 'COMPLETED' ? 'Completed' : 'Attendance'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Management */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                            <Link href="/ems/academic-manager/courses">
                                <Button variant="ghost" size="sm">
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8 text-center">
                                <BookOpen className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2 font-medium">
                                    {stats?.totalCourses || 0} Active Courses
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Manage your academic curriculum
                                </p>
                                <Link href="/ems/academic-manager/courses">
                                    <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Course
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Analytics Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                            <Link href="/ems/academic-manager/analytics">
                                <Button variant="ghost" size="sm">
                                    View Details
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-blue-900">
                                            {stats?.activeStudents || 0}
                                        </p>
                                        <p className="text-xs text-blue-700">Active Students</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-green-900">
                                            {stats?.totalEnrollments || 0}
                                        </p>
                                        <p className="text-xs text-green-700">Total Enrollments</p>
                                    </div>
                                </div>
                                <Link href="/ems/academic-manager/analytics" className="block mt-4">
                                    <Button variant="outline" className="w-full">
                                        View Full Analytics
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Recent Student Performances Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Student Performances</h2>
                        <Link href="/ems/academic-manager/quizzes">
                            <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                                View All Quizzes
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <Card className="border-0 shadow-lg overflow-hidden">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400">Loading student results...</div>
                            ) : recentResults.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 italic">No recent quiz attempts found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Quiz</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Score</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentResults.map((result: any) => (
                                                <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-900 leading-none">
                                                            {result.students.first_name} {result.students.last_name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mt-1">{result.students.student_code}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-700 line-clamp-1">{result.quizzes.quiz_title}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900">{result.marks_obtained}</span>
                                                            <span className="text-xs text-gray-400">/ {result.total_marks}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden" title={`${result.percentage}%`}>
                                                            <div
                                                                className={`h-full rounded-full ${result.is_passed ? 'bg-green-500' : 'bg-red-500'}`}
                                                                style={{ width: `${result.percentage}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {result.is_passed ? (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Pass</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Fail</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Course-Tutor-Student Mapping Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Course Assignments</h2>
                        <Link href="/ems/academic-manager/courses">
                            <Button variant="ghost" size="sm">
                                Manage All
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {mappingsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <span className="ml-3 text-gray-600">Loading course assignments...</span>
                        </div>
                    ) : courseMappings.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8 text-center">
                                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2 font-medium">No courses available</p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Create your first course to get started
                                </p>
                                <Link href="/ems/academic-manager/courses">
                                    <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Course
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {courseMappings.map((course, index) => (
                                <motion.div
                                    key={course.courseId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            {/* Course Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                            {course.courseCode}
                                                        </span>
                                                        {course.isPublished && (
                                                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                                                Published
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                        {course.courseName}
                                                    </h3>
                                                </div>
                                                <Link href={`/ems/academic-manager/courses/${course.courseId}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Tutor Info */}
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                                    <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                                                        Assigned Tutor
                                                    </span>
                                                </div>
                                                {course.tutor ? (
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {course.tutor.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {course.tutor.email}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">
                                                        No tutor assigned
                                                    </p>
                                                )}
                                            </div>

                                            {/* Students Info */}
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-green-600" />
                                                        <span className="text-xs font-semibold text-green-900 uppercase tracking-wide">
                                                            Enrolled Students
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-700">
                                                        {course.studentCount}
                                                    </span>
                                                </div>
                                                {course.students.length > 0 ? (
                                                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                        {course.students.map((student) => (
                                                            <div
                                                                key={student.id}
                                                                className="flex items-center justify-between text-xs bg-white p-2 rounded"
                                                            >
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">
                                                                        {student.name}
                                                                    </p>
                                                                    <p className="text-gray-600">
                                                                        {student.studentCode}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">
                                                        No students enrolled yet
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            </AcademicManagerLayout>

            <UnifiedScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSuccess={fetchTodayClasses}
            />
        </div>
    );
}

