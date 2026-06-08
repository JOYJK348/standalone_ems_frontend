"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    Search,
    Mail,
    Phone,
    BookOpen,
    Loader2,
    TrendingUp,
    Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Student {
    id: number;
    student_id: number;
    course_id: number;
    lessons_completed: number;
    total_lessons: number;
    completion_percentage: number;
    students: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        student_code: string;
    };
    courses: {
        course_name: string;
        course_code: string;
    };
}

export default function TutorStudentsPage() {
    const [enrollments, setEnrollments] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/tutor/students");
            if (response.data.success) {
                setEnrollments(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching students:", error);
            toast.error(error.response?.data?.message || "Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = enrollments.filter((enrollment) =>
        `${enrollment.students.first_name} ${enrollment.students.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.students.student_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            My Students
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Track progress of students in your courses
                        </p>
                    </div>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search by name or student code..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading students...</span>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Users className="h-20 w-20 text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Students Found
                            </h3>
                            <p className="text-gray-600">
                                When students enroll in your courses, they will appear here
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((enrollment, index) => (
                            <motion.div
                                key={enrollment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {enrollment.students.first_name.charAt(0)}
                                                {enrollment.students.last_name.charAt(0)}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 font-medium">Code</p>
                                                <p className="text-sm font-bold text-gray-900">{enrollment.students.student_code}</p>
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg mt-3">
                                            {enrollment.students.first_name} {enrollment.students.last_name}
                                        </CardTitle>
                                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {enrollment.courses.course_name}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Progress bar */}
                                            <div>
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-gray-500">Course Progress</span>
                                                    <span className="font-bold text-blue-600">{enrollment.completion_percentage}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 transition-all duration-500"
                                                        style={{ width: `${enrollment.completion_percentage}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {enrollment.lessons_completed} of {enrollment.total_lessons} lessons completed
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="truncate">{enrollment.students.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span>{enrollment.students.phone || "No phone"}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    View Progress Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
