"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    BookOpen,
    FileText,
    Video,
    Calendar,
    Clock,
    Users,
    CheckSquare,
    Layers,
    TrendingUp,
    FileCheck,
    Sparkles,
    ArrowRight,
    Zap,
    Target,
    Award,
    BarChart3,
    PlusCircle,
    Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import api from '@/lib/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface TutorDashboardData {
    courses: any[];
    upcoming_classes: any[];
    pending_assignments: any[];
    pending_grading_count: number;
    total_courses: number;
    total_quizzes: number;
    total_assignments: number;
    recent_activities: any[];
}

export default function TutorDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<TutorDashboardData>({
        courses: [],
        upcoming_classes: [],
        pending_assignments: [],
        pending_grading_count: 0,
        total_courses: 0,
        total_quizzes: 0,
        total_assignments: 0,
        recent_activities: []
    });

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (!token) {
            router.push('/ems/tutor/login');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/ems/tutor/dashboard?_t=${Date.now()}`);

            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error: any) {
            console.error("❌ [Tutor Dashboard] Error:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
            setError(errorMsg);

            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                Cookies.remove('access_token');
                router.push('/ems/tutor/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-0 shadow-xl rounded-3xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h3>
                        <p className="text-gray-600 mb-6 text-sm">{error}</p>
                        <Button onClick={fetchDashboardData} className="w-full rounded-xl font-bold">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Quick actions for Tutor
    const quickActions = [
        { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/ems/tutor/courses', color: 'blue' },
        { id: 'live', label: 'Live Classes', icon: Video, href: '/ems/tutor/live-classes', color: 'rose' },
        { id: 'grading', label: 'Grading', icon: FileCheck, href: '/ems/tutor/grading', badge: dashboardData.pending_grading_count, color: 'purple' },
        { id: 'assignments', label: 'Assignments', icon: FileText, href: '/ems/tutor/assignments', color: 'indigo' },
        { id: 'materials', label: 'Materials', icon: Layers, href: '/ems/tutor/materials', color: 'cyan' },
        { id: 'students', label: 'Students', icon: Users, href: '/ems/tutor/students', color: 'emerald' },
    ];

    const statCards = [
        { label: 'Total Courses', value: dashboardData.total_courses, icon: BookOpen, color: 'blue', href: '/ems/tutor/courses' },
        { label: 'Assignments', value: dashboardData.total_assignments, icon: FileText, color: 'purple', href: '/ems/tutor/assignments' },
        { label: 'Quizzes', value: dashboardData.total_quizzes, icon: CheckSquare, color: 'indigo', href: '/ems/tutor/quizzes' },
        { label: 'Pending Grading', value: dashboardData.pending_grading_count, icon: FileCheck, color: 'rose', href: '/ems/tutor/grading' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 pb-20">
            <TutorTopNavbar />

            {/* Main Content - Scrollable */}
            <div className="overflow-y-auto">
                {/* Hero Card - Institution Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative mx-4 sm:mx-6 mb-6 mt-6 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                    </div>

                    {/* Content */}
                    <div className="relative p-6 sm:p-8 lg:p-10 text-white">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-4"
                                >
                                    <Sparkles className="h-3 w-3 text-yellow-400" />
                                    Tutor Dashboard
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight">
                                    Teaching Excellence
                                </h2>
                                <p className="text-blue-100 text-sm sm:text-base max-w-xl opacity-90 leading-relaxed">
                                    {dashboardData.pending_grading_count > 0
                                        ? `You have ${dashboardData.pending_grading_count} submission${dashboardData.pending_grading_count > 1 ? 's' : ''} waiting for your feedback.`
                                        : "All caught up! Your students are ready for new challenges."}
                                </p>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 lg:gap-6">
                                {statCards.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <stat.icon className="h-5 w-5 text-white/80" />
                                            <span className="text-2xl font-black">{stat.value}</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Quick CTA */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
                            <Link href="/ems/tutor/live-classes/create">
                                <Button className="bg-white text-purple-900 hover:bg-blue-50 font-bold shadow-xl rounded-xl h-11 px-6">
                                    <Video className="h-4 w-4 mr-2" />
                                    Schedule Class
                                </Button>
                            </Link>
                            {dashboardData.pending_grading_count > 0 && (
                                <Link href="/ems/tutor/grading">
                                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold rounded-xl backdrop-blur-sm h-11 px-6">
                                        <CheckSquare className="h-4 w-4 mr-2" />
                                        Grade Now ({dashboardData.pending_grading_count})
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <div className="mb-8 px-4 sm:px-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        Quick Actions
                    </h3>
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
                                            className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-2 relative bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all rounded-2xl group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 group-hover:bg-${action.color}-600 transition-colors flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 text-${action.color}-600 group-hover:text-white transition-colors`} />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-600 group-hover:text-purple-700">{action.label}</span>
                                            {action.badge && action.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">
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

                {/* Assigned Courses Carousel */}
                {dashboardData.courses.length > 0 && (
                    <div className="mb-8 overflow-hidden">
                        <div className="flex items-center justify-between px-4 sm:px-6 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">My Courses</h3>
                            <Link href="/ems/tutor/courses" className="text-purple-600 text-xs font-bold flex items-center gap-1 hover:underline">
                                View All <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 pb-6 pt-1">
                            {dashboardData.courses.map((course: any, index: number) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-[280px] snap-center"
                                >
                                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group">
                                        <div className="h-36 bg-gradient-to-br from-purple-600 to-indigo-800 relative">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.course_name} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <BookOpen className="h-14 w-14 text-white/20" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/20">
                                                    {course.course_code}
                                                </span>
                                            </div>
                                        </div>
                                        <CardContent className="p-5">
                                            <h4 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors">{course.course_name}</h4>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-500">24 Students</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Layers className="h-3 w-3 text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-500">{course.modules_count || 0} Modules</span>
                                                </div>
                                            </div>
                                            <Link href={`/ems/tutor/courses/${course.id}`} className="mt-4 block">
                                                <Button size="sm" variant="outline" className="w-full rounded-xl font-bold text-[11px] border-gray-200 hover:bg-purple-50 hover:border-purple-300">
                                                    Manage Course
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Next Live Class */}
                {dashboardData.upcoming_classes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-4 sm:mx-6 mb-8"
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Video className="h-5 w-5 text-rose-500" />
                            Upcoming Live Session
                        </h3>
                        <Card className="border-0 shadow-xl overflow-hidden rounded-3xl bg-white hover:shadow-2xl transition-all">
                            <div className="flex flex-col lg:flex-row">
                                <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 p-6 sm:p-8 text-white lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                            <span className="text-[10px] font-black uppercase tracking-widest ml-1">Live Soon</span>
                                        </div>
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-3 mb-2">
                                                <Clock className="h-6 w-6 opacity-80" />
                                                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                                                    {dashboardData.upcoming_classes[0].start_time?.substring(0, 5) || dashboardData.upcoming_classes[0].start_time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/80">
                                                <Calendar className="h-4 w-4" />
                                                <p className="text-sm font-semibold">
                                                    {new Date(dashboardData.upcoming_classes[0].scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                            <Video className="h-3 w-3" />
                                            <span className="text-xs font-bold">{dashboardData.upcoming_classes[0].provider || 'Virtual Class'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8 lg:w-3/5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 leading-tight">
                                            {dashboardData.upcoming_classes[0].class_title || dashboardData.upcoming_classes[0].topic}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-xl">
                                                <BookOpen className="h-4 w-4 text-purple-600" />
                                                <span className="text-xs font-bold text-purple-700">
                                                    {dashboardData.upcoming_classes[0].courses?.course_name || 'Assigned Course'}
                                                </span>
                                            </div>
                                            {dashboardData.upcoming_classes[0].batch_name && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                    <span className="text-xs font-bold text-blue-700">{dashboardData.upcoming_classes[0].batch_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        {dashboardData.upcoming_classes[0].description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{dashboardData.upcoming_classes[0].description}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                        {dashboardData.upcoming_classes[0].meeting_link ? (
                                            <>
                                                <Link href={dashboardData.upcoming_classes[0].meeting_link} target="_blank" className="flex-1">
                                                    <Button className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-rose-200">
                                                        <Video className="h-4 w-4 mr-2" />
                                                        Start Session
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/ems/tutor/live-classes/${dashboardData.upcoming_classes[0].id}`}>
                                                    <Button variant="outline" className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 font-bold rounded-xl h-12">
                                                        Details
                                                    </Button>
                                                </Link>
                                            </>
                                        ) : (
                                            <Link href={`/ems/tutor/live-classes/${dashboardData.upcoming_classes[0].id}`} className="flex-1">
                                                <Button className="w-full bg-gray-900 hover:bg-black text-white font-bold rounded-xl h-12">
                                                    View Details
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Recent Activity */}
                <div className="mb-10 px-4 sm:px-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                            Recent Activity
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {dashboardData.recent_activities.length > 0 ? (
                            dashboardData.recent_activities.slice(0, 5).map((activity: any, index: number) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-0 shadow-sm hover:shadow-md transition-all rounded-2xl border-l-[6px] border-l-purple-500 overflow-hidden bg-white">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center flex-shrink-0 border border-purple-100">
                                                        {activity.module === 'assignments' ? <FileText className="h-5 w-5 text-purple-600" /> :
                                                            activity.module === 'live_classes' ? <Video className="h-5 w-5 text-rose-600" /> :
                                                                <Calendar className="h-5 w-5 text-indigo-600" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{activity.title}</h4>
                                                            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                                                {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{activity.message}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(activity.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            {activity.module && (
                                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px] font-bold uppercase">
                                                                    {activity.module.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-600">
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold italic">No recent activities to show</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <TutorBottomNav />
        </div>
    );
}
