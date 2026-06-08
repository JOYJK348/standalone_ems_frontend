"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    ClipboardCheck,
    Clock,
    CheckCircle2,
    Search,
    TrendingUp,
    ChevronLeft,
    Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AssessmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "completed" | "upcoming">("all");
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/students/my-quizzes");
            if (response.data.success) {
                setAssessments(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssessments = assessments.filter(a => {
        const matchesSearch = a.quiz_title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || a.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "active": return "bg-blue-100 text-blue-700 border-blue-200";
            case "upcoming": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleStart = () => {
        toast.info("Assessment Started", {
            description: "Please use the detail view to start your quiz.",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Assessments</h1>
                    <p className="text-gray-600">Test your knowledge and track progress</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search assessments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {(["all", "active", "completed", "upcoming"] as const).map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={`whitespace-nowrap ${filter === f ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total</p>
                                    <p className="text-3xl font-bold">{assessments.length}</p>
                                </div>
                                <ClipboardCheck className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{assessments.filter(a => a.status === "completed").length}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Best Avg</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {assessments.filter(a => a.best_score !== null).length > 0
                                            ? `${Math.round(assessments.reduce((acc, a) => acc + (a.best_score || 0), 0) / (assessments.filter(a => a.best_score !== null).length || 1))}%`
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                            <p>Loading assessments...</p>
                        </div>
                    ) : filteredAssessments.length === 0 ? (
                        <Card className="border-0 shadow-lg p-12 text-center">
                            <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Assessments Found</h3>
                            <p className="text-gray-600">{searchQuery ? "Try a different search term" : "You have no assessments scheduled yet."}</p>
                        </Card>
                    ) : (
                        filteredAssessments.map((assessment, index) => (
                            <motion.div
                                key={assessment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${assessment.status === "completed" ? "bg-green-100" :
                                                    assessment.status === "active" ? "bg-blue-100" : "bg-orange-100"
                                                    }`}>
                                                    <ClipboardCheck className={`h-6 w-6 ${assessment.status === "completed" ? "text-green-600" :
                                                        assessment.status === "active" ? "text-blue-600" : "text-orange-600"
                                                        }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{assessment.quiz_title}</h3>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {assessment.duration_minutes} min
                                                        </span>
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">{assessment.quiz_type}</span>
                                                        <span>{assessment.course_name}</span>
                                                        {assessment.end_datetime && (
                                                            <span>Due: {new Date(assessment.end_datetime).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                    {assessment.best_score !== null && (
                                                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                            Best Score: {assessment.best_score}%
                                                            {assessment.is_passed && <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded text-green-700">PASSED</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assessment.status)}`}>
                                                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                                                </span>
                                                <Link href={`/ems/student/assessments/${assessment.id}`}>
                                                    <Button
                                                        size="sm"
                                                        disabled={assessment.status === "upcoming"}
                                                        className={assessment.status === "active" ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                        variant={assessment.status === "active" ? "default" : "outline"}
                                                    >
                                                        {assessment.status === "completed" ? "View Results" :
                                                            assessment.status === "active" ? "Start Assessment" : "Not Available"}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
