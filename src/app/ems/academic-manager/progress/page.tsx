"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    TrendingUp,
    Search,
    Users,
    BookOpen,
    CheckCircle,
    Clock,
    ArrowLeft,
    Target,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface StudentProgress {
    id: number;
    student_id: number;
    enrollment_id: number;
    course_id: number;
    completion_percentage: number;
    lessons_completed: number;
    total_lessons: number;
    last_accessed: string;
    students?: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
    courses?: {
        course_name: string;
    };
}

export default function ProgressPage() {
    const [progressData, setProgressData] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/progress");
            if (response.data.success) {
                setProgressData(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProgress = progressData.filter((progress) =>
        `${progress.students?.first_name} ${progress.students?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        progress.courses?.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProgressColor = (percentage: number) => {
        if (percentage >= 75) return "bg-green-600";
        if (percentage >= 50) return "bg-yellow-600";
        if (percentage >= 25) return "bg-orange-600";
        return "bg-red-600";
    };

    const getProgressStatus = (percentage: number) => {
        if (percentage === 100) return "Completed";
        if (percentage >= 75) return "Excellent";
        if (percentage >= 50) return "On Track";
        if (percentage >= 25) return "In Progress";
        return "Just Started";
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Student Progress
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Track student learning progress and completion
                        </p>
                    </div>
                </div>

                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search by student name or course..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading progress data...</p>
                    </div>
                ) : filteredProgress.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <TrendingUp className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Progress Data Yet
                            </h3>
                            <p className="text-gray-600">
                                Student progress will appear here once they start courses
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredProgress.map((progress) => (
                            <motion.div
                                key={progress.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg flex-shrink-0">
                                                {progress.students?.first_name.charAt(0)}{progress.students?.last_name?.charAt(0)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {progress.students?.first_name} {progress.students?.last_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {progress.students?.student_code}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${progress.completion_percentage === 100
                                                        ? 'bg-green-100 text-green-700'
                                                        : progress.completion_percentage >= 50
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {getProgressStatus(progress.completion_percentage)}
                                                    </span>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {progress.courses?.course_name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <Target className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {progress.completion_percentage}%
                                                        </p>
                                                        <p className="text-xs text-gray-600">Completion</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                                        <p className="text-2xl font-bold text-green-700">
                                                            {progress.lessons_completed}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Completed</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                        <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                                        <p className="text-2xl font-bold text-blue-700">
                                                            {progress.total_lessons}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Total</p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Progress</span>
                                                        <span className="font-semibold">
                                                            {progress.lessons_completed} / {progress.total_lessons} lessons
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className={`h-3 rounded-full transition-all ${getProgressColor(progress.completion_percentage)}`}
                                                            style={{ width: `${progress.completion_percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>
                                                        Last accessed: {new Date(progress.last_accessed).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            </AcademicManagerLayout>
        </div>
    );
}

