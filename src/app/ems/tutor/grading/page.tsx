"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CheckSquare,
    Search,
    Clock,
    User,
    FileText,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Submission {
    id: number;
    assignment_id: number;
    student_id: number;
    submitted_at: string;
    submission_status: string;
    submission_file_url: string;
    submission_text: string;
    students: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
    assignments: {
        assignment_title: string;
        courses: {
            course_name: string;
        };
    };
}

export default function TutorGradingPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("SUBMITTED");

    useEffect(() => {
        fetchSubmissions();
    }, [statusFilter]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/tutor/submissions?status=${statusFilter}`);
            if (response.data.success) {
                setSubmissions(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching submissions:", error);
            toast.error(error.response?.data?.message || "Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter((s) =>
        `${s.students.first_name} ${s.students.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assignments.assignment_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Grading Hub
                    </h1>
                    <p className="text-gray-600 mt-1">Evaluate student submissions and provide feedback</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <Card className="flex-1 border-0 shadow-md">
                        <CardContent className="p-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search by student or assignment..."
                                    className="pl-10 border-0 focus-visible:ring-0 shadow-none h-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-2">
                        {["SUBMITTED", "GRADED"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                className={statusFilter === status ? "bg-blue-600" : ""}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Submissions List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500">Loading submissions...</p>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <Card className="border-0 shadow-lg p-12 text-center">
                        <CheckSquare className="h-16 w-16 text-green-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Submissions Found</h3>
                        <p className="text-gray-600">Great job! You've graded everything for now.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredSubmissions.map((submission, index) => (
                                <motion.div
                                    key={submission.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden border-l-4 border-l-blue-500">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                                {/* Student Info */}
                                                <div className="flex items-center gap-4 min-w-[200px]">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {submission.students.first_name.charAt(0)}
                                                        {submission.students.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">
                                                            {submission.students.first_name} {submission.students.last_name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">{submission.students.student_code}</p>
                                                    </div>
                                                </div>

                                                {/* Assignment Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {submission.assignments.assignment_title}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-blue-600 font-medium ml-6">
                                                        {submission.assignments.courses.course_name}
                                                    </p>
                                                </div>

                                                {/* Date & Status */}
                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3" />
                                                        <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${submission.submission_status === 'SUBMITTED'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {submission.submission_status}
                                                    </span>
                                                </div>

                                                {/* Action */}
                                                <div className="md:ml-4">
                                                    <Link href={`/ems/tutor/grading/${submission.id}`}>
                                                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                                            {statusFilter === 'SUBMITTED' ? 'Evaluate' : 'View Grade'}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
