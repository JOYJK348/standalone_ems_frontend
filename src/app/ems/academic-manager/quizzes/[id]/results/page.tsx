"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Search,
    Trophy,
    Users,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface Quiz {
    id: number;
    quiz_title: string;
    total_marks: number;
}

interface StudentResult {
    id: number;
    student_id: number;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    is_passed: boolean;
    completed_at: string;
    students: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
}

export default function QuizResultsPage() {
    const params = useParams();
    const id = params.id as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [results, setResults] = useState<StudentResult[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [quizRes, resultsRes] = await Promise.all([
                api.get(`/ems/quizzes/${id}`),
                api.get(`/ems/quizzes/${id}/results`),
            ]);
            if (quizRes.data.success) {
                setQuiz(quizRes.data.data);
            }
            if (resultsRes.data.success) {
                setResults(resultsRes.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r =>
        `${r.students.first_name} ${r.students.last_name} ${r.students.student_code}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const average = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0;
    const passed = results.filter(r => r.is_passed).length;
    const total = results.length;

    if (loading) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24">
                    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                </div>
            </AcademicManagerLayout>
        );
    }

    return (
        <AcademicManagerLayout>
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/ems/academic-manager/quizzes"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Performances</h1>
                            {quiz && (
                                <p className="text-sm text-gray-500">{quiz.quiz_title}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-purple-50">
                                        <Target className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Average Score</p>
                                        <p className="text-2xl font-bold text-gray-900">{average}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-green-50">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Pass Count</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {passed} / {total}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-blue-50">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Attempts</p>
                                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or code..."
                                    className="pl-10 h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {filteredResults.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No attempts found matching your search.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Student</th>
                                                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Code</th>
                                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Score</th>
                                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Percentage</th>
                                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                                                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Attempt Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResults.map(r => (
                                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3 px-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600">
                                                                {r.students.first_name[0]}{r.students.last_name[0]}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {r.students.first_name} {r.students.last_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 text-sm text-gray-500">{r.students.student_code}</td>
                                                    <td className="py-3 px-2 text-center text-sm font-medium text-gray-900">
                                                        {r.marks_obtained} / {r.total_marks}
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={`text-sm font-semibold ${
                                                            r.percentage >= 75 ? "text-green-600" :
                                                            r.percentage >= 50 ? "text-amber-600" :
                                                            "text-red-600"
                                                        }`}>
                                                            {r.percentage}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <Badge variant={r.is_passed ? "default" : "destructive"}>
                                                            {r.is_passed ? "PASS" : "FAIL"}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-2 text-sm text-gray-500">
                                                        {new Date(r.completed_at).toLocaleDateString("en-US", {
                                                            year: "numeric", month: "short", day: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })}
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
            </div>
        </AcademicManagerLayout>
    );
}
