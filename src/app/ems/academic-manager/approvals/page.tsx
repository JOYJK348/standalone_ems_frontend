"use client";

import React, { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Filter,
    Search,
    MoreVertical,
    Check,
    X,
    FileText,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Layout,
    Users,
    Video,
    CalendarCheck,
    ArrowLeft,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import Link from "next/link";

const ApprovalsPage = () => {
    const [loading, setLoading] = useState(true);
    const [pendingData, setPendingData] = useState<any>({
        courses: [],
        lessons: [],
        materials: [],
        assignments: [],
        quizzes: [],
        batches: [],
        live_classes: [],
        attendance_sessions: []
    });
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [rejectModal, setRejectModal] = useState<{ open: boolean, type: string, id: number, reason: string }>({
        open: false,
        type: "",
        id: 0,
        reason: ""
    });

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const fetchPendingItems = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ems/approvals");
            setPendingData(res.data.data);
        } catch (error) {
            console.error("Failed to fetch pending items", error);
            toast.error("Failed to load approval requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type: string, id: number, action: "APPROVE" | "REJECT", reason?: string) => {
        try {
            await api.post("/ems/approvals", { type, id, action, reason });
            toast.success(`Item ${action.toLowerCase()}d successfully`);
            fetchPendingItems();
            if (action === "REJECT") setRejectModal({ ...rejectModal, open: false, reason: "" });
        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} item`);
        }
    };

    const getAllItems = () => {
        const items = [
            ...pendingData.courses.map((i: any) => ({ ...i, type: 'course', displayType: 'Course', icon: BookOpen })),
            ...pendingData.lessons.map((i: any) => ({ ...i, type: 'lesson', displayType: 'Lesson', icon: Layout })),
            ...pendingData.materials.map((i: any) => ({ ...i, type: 'material', displayType: 'Material', icon: FileText })),
            ...pendingData.assignments.map((i: any) => ({ ...i, type: 'assignment', displayType: 'Assignment', icon: ClipboardList })),
            ...pendingData.quizzes.map((i: any) => ({ ...i, type: 'quiz', displayType: 'Quiz', icon: GraduationCap })),
            ...pendingData.batches.map((i: any) => ({ ...i, type: 'batch', displayType: 'Batch', icon: Users })),
            ...pendingData.live_classes.map((i: any) => ({ ...i, type: 'live_class', displayType: 'Live Class', icon: Video })),
            ...pendingData.attendance_sessions.map((i: any) => ({ ...i, type: 'attendance_session', displayType: 'Attendance', icon: CalendarCheck }))
        ];

        return items.filter(item => {
            const matchesSearch = (item.course_name || item.lesson_name || item.material_name || item.assignment_title || item.quiz_title || item.batch_name || item.topic)
                ?.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeTab === "all") return matchesSearch;
            return item.type === activeTab && matchesSearch;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    };

    const items = getAllItems();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/ems/academic-manager/dashboard">
                        <Button variant="ghost" size="sm" className="mb-4 hover:bg-purple-50">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Content Review Center
                                </h1>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchPendingItems}
                                    disabled={loading}
                                    className="h-8 text-xs bg-white/50 border-purple-200 text-purple-700 hover:bg-purple-50"
                                >
                                    {loading ? (
                                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                    ) : (
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                            <p className="text-gray-600">Review and approve content submitted by tutors</p>
                        </div>

                        <motion.div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-500/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Clock className="h-5 w-5" />
                            <div className="flex flex-col">
                                <span className="font-black text-2xl">{items.length}</span>
                                <span className="text-xs font-medium uppercase tracking-wider opacity-90">Pending</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by title or course..."
                                className="pl-11 rounded-xl border-gray-200 focus:ring-purple-500 h-11 bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 gap-1 min-w-max">
                            {[
                                { value: "all", label: "All" },
                                { value: "course", label: "Courses" },
                                { value: "lesson", label: "Lessons" },
                                { value: "batch", label: "Batches" },
                                { value: "live_class", label: "Live Classes" },
                                { value: "attendance_session", label: "Attendance" },
                                { value: "material", label: "Materials" },
                                { value: "assignment", label: "Assignments" },
                                { value: "quiz", label: "Quizzes" }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === tab.value
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                                            : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center">Loading Review Queue...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-20 sm:p-32 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-50 to-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-12 w-12 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-tight">
                                    Everything Cleared!
                                </h3>
                                <p className="text-gray-500 mt-2 font-medium max-w-xs">
                                    There are no pending items that require your review at this moment.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                                        <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-6 px-6">Content Info</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Context</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Submission Date</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {items.map((item) => (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    key={`${item.type}-${item.id}`}
                                                    className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all border-b border-gray-50 last:border-0"
                                                >
                                                    <TableCell className="py-5 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${item.type === 'course' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                                                                    item.type === 'lesson' ? 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600' :
                                                                        item.type === 'batch' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600' :
                                                                            item.type === 'live_class' ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600' :
                                                                                item.type === 'attendance_session' ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600' :
                                                                                    item.type === 'material' ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600' :
                                                                                        'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600'
                                                                }`}>
                                                                <item.icon className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <Badge variant="outline" className="mb-1.5 rounded-lg bg-white font-bold text-[9px] uppercase tracking-wide border-gray-200">
                                                                    {item.displayType}
                                                                </Badge>
                                                                <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors capitalize line-clamp-1">
                                                                    {item.course_name || item.lesson_name || item.material_name || item.assignment_title || item.quiz_title || item.batch_name || item.topic || `Session ${item.id}`}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">
                                                                {item.course?.course_name || 'Main Content'}
                                                            </span>
                                                            {item.batch_name && (
                                                                <span className="text-[10px] text-gray-400 font-medium">Batch: {item.batch_name}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs font-semibold text-gray-600">
                                                            {new Date(item.created_at).toLocaleDateString(undefined, {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-medium">
                                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAction(item.type, item.id, "APPROVE")}
                                                                className="rounded-xl h-9 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setRejectModal({ open: true, type: item.type, id: item.id, reason: "" })}
                                                                className="rounded-xl h-9 px-4 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all"
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reject Modal */}
            <Dialog
                open={rejectModal.open}
                onOpenChange={(open) => !open && setRejectModal({ ...rejectModal, open: false })}
            >
                <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-rose-600" />
                            </div>
                            Content Rejection
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium mt-2">
                            Please provide a brief explanation for rejecting this content. This feedback will be sent to the tutor.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection (e.g., Update content hierarchy, Check video quality...)"
                            className="rounded-2xl border-gray-200 bg-gray-50/50 focus:ring-rose-500 min-h-[120px] font-medium"
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            className="rounded-2xl font-bold uppercase text-xs tracking-wider text-gray-500 hover:bg-gray-100"
                            onClick={() => setRejectModal({ ...rejectModal, open: false })}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold uppercase text-xs tracking-wider px-8 shadow-lg shadow-rose-500/30"
                            disabled={!rejectModal.reason.trim()}
                            onClick={() => handleAction(rejectModal.type, rejectModal.id, "REJECT", rejectModal.reason)}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            </AcademicManagerLayout>
        </div>
    );
};

export default ApprovalsPage;

