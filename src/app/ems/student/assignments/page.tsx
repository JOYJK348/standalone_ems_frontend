"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    FileText,
    Clock,
    CheckCircle2,
    Upload,
    Search,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Award,
    TrendingUp,
    Calendar,
    Filter,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AssignmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/students/my-assignments");
            if (response.data.success) {
                setAssignments(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.assignment_title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || a.status === filter;
        return matchesSearch && matchesFilter;
    });

    // Calculate stats
    const stats = {
        total: assignments.length,
        pending: assignments.filter(a => a.status === "pending").length,
        submitted: assignments.filter(a => a.status === "submitted").length,
        graded: assignments.filter(a => a.status === "graded").length,
        avgScore: assignments.filter(a => a.status === "graded" && a.score !== null).length > 0
            ? Math.round(
                assignments
                    .filter(a => a.status === "graded" && a.score !== null)
                    .reduce((sum, a) => sum + a.score, 0) /
                assignments.filter(a => a.status === "graded" && a.score !== null).length
            )
            : 0
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    bg: "bg-orange-50",
                    text: "text-orange-700",
                    border: "border-orange-200",
                    icon: Clock,
                    iconBg: "bg-orange-100"
                };
            case "submitted":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    icon: Upload,
                    iconBg: "bg-blue-100"
                };
            case "graded":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    icon: CheckCircle2,
                    iconBg: "bg-green-100"
                };
            default:
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    icon: FileText,
                    iconBg: "bg-gray-100"
                };
        }
    };

    const getDaysUntilDue = (deadline: string) => {
        const now = new Date();
        const due = new Date(deadline);
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading assignments...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
                    <p className="text-gray-600">Track and submit your course assignments</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pending</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.pending}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Graded</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.graded}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                        <Award className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-600">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-1">Avg Score</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-white">{stats.avgScore}%</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Search and Filter */}
                <Card className="border-0 shadow-md mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search assignments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 border-gray-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {(["all", "pending", "submitted", "graded"] as const).map((f) => (
                                    <Button
                                        key={f}
                                        variant={filter === f ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilter(f)}
                                        className={`whitespace-nowrap ${filter === f
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignments List */}
                <div className="space-y-3">
                    {filteredAssignments.length === 0 ? (
                        <Card className="border-2 border-dashed border-gray-200">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Assignments Found</h3>
                                <p className="text-gray-600">
                                    {searchQuery
                                        ? "Try a different search term"
                                        : filter !== "all"
                                            ? `You have no ${filter} assignments`
                                            : "You have no assignments at this time"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredAssignments.map((assignment, index) => {
                            const statusConfig = getStatusConfig(assignment.status);
                            const StatusIcon = statusConfig.icon;
                            const daysUntilDue = getDaysUntilDue(assignment.deadline);
                            const isOverdue = daysUntilDue < 0 && assignment.status === "pending";

                            return (
                                <motion.div
                                    key={assignment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {/* Icon */}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.iconBg}`}>
                                                    <StatusIcon className={`h-6 w-6 ${statusConfig.text}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                                                        {assignment.assignment_title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                                        {assignment.course?.course_name || "Course"}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                                        {/* Due Date */}
                                                        <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="font-medium">
                                                                Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                            </span>
                                                            {assignment.status === "pending" && (
                                                                <span className={`ml-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                                                                    ({isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`})
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Score */}
                                                        {assignment.status === "graded" && assignment.score !== null && (
                                                            <div className="flex items-center gap-1 text-green-600 font-bold">
                                                                <Award className="h-3 w-3" />
                                                                <span>Score: {assignment.score}%</span>
                                                            </div>
                                                        )}

                                                        {/* Submission Mode */}
                                                        <span
                                                            className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${assignment.submission_mode === "ONLINE"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-amber-100 text-amber-700"
                                                                }`}
                                                        >
                                                            {assignment.submission_mode}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                                                    {/* Status Badge */}
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                                    >
                                                        {assignment.status}
                                                    </span>

                                                    {/* Action Button */}
                                                    {assignment.status === "pending" ? (
                                                        assignment.submission_mode === "ONLINE" ? (
                                                            <Link href={`/ems/student/assignments/${assignment.id}`}>
                                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                                                                    <Upload className="h-4 w-4 mr-2" />
                                                                    Submit
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 text-center">
                                                                PHYSICAL<br />SUBMISSION
                                                            </div>
                                                        )
                                                    ) : (
                                                        <Link href={`/ems/student/assignments/${assignment.id}`}>
                                                            <Button size="sm" variant="outline" className="whitespace-nowrap">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Overdue Warning */}
                                            {isOverdue && (
                                                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                    <p className="text-xs text-red-700 font-medium">
                                                        This assignment is overdue. Submit as soon as possible!
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
