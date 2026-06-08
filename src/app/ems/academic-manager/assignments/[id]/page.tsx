"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Users,
    Calendar,
    Clock,
    ArrowLeft,
    GraduationCap,
    Download,
    Eye,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface StudentSubmission {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
    email: string;
    status: "SUBMITTED" | "NOT_SUBMITTED" | "GRADED";
    submission?: {
        id: number;
        submitted_at: string;
        submission_url?: string;
        submission_text?: string;
        marks_obtained?: number;
        attachment_name?: string;
    };
}

export default function AssignmentDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [assignment, setAssignment] = useState<any>(null);
    const [students, setStudents] = useState<StudentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(
                `/ems/assignments/${id}/submissions`,
            );
            if (response.data.success) {
                setAssignment(response.data.data.assignment);
                setStudents(response.data.data.students || []);
            }
        } catch (error: any) {
            console.error("Error fetching assignment details:", error);
            const msg =
                error.response?.data?.error?.message ||
                "Failed to load assignment details";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            </AcademicManagerLayout>
        );
    }

    if (!assignment) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Assignment Not Found
                    </h1>
                    <Link
                        href="/ems/academic-manager/assignments"
                        className="mt-4 text-purple-600 hover:underline"
                    >
                        Back to Assignments
                    </Link>
                </div>
            </AcademicManagerLayout>
        );
    }

    const submissionCount = students.filter(
        (s) => s.status !== "NOT_SUBMITTED",
    ).length;

    return (
        <AcademicManagerLayout>
            <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                    <Link
                        href="/ems/academic-manager/assignments"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 mb-4 group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Assignments
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {assignment.courses?.course_code && (
                                    <Badge
                                        variant="outline"
                                        className="text-purple-600 border-purple-200 bg-purple-50"
                                    >
                                        {assignment.courses.course_code}
                                    </Badge>
                                )}
                                {assignment.courses?.course_name && (
                                    <Badge
                                        variant="outline"
                                        className="text-blue-600 border-blue-200 bg-blue-50"
                                    >
                                        {assignment.courses.course_name}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {assignment.assignment_title}
                            </h1>
                            <p className="text-gray-500 mt-2 max-w-2xl">
                                {assignment.assignment_description}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                Deadline:{" "}
                                {new Date(
                                    assignment.deadline,
                                ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-purple-500" />
                                {submissionCount} / {students.length} Submitted
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-500" />
                            Assigned Students ({students.length})
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="relative group"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ring-2 ring-offset-2 ${
                                            student.status !== "NOT_SUBMITTED"
                                                ? "bg-emerald-50 text-emerald-600 ring-emerald-400"
                                                : "bg-gray-50 text-gray-400 ring-gray-100 hover:ring-purple-300"
                                        }`}
                                    >
                                        {student.first_name[0]}
                                        {student.last_name[0]}
                                    </div>
                                    <div
                                        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                            student.status !== "NOT_SUBMITTED"
                                                ? "bg-emerald-500"
                                                : "bg-gray-300"
                                        }`}
                                    />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {student.first_name} {student.last_name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="border-0 shadow-md overflow-hidden">
                        <div className="bg-white border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                                Student Submissions
                            </h2>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                Student
                                            </th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                Submitted On
                                            </th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                Score
                                            </th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 text-right">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {students.map((student, idx) => (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-purple-50/30 transition-all duration-200"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                                                            {
                                                                student
                                                                    .first_name[0]
                                                            }
                                                            {
                                                                student
                                                                    .last_name[0]
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    student.first_name
                                                                }{" "}
                                                                {
                                                                    student.last_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {
                                                                    student.student_code
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.status ===
                                                        "SUBMITTED" ||
                                                    student.status ===
                                                        "GRADED" ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                                            {student.status}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-gray-400 border-gray-200"
                                                        >
                                                            Not submitted
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.submission ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {new Date(
                                                                    student
                                                                        .submission
                                                                        .submitted_at,
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    },
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(
                                                                    student
                                                                        .submission
                                                                        .submitted_at,
                                                                ).toLocaleTimeString(
                                                                    "en-US",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">
                                                            Not submitted yet
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.submission
                                                        ?.marks_obtained !==
                                                    undefined ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {
                                                                    student
                                                                        .submission
                                                                        .marks_obtained
                                                                }
                                                            </span>
                                                            <span className="text-gray-400">
                                                                /{" "}
                                                                {
                                                                    assignment.max_marks
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">
                                                            --
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {student.submission ? (
                                                        <div className="flex items-center gap-2 justify-end">
                                                            {student.submission
                                                                .submission_url && (
                                                                <Link
                                                                    href={
                                                                        student
                                                                            .submission
                                                                            .submission_url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 text-xs"
                                                                    >
                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                        View
                                                                        File
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                                                                onClick={() =>
                                                                    setSelectedSubmission(
                                                                        student.submission,
                                                                    )
                                                                }
                                                            >
                                                                <Download className="h-3 w-3 mr-1" />
                                                                View Answer
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled
                                                            className="h-8 text-xs opacity-30"
                                                        >
                                                            No submission
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedSubmission && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setSelectedSubmission(null)}
                        >
                            <div
                                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">
                                        Submission Details
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setSelectedSubmission(null)
                                        }
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                </div>
                                {selectedSubmission.submission_url && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Attached File
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">
                                                {selectedSubmission.attachment_name ||
                                                    "Attachment"}
                                            </span>
                                            <Link
                                                href={
                                                    selectedSubmission.submission_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {selectedSubmission.submission_url?.match(
                                    /\.(pdf|jpg|jpeg|png|gif)$/i,
                                ) && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            {selectedSubmission.submission_url.match(
                                                /\.pdf$/i,
                                            )
                                                ? "PDF Preview"
                                                : "Document Preview"}
                                        </p>
                                        <iframe
                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedSubmission.submission_url)}&embedded=true`}
                                            className="w-full h-96 rounded-xl border border-gray-200"
                                        />
                                    </div>
                                )}
                                {selectedSubmission.submission_text && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Student Answer
                                        </p>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                                            {selectedSubmission.submission_text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AcademicManagerLayout>
    );
}
