"use client";

import { useState, useEffect } from "react";
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    Users,
    Building2,
    Calendar,
    TrendingDown,
    Plus,
    PlusCircle,
    TrendingUp,
    ArrowRight,
    Loader2,
    FileText,
    CreditCard,
    BarChart3,
    Clock,
    Clock3,
    CheckCircle,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import Cookies from "js-cookie";

interface DashboardStats {
    totalCourses: number;
    publishedCourses: number;
    totalBatches: number;
    totalStudents: number;
    totalTutors: number;
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
    totalRevenue?: number;
    pendingInvoices?: number;
    paidInvoices?: number;
    totalExpenses?: number;
}

export default function FinanceManagerDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        fetchDashboardStats();
        const storedCompanyName =
            Cookies.get("company_name") || "Your Institution";
        setCompanyName(storedCompanyName);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const statsRes = await api.get("/ems/dashboard/stats");
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = stats
        ? [
              {
                  label: "Total Revenue",
                  value: stats.totalRevenue
                      ? `₹${Number(stats.totalRevenue).toLocaleString()}`
                      : "—",
                  icon: Wallet,
                  color: "blue",
                  href: "/ems/dynamic-role/finance-manager/reports",
                  bgColor: "bg-blue-100",
                  textColor: "text-blue-600",
              },
              {
                  label: "Active Enrollments",
                  value:
                      stats.totalEnrollments?.toString() ||
                      stats.totalStudents?.toString() ||
                      "0",
                  icon: Users,
                  color: "green",
                  href: "/ems/dynamic-role/finance-manager/payments",
                  bgColor: "bg-green-100",
                  textColor: "text-green-600",
              },
              {
                  label: "Total Expenses",
                  value: stats.totalExpenses
                      ? `₹${Number(stats.totalExpenses).toLocaleString()}`
                      : "—",
                  icon: TrendingDown,
                  color: "red",
                  href: "/ems/dynamic-role/finance-manager/expenses",
                  bgColor: "bg-red-100",
                  textColor: "text-red-600",
              },
              {
                  label: "Pending Invoices",
                  value: stats.pendingInvoices?.toString() || "—",
                  icon: FileText,
                  color: "orange",
                  href: "/ems/dynamic-role/finance-manager/fees",
                  bgColor: "bg-orange-100",
                  textColor: "text-orange-600",
              },
          ]
        : [];

    const actionColorMap: Record<string, { bg: string; text: string }> = {
        blue: { bg: "bg-blue-100", text: "text-blue-600" },
        green: { bg: "bg-green-100", text: "text-green-600" },
        purple: { bg: "bg-purple-100", text: "text-purple-600" },
        orange: { bg: "bg-orange-100", text: "text-orange-600" },
        red: { bg: "bg-red-100", text: "text-red-600" },
    };

    const quickActions = [
        {
            label: "Create Invoice",
            icon: FileText,
            href: "/ems/dynamic-role/finance-manager/invoices",
            color: "blue",
        },
        {
            label: "Record Payment",
            icon: CreditCard,
            href: "/ems/dynamic-role/finance-manager/payments",
            color: "green",
        },
        {
            label: "Generate Report",
            icon: BarChart3,
            href: "/ems/dynamic-role/finance-manager/reports",
            color: "purple",
        },
        {
            label: "Manage Fees",
            icon: Wallet,
            href: "/ems/dynamic-role/finance-manager/fees",
            color: "orange",
        },
    ];

    const recentTransactions = [
        {
            id: 1,
            student: "Rajesh Kumar",
            course: "Full Stack Web Development",
            amount: "₹15,000",
            status: "Paid",
            date: "2026-06-05",
        },
        {
            id: 2,
            student: "Priya Sharma",
            course: "Data Science & AI",
            amount: "₹25,000",
            status: "Pending",
            date: "2026-06-04",
        },
        {
            id: 3,
            student: "Amit Patel",
            course: "UI/UX Design",
            amount: "₹10,000",
            status: "Overdue",
            date: "2026-06-01",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <FinanceManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Company Context Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">
                                    {companyName} - Finance Management
                                </p>
                                <p className="text-xs text-blue-700">
                                    Financial overview and fee management
                                    dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Welcome Back, Finance Manager!
                        </h1>
                        <p className="text-gray-600">
                            Manage your institution's financial ecosystem
                        </p>
                    </div>

                    {/* Stats Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">
                                Loading financial statistics...
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

                    {/* Revenue & Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Invoice Management */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Invoice Management
                                </h2>
                                <Link href="/ems/dynamic-role/finance-manager/invoices">
                                    <Button variant="ghost" size="sm">
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-8 text-center">
                                    <FileText className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2 font-medium">
                                        {stats?.pendingInvoices || 0} Pending
                                        Invoices
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Manage student fee invoices
                                    </p>
                                    <Link href="/ems/dynamic-role/finance-manager/invoices">
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create New Invoice
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financial Overview */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Financial Overview
                                </h2>
                                <Link href="/ems/dynamic-role/finance-manager/reports">
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
                                            <Wallet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-blue-900">
                                                {stats?.totalEnrollments || 0}
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Paid Enrollments
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-900">
                                                {stats?.totalStudents || 0}
                                            </p>
                                            <p className="text-xs text-green-700">
                                                Total Students
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/ems/dynamic-role/finance-manager/reports"
                                        className="block mt-4"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            View Full Financial Report
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Transactions Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Recent Transactions
                            </h2>
                            <Link href="/ems/dynamic-role/finance-manager/payments">
                                <Button
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    View All Payments
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
                                                    Amount
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
                                            {recentTransactions.map((txn) => (
                                                <tr
                                                    key={txn.id}
                                                    className="hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-900">
                                                            {txn.student}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-700 line-clamp-1">
                                                            {txn.course}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-900">
                                                            {txn.amount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {txn.status ===
                                                        "Paid" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                                                                <CheckCircle className="h-3 w-3" />{" "}
                                                                Paid
                                                            </span>
                                                        ) : txn.status ===
                                                          "Pending" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold uppercase">
                                                                <Clock className="h-3 w-3" />{" "}
                                                                Pending
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">
                                                                <XCircle className="h-3 w-3" />{" "}
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {txn.date}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fee Collection Summary */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Fee Collection Summary
                            </h2>
                            <Link href="/ems/dynamic-role/finance-manager/fees">
                                <Button variant="ghost" size="sm">
                                    Manage All
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8 text-center">
                                <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2 font-medium">
                                    {stats?.totalStudents || 0} Students
                                    Enrolled
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Track and manage fee collections across all
                                    courses
                                </p>
                                <Link href="/ems/dynamic-role/finance-manager/fees">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        View Fee Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </FinanceManagerLayout>
        </div>
    );
}
