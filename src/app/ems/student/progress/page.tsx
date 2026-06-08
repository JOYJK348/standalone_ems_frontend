"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Award,
    BookOpen,
    CheckCircle2,
    Target,
    BarChart3,
    ChevronLeft,
    Clock,
} from "lucide-react";
import Link from "next/link";

export default function ProgressPage() {
    const overallProgress = 68;
    const moduleProgress = [
        { name: "Introduction", progress: 100, completed: true },
        { name: "Fundamentals", progress: 85, completed: false },
        { name: "Advanced Topics", progress: 45, completed: false },
        { name: "Projects", progress: 20, completed: false },
    ];

    const assessmentScores = [
        { name: "Module 1 Assessment", score: 85, maxScore: 100 },
        { name: "Module 2 Assessment", score: 92, maxScore: 100 },
        { name: "Final Assessment", score: 0, maxScore: 100, pending: true },
    ];

    const averageScore = assessmentScores
        .filter((a) => !a.pending)
        .reduce((acc, a) => acc + (a.score / a.maxScore) * 100, 0) /
        assessmentScores.filter((a) => !a.pending).length || 0;

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
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Progress Tracking</h1>
                    <p className="text-gray-600">Monitor your learning journey and achievements</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Overall Progress", value: `${overallProgress}%`, icon: Target, color: "blue" },
                        { label: "Modules Done", value: `${moduleProgress.filter(m => m.completed).length}/${moduleProgress.length}`, icon: CheckCircle2, color: "green" },
                        { label: "Average Score", value: `${Math.round(averageScore)}%`, icon: Award, color: "purple" },
                        { label: "Assessments", value: assessmentScores.filter(a => !a.pending).length, icon: BarChart3, color: "orange" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                            <p className="text-3xl font-bold">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                                            <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2">
                        <Card className="border-0 shadow-xl h-full">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                    Learning Journey
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                                    <div className="relative w-48 h-48">
                                        <svg className="transform -rotate-90 w-48 h-48">
                                            <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-100" />
                                            <motion.circle
                                                cx="96"
                                                cy="96"
                                                r="84"
                                                stroke="#2563eb"
                                                strokeWidth="10"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 84}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 84 * (1 - overallProgress / 100) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl font-bold text-blue-600 mb-1">{overallProgress}%</div>
                                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Complete</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="space-y-4">
                                            {moduleProgress.map((module, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium text-gray-700">{module.name}</span>
                                                        <span className="text-blue-600 font-bold">{module.progress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${module.progress}%` }}
                                                            className={`h-full ${module.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Card className="border-0 shadow-xl h-full">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Award className="h-6 w-6 text-purple-600" />
                                    Recent Scores
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {assessmentScores.map((score, i) => (
                                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-900 leading-tight">{score.name}</span>
                                                {!score.pending && (
                                                    <span className="text-lg font-bold text-purple-600">{score.score}%</span>
                                                )}
                                            </div>
                                            {score.pending ? (
                                                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Upcoming
                                                </span>
                                            ) : (
                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                                                    <div
                                                        className="h-full bg-purple-600"
                                                        style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                                    View Full Report
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
