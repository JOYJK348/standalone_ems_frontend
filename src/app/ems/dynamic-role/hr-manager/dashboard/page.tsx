"use client";

import { useState, useEffect } from "react";
import HRManagerLayout from "@/components/layout/HRManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    GraduationCap,
    Building2,
    Calendar,
    Plus,
    UserPlus,
    TrendingUp,
    ArrowRight,
    Loader2,
    FileText,
    CheckSquare,
    Clock,
    AlertCircle,
    Upload,
    Award,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import Cookies from "js-cookie";

interface DashboardStats {
    totalTutors: number;
    totalStudents: number;
    totalEnrollments: number;
    activeEnrollments: number;
    newEnrollmentsWeek: number;
    attendanceRate: number;
    pendingAssignments: number;
    totalCourses: number;
    totalBatches: number;
}

interface RecentEnrollment {
    id: number;
    students: { first_name: string; last_name: string; email: string };
    courses: { course_name: string; course_code: string };
    enrollment_status: string;
    created_at: string;
}

export default function HRManagerDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentEnrollments, setRecentEnrollments] = useState<
        RecentEnrollment[]
    >([]);
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        fetchDashboardData();
        const storedCompanyName =
            Cookies.get("company_name") || "Your Institution";
        setCompanyName(storedCompanyName);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, enrollmentsRes] = await Promise.all([
                api.get("/ems/dashboard/my-stats"),
                api.get("/ems/hr/enrollments?page=1&limit=5"),
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data.stats);
            }
            if (enrollmentsRes.data.success) {
                setRecentEnrollments(enrollmentsRes.data.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = stats
        ? [
              {
                  label: "Total Tutors",
                  value: stats.totalTutors?.toString() || "0",
                  icon: GraduationCap,
                  color: "blue",
                  href: "/ems/dynamic-role/hr-manager/tutors",
                  bgColor: "bg-blue-100",
                  textColor: "text-blue-600",
              },
              {
                  label: "Total Students",
                  value: stats.totalStudents?.toString() || "0",
                  icon: Users,
                  color: "green",
                  href: "/ems/dynamic-role/hr-manager/enrollments",
                  bgColor: "bg-green-100",
                  textColor: "text-green-600",
              },
              {
                  label: "New This Week",
                  value: stats.newEnrollmentsWeek?.toString() || "0",
                  icon: UserPlus,
                  color: "purple",
                  href: "/ems/dynamic-role/hr-manager/enrollments",
                  bgColor: "bg-purple-100",
                  textColor: "text-purple-600",
              },
              {
                  label: "Attendance Rate",
                  value: stats.attendanceRate
                      ? `${stats.attendanceRate}%`
                      : "—",
                  icon: CheckSquare,
                  color: "orange",
                  href: "/ems/dynamic-role/hr-manager/attendance",
                  bgColor: "bg-orange-100",
                  textColor: "text-orange-600",
              },
          ]
        : [];

    const quickActions = [
        {
            label: "Enroll Student",
            icon: UserPlus,
            href: "/ems/dynamic-role/hr-manager/enrollments",
            color: "blue",
        },
        {
            label: "Assign Tutor",
            icon: GraduationCap,
            href: "/ems/dynamic-role/hr-manager/tutors",
            color: "green",
        },
        {
            label: "Bulk Import CSV",
            icon: Upload,
            href: "/ems/dynamic-role/hr-manager/bulk-import",
            color: "purple",
        },
        {
            label: "Attendance Report",
            icon: CheckSquare,
            href: "/ems/dynamic-role/hr-manager/attendance",
            color: "orange",
        },
    ];

    const actionColorMap: Record<string, { bg: string; text: string }> = {
        blue: { bg: "bg-blue-100", text: "text-blue-600" },
        green: { bg: "bg-green-100", text: "text-green-600" },
        purple: { bg: "bg-purple-100", text: "text-purple-600" },
        orange: { bg: "bg-orange-100", text: "text-orange-600" },
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <HRManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Company Context Banner */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-indigo-600 mr-3" />
                            <div>
                                <p className="text-sm font-semibold text-indigo-900">
                                    {companyName} - Human Resources
                                </p>
                                <p className="text-xs text-indigo-700">
                                    People operations and enrollment management
                                    dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
                            Welcome Back, HR Manager!
                        </h1>
                        <p className="text-gray-600">
                            Manage your institution's people operations
                        </p>
                    </div>

                    {/* Stats Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <span className="ml-3 text-gray-600">
                                Loading HR statistics...
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {statCards.map((stat, index) => (
                                <div key={index}>
                                    <Link href={stat.href}>
                                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white group">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {stat.label}
                                                        </p>
                                                        <p className="text-3xl font-bold text-gray-900">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                                    >
                                                        <stat.icon
                                                            className={`h-6 w-6 ${stat.textColor}`}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={index} href={action.href}>
                                    <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group h-full">
                                        <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                                            <div
                                                className={`w-12 h-12 mx-auto mb-3 rounded-xl ${actionColorMap[action.color].bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                            >
                                                <action.icon
                                                    className={`h-6 w-6 ${actionColorMap[action.color].text}`}
                                                />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {action.label}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* People & Enrollment Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tutor Management */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Tutor Management
                                </h2>
                                <Link href="/ems/dynamic-role/hr-manager/tutors">
                                    <Button variant="ghost" size="sm">
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-8 text-center">
                                    <GraduationCap className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2 font-medium">
                                        {stats?.totalTutors || 0} Active Tutors
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {stats?.pendingAssignments || 0} pending
                                        course assignments
                                    </p>
                                    <Link href="/ems/dynamic-role/hr-manager/tutors">
                                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Assign Tutor to Course
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enrollment Overview */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Enrollment Overview
                                </h2>
                                <Link href="/ems/dynamic-role/hr-manager/enrollments">
                                    <Button variant="ghost" size="sm">
                                        View Details
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                                            <UserPlus className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-indigo-900">
                                                {stats?.newEnrollmentsWeek || 0}
                                            </p>
                                            <p className="text-xs text-indigo-700">
                                                New This Week
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-900">
                                                {stats?.activeEnrollments || 0}
                                            </p>
                                            <p className="text-xs text-green-700">
                                                Active Enrollments
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/ems/dynamic-role/hr-manager/enrollments"
                                        className="block mt-4"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            View All Enrollments
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Enrollments Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Recent Enrollments
                            </h2>
                            <Link href="/ems/dynamic-role/hr-manager/enrollments">
                                <Button
                                    variant="ghost"
                                    className="text-indigo-600 hover:text-indigo-700"
                                >
                                    View All Enrollments
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                    Student
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                    Course
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentEnrollments.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-6 py-8 text-center text-gray-500"
                                                    >
                                                        No recent enrollments
                                                        found
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentEnrollments.map((enr) => (
                                                    <tr
                                                        key={enr.id}
                                                        className="hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900">
                                                                {
                                                                    enr.students
                                                                        ?.first_name
                                                                }{" "}
                                                                {
                                                                    enr.students
                                                                        ?.last_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    enr.students
                                                                        ?.email
                                                                }
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700 line-clamp-1">
                                                                {enr.courses
                                                                    ?.course_name ||
                                                                    enr.courses
                                                                        ?.course_code}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {enr.enrollment_status ===
                                                            "active" ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold uppercase">
                                                                    {
                                                                        enr.enrollment_status
                                                                    }
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(
                                                                enr.created_at,
                                                            ).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendance Summary & Pending Assignments */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Attendance Summary */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Attendance Summary
                                </h2>
                                <Link href="/ems/dynamic-role/hr-manager/attendance">
                                    <Button variant="ghost" size="sm">
                                        View Report
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-8 text-center">
                                    <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2 font-medium">
                                        {stats?.attendanceRate
                                            ? `${stats.attendanceRate}%`
                                            : "—"}{" "}
                                        Overall Attendance
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Last 30 days attendance tracking
                                    </p>
                                    <Link href="/ems/dynamic-role/hr-manager/attendance">
                                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View Full Report
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Quick Overview
                                </h2>
                            </div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                    <Award className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Total Courses
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Active academic programs
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {stats?.totalCourses || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                    <Calendar className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Total Batches
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Scheduled batches
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {stats?.totalBatches || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Pending Assignments
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Tutor course assignments
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {stats?.pendingAssignments || 0}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </HRManagerLayout>
        </div>
    );
}
