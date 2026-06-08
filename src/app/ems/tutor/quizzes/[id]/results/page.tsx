"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Search,
    Loader2,
    Users,
    Trophy,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface Attempt {
    id: number;
    student_id: number;
    quiz_id: number;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    is_passed: boolean;
    completed_at: string;
    students: {
        first_name: string;
        last_name: string;
        student_code: string;
        email: string;
    };
}

interface Quiz {
    id: number;
    quiz_title: string;
    total_marks: number;
    passing_marks: number;
}

export default function QuizResultsPage() {
    const { id } = useParams();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [quizRes, attemptsRes] = await Promise.all([
                api.get(`/ems/quizzes/${id}`),
                api.get(`/ems/quizzes/${id}/attempts`)
            ]);

            if (quizRes.data.success) setQuiz(quizRes.data.data);
            if (attemptsRes.data.success) setAttempts(attemptsRes.data.data || []);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    const filteredAttempts = attempts.filter(a =>
        `${a.students.first_name} ${a.students.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.students.student_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: attempts.length,
        passed: attempts.filter(a => a.is_passed).length,
        average: attempts.length > 0 ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length).toFixed(1) : 0
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link href="/ems/tutor/quizzes">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Quizzes
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {quiz?.quiz_title} - Results
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-0 shadow-md bg-blue-50">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Attempts</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-green-50">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 font-medium">Pass Count</p>
                                <p className="text-2xl font-bold">{stats.passed}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-purple-50">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Average Score</p>
                                <p className="text-2xl font-bold">{stats.average}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Student Performances</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                                <p className="text-gray-500">Loading student results...</p>
                            </div>
                        ) : filteredAttempts.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No attempts found matching your search.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Student</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Attempt Date</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Score</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Percentage</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredAttempts.map((attempt) => (
                                            <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {attempt.students.first_name} {attempt.students.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{attempt.students.student_code}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(attempt.completed_at), 'PPP p')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">
                                                        {attempt.marks_obtained}
                                                    </span>
                                                    <span className="text-gray-400 text-sm"> / {attempt.total_marks}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[100px] overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${attempt.is_passed ? 'bg-green-500' : 'bg-red-500'}`}
                                                                style={{ width: `${attempt.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium">{attempt.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {attempt.is_passed ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                            <CheckCircle2 className="h-3 w-3" /> PASS
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                            <XCircle className="h-3 w-3" /> FAIL
                                                        </span>
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
            </div>

            <TutorBottomNav />
        </div>
    );
}
