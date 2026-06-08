"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ClipboardCheck,
    ArrowLeft,
    Clock,
    Target,
    HelpCircle,
    CheckCircle2,
    Info,
    Edit3,
    Calendar,
    Users
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Option {
    id: number;
    option_text: string;
    is_correct: boolean;
    option_order: number;
}

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    marks: number;
    explanation: string;
    quiz_options: Option[];
}

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    total_marks: number;
    duration_minutes: number;
    passing_marks: number;
    max_attempts: number;
    start_datetime?: string;
    end_datetime?: string;
    created_at: string;
    courses?: {
        course_name: string;
        course_code: string;
    };
}

export default function TutorQuizViewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams?.get("id");

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (quizId) {
            fetchQuizData();
        }
    }, [quizId]);

    const fetchQuizData = async () => {
        try {
            setLoading(true);
            const [quizRes, questionsRes] = await Promise.all([
                api.get(`/ems/quizzes/${quizId}`),
                api.get(`/ems/quizzes/${quizId}/questions`)
            ]);

            if (quizRes.data.success) setQuiz(quizRes.data.data);
            if (questionsRes.data.success) setQuestions(questionsRes.data.data);
        } catch (error) {
            console.error("Error fetching quiz data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/ems/tutor/quizzes">
                            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-gray-600 hover:text-blue-600">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to All Quizzes
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">{quiz?.quiz_title}</h1>
                        <p className="text-gray-500 mt-1">{quiz?.courses?.course_name} ({quiz?.courses?.course_code})</p>
                        {quiz?.quiz_description && (
                            <p className="text-sm text-gray-600 mt-2">{quiz.quiz_description}</p>
                        )}
                    </div>
                    <Link href={`/ems/tutor/quizzes/builder?id=${quizId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Questions
                        </Button>
                    </Link>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: HelpCircle, label: "Questions", value: questions.length, color: "text-blue-600", bg: "bg-blue-50" },
                        { icon: Target, label: "Total Marks", value: quiz?.total_marks, color: "text-green-600", bg: "bg-green-50" },
                        { icon: Clock, label: "Duration", value: `${quiz?.duration_minutes}m`, color: "text-orange-600", bg: "bg-orange-50" },
                        { icon: ClipboardCheck, label: "Pass Mark", value: quiz?.passing_marks, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-0 shadow-sm overflow-hidden">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quiz Schedule Info */}
                <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Quiz Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Start Date/Time</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDateTime(quiz?.start_datetime)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">End Date/Time</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDateTime(quiz?.end_datetime)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Max Attempts</p>
                                <p className="text-sm font-semibold text-gray-900">{quiz?.max_attempts} {quiz?.max_attempts === 1 ? 'Attempt' : 'Attempts'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Preview */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-blue-600" />
                            Question Bank
                        </h2>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            Review Mode
                        </span>
                    </div>

                    {questions.length === 0 ? (
                        <Card className="border-dashed border-2 bg-gray-50/50">
                            <CardContent className="p-12 text-center">
                                <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400 mb-4">No questions added to this quiz yet.</p>
                                <Link href={`/ems/tutor/quizzes/builder?id=${quizId}`}>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Add Questions Now
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        questions.map((question, index) => (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                                    <CardContent className="p-0">
                                        {/* Question Header */}
                                        <div className="p-5 border-b border-gray-100 bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                                                    {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                                                {question.question_text}
                                            </h3>
                                        </div>

                                        {/* Options Grid */}
                                        <div className="p-5 bg-gray-50/30">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {question.quiz_options.map((option, optIdx) => (
                                                    <div
                                                        key={option.id}
                                                        className={`flex items-center p-4 rounded-xl border-2 transition-all ${option.is_correct
                                                            ? "border-green-500 bg-green-50/50"
                                                            : "border-gray-100 bg-white"
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 font-bold text-sm ${option.is_correct ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                                                            }`}>
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </div>
                                                        <span className={`flex-1 font-medium ${option.is_correct ? "text-green-900" : "text-gray-700"}`}>
                                                            {option.option_text}
                                                        </span>
                                                        {option.is_correct && (
                                                            <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Explanation Section */}
                                            {question.explanation && (
                                                <div className="mt-5 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
                                                    <div className="mt-1">
                                                        <Info className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Explanation</p>
                                                        <p className="text-sm text-blue-800 leading-relaxed italic">
                                                            "{question.explanation}"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}

                    {/* Footer Info */}
                    {questions.length > 0 && (
                        <div className="py-12 border-t border-gray-200 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                                <ClipboardCheck className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="text-gray-900 font-bold">End of Quiz Preview</h4>
                            <p className="text-sm text-gray-500 mt-2">To modify questions, click "Edit Questions" button above.</p>
                        </div>
                    )}
                </div>
            </div>

            <TutorBottomNav />
        </div>
    );
}
