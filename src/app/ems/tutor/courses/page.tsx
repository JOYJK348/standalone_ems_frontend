"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Users,
    Clock,
    Search,
    Eye,
    BookText,
    TrendingUp,
    Loader2,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface Course {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    total_lessons: number;
    thumbnail_url: string;
    is_published: boolean;
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    enrollment_count?: number;
}

export default function TutorCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/courses");
            if (response.data.success) {
                const raw = response.data.data || [];
                setCourses(Array.isArray(raw) ? raw : (raw.courses || []));
            }
        } catch (error: any) {
            console.error("Error fetching courses:", error);
            toast.error(error.response?.data?.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Assigned Courses
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your curriculum and lesson plans</p>
                </div>

                {/* Search & Filter */}
                <Card className="mb-8 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search courses by name or code..."
                                className="pl-10 h-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500 font-medium">Fetching courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <Card className="border-0 shadow-lg p-12 text-center">
                        <BookOpen className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Assigned</h3>
                        <p className="text-gray-600">Contact your academic manager to assign courses to you.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group h-full flex flex-col">
                                    <div className="relative h-48 bg-blue-100 overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.course_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                                                <BookOpen className="h-16 w-16 text-white/50" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 capitalize">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.is_published ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                                                }`}>
                                                {course.is_published ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                                                {course.course_code}
                                            </span>
                                            <Badge className={`rounded-md uppercase text-[10px] font-black tracking-tight ${course.approval_status === 'APPROVED' ? 'bg-emerald-500 hover:bg-emerald-600' :
                                                    course.approval_status === 'REJECTED' ? 'bg-rose-500 hover:bg-rose-600' :
                                                        'bg-amber-500 hover:bg-amber-600'
                                                }`}>
                                                {course.approval_status === 'REJECTED' ? 'REJECTED' :
                                                    course.approval_status === 'APPROVED' ? 'APPROVED' : 'PENDING REVIEW'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                            {course.course_name}
                                        </h3>

                                        {course.approval_status === 'REJECTED' && course.rejection_reason && (
                                            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-rose-700 font-medium">
                                                    <span className="font-bold uppercase tracking-tighter mr-1 text-[9px]">Feedback:</span>
                                                    {course.rejection_reason}
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                                            {course.course_description || "No description available for this course."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <BookText className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Lessons</p>
                                                    <p className="text-sm font-bold">{course.total_lessons}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Students</p>
                                                    <p className="text-sm font-bold">{course.enrollment_count || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <Link href={`/ems/tutor/courses/${course.id}`}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Manage Course
                                                </Button>
                                            </Link>
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
