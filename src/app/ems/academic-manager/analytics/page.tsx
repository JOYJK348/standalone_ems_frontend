"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    GraduationCap,
    Target,
    ArrowLeft,
    Download,
    Calendar,
    Award,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface AnalyticsData {
    overview: {
        total_students: number;
        total_courses: number;
        total_batches: number;
        total_enrollments: number;
        active_students: number;
        completion_rate: number;
    };
    coursePerformance: Array<{
        course_name: string;
        enrollment_count: number;
        avg_completion: number;
        avg_score: number;
    }>;
    monthlyGrowth: Array<{
        month: string;
        student_count: number;
        enrollment_count: number;
    }>;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30"); // days

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/analytics?type=overview&days=${timeRange}`);
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = analytics ? [
        {
            title: "Total Students",
            value: analytics.overview.total_students,
            icon: Users,
            color: "purple",
            change: "+12%",
        },
        {
            title: "Active Courses",
            value: analytics.overview.total_courses,
            icon: BookOpen,
            color: "blue",
            change: "+5%",
        },
        {
            title: "Total Batches",
            value: analytics.overview.total_batches,
            icon: GraduationCap,
            color: "green",
            change: "+8%",
        },
        {
            title: "Enrollments",
            value: analytics.overview.total_enrollments,
            icon: Target,
            color: "orange",
            change: "+15%",
        },
        {
            title: "Active Students",
            value: analytics.overview.active_students,
            icon: TrendingUp,
            color: "indigo",
            change: "+10%",
        },
        {
            title: "Completion Rate",
            value: `${analytics.overview.completion_rate}%`,
            icon: Award,
            color: "pink",
            change: "+3%",
        },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Analytics & Reports
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Track performance and insights
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="h-10 px-3 rounded-md border border-gray-300"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                                                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    {stat.change}
                                                </span>
                                            </div>
                                            <h3 className="text-gray-600 text-sm font-medium mb-1">
                                                {stat.title}
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Course Performance */}
                        <Card className="border-0 shadow-lg mb-8">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Course Performance
                                    </h2>
                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {analytics?.coursePerformance?.slice(0, 5).map((course, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {course.course_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {course.enrollment_count} enrollments
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Avg Score</p>
                                                    <p className="text-lg font-bold text-purple-600">
                                                        {course.avg_score}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${course.avg_completion}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {course.avg_completion}% average completion
                                            </p>
                                        </div>
                                    )) || (
                                            <p className="text-center text-gray-500 py-8">
                                                No course performance data available
                                            </p>
                                        )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Growth */}
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Monthly Growth
                                    </h2>
                                    <Button variant="outline" size="sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Custom Range
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {analytics?.monthlyGrowth?.map((month, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-24 text-sm font-medium text-gray-600">
                                                {month.month}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${(month.student_count / 100) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                                        {month.student_count}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${(month.enrollment_count / 100) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                                        {month.enrollment_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) || (
                                            <p className="text-center text-gray-500 py-8">
                                                No growth data available
                                            </p>
                                        )}
                                </div>

                                <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Students</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Enrollments</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                                <CardContent className="p-6">
                                    <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                                        Most Popular Course
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900">
                                        {analytics?.coursePerformance?.[0]?.course_name || "N/A"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardContent className="p-6">
                                    <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                                        Growth Rate
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900">
                                        +12.5%
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                                <CardContent className="p-6">
                                    <Award className="h-8 w-8 text-green-600 mb-3" />
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                                        Avg. Student Score
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900">
                                        {analytics?.coursePerformance?.[0]?.avg_score || 0}%
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>

            </AcademicManagerLayout>
        </div>
    );
}

