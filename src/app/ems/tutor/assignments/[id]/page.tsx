"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Users,
    Calendar,
    Clock,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    GraduationCap,
    Download
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface StudentSubmission {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
    email: string;
    status: 'SUBMITTED' | 'NOT_SUBMITTED' | 'GRADED' | 'LATE';
    submission?: {
        id: number;
        submitted_at: string;
        submission_url?: string;
        submission_text?: string;
        marks_obtained?: number;
    };
}

export default function AssignmentDetailPage() {
    const params = useParams();
    const assignmentId = params.id;
    const [data, setData] = useState<{ assignment: any, students: StudentSubmission[] }>({
        assignment: null,
        students: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (assignmentId) {
            fetchAssignmentDetails();
        }
    }, [assignmentId]);

    const fetchAssignmentDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/assignments/${assignmentId}/submissions`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching assignment details:", error);
            const msg = error.response?.data?.error?.message || "Failed to load assignment details";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data.assignment) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Assignment Not Found</h1>
                <Link href="/ems/tutor/assignments" className="mt-4 text-blue-600 hover:underline">
                    Back to Assignments
                </Link>
            </div>
        );
    }

    const { assignment, students } = data;
    const submissionCount = students.filter(s => s.status !== 'NOT_SUBMITTED').length;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/ems/tutor/assignments" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 group">
                        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Assignments
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                    {assignment.courses?.course_code}
                                </Badge>
                                {assignment.batches && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                                        {assignment.batches.batch_name}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{assignment.assignment_title}</h1>
                            <p className="text-gray-600 mt-2 max-w-2xl">{assignment.assignment_description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-4 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-orange-500" /> Deadline: {format(new Date(assignment.deadline), "dd MMM yyyy")}</span>
                                <span className="flex items-center gap-1"><Users className="h-4 w-4 text-purple-500" /> {submissionCount} / {students.length} Submitted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Assigned Students Summary Quick Grid */}
                    <div className="lg:col-span-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
                        >
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[2px] mb-6 flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-500" />
                                Assigned Students ({students.length})
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {students.map((student) => (
                                    <div key={student.id} className="relative group">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ring-2 ring-offset-2 ${student.status !== 'NOT_SUBMITTED'
                                                ? 'bg-emerald-50 text-emerald-600 ring-emerald-400'
                                                : 'bg-gray-50 text-gray-400 ring-gray-100 hover:ring-indigo-300'
                                                }`}
                                        >
                                            {student.first_name[0]}{student.last_name[0]}
                                        </div>
                                        {/* Status Dot */}
                                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${student.status !== 'NOT_SUBMITTED' ? 'bg-emerald-500' : 'bg-gray-300'
                                            }`} />

                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {student.first_name} {student.last_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Left Column - Student List */}
                    <div className="lg:col-span-12">
                        <Card className="border-0 shadow-2xl overflow-hidden bg-white rounded-2xl">
                            <CardHeader className="bg-white border-b border-gray-100 px-6 py-5">
                                <CardTitle className="text-lg font-black text-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-indigo-500" />
                                        <span>Detailed Submissions Tracker</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 shadow-none px-3 py-1">
                                            {students.filter(s => s.status === 'SUBMITTED' || s.status === 'GRADED').length} Done
                                        </Badge>
                                        <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100 shadow-none px-3 py-1">
                                            {students.filter(s => s.status === 'NOT_SUBMITTED').length} Pending
                                        </Badge>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FBFBFF]">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Student Info</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Contact</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Submitted On</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Performance</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.map((student: any, idx) => (
                                                <motion.tr
                                                    key={student.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="hover:bg-indigo-50/20 transition-all duration-200 group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                                {student.first_name[0]}{student.last_name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{student.first_name} {student.last_name}</p>
                                                                <p className="text-[10px] text-gray-400 font-black uppercase">{student.student_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-0.5">
                                                            <p className="text-xs text-gray-600 truncate max-w-[150px]">{student.email}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold">{student.phone || 'No Phone'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.submission ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-gray-700">{format(new Date(student.submission.submitted_at), "dd MMM yyyy")}</span>
                                                                <span className="text-[10px] text-gray-400">{format(new Date(student.submission.submitted_at), "hh:mm a")}</span>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="text-gray-300 font-black text-[9px] uppercase tracking-tighter border-none">Waiting</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.status === 'NOT_SUBMITTED' ? (
                                                            <span className="px-2 py-1 bg-red-50 text-red-500 text-[9px] font-black uppercase rounded border border-red-100">Not Submitted</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded border border-emerald-100">Complete</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.submission?.marks_obtained !== undefined ? (
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg font-black text-gray-900">{student.submission.marks_obtained}</span>
                                                                <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-indigo-500 rounded-full"
                                                                        style={{ width: `${(student.submission.marks_obtained / assignment.max_marks) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-300 italic">Ungraded</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {student.submission ? (
                                                            <Link href={`/ems/tutor/grading/${student.submission.id}`}>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase shadow-lg shadow-indigo-100"
                                                                >
                                                                    Grade
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <Button size="sm" variant="ghost" disabled className="h-8 px-4 text-[10px] font-black uppercase opacity-20">Grade</Button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <TutorBottomNav />
        </div>
    );
}
