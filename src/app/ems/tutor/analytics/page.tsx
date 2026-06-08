"use client";

import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    Star,
    Award,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TutorAnalyticsPage() {
    const stats = [
        { label: "Course Rating", value: "4.8/5", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
        { label: "Student Passing Rate", value: "94%", icon: Award, color: "text-green-500", bg: "bg-green-50" },
        { label: "Avg. Assignment Marks", value: "82/100", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Active Students", value: "320+", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Performance Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Insights into your teaching impact and student progress</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Student Engagement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center bg-gray-50 rounded-b-lg border-t m-6 text-gray-400 italic">
                            Engagement chart visualization will appear here
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Grade Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center bg-gray-50 rounded-b-lg border-t m-6 text-gray-400 italic">
                            Grade spread visualization will appear here
                        </CardContent>
                    </Card>
                </div>
            </div>

            <TutorBottomNav />
        </div>
    );
}
