"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Search,
    Clock,
    Play,
    CheckCircle2,
    ChevronLeft,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Course {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    instructor?: string;
    duration?: string;
    thumbnail_url?: string;
    progress?: number;
    batch?: {
        id: number;
        batch_name: string;
        batch_code: string;
    };
}

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "enrolled" | "available">("enrolled");
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/students/my-courses");
            if (response.data.success) {
                // Map enrollment data to Course interface
                const mappedCourses = (response.data.data || []).map((enrollment: any) => ({
                    id: enrollment.course.id,
                    course_name: enrollment.course.course_name,
                    course_code: enrollment.course.course_code,
                    course_description: enrollment.course.course_description,
                    thumbnail_url: enrollment.course.thumbnail_url,
                    duration: enrollment.course.duration_hours ? `${enrollment.course.duration_hours}h` : 'N/A',
                    progress: enrollment.completion_percentage,
                    batch: enrollment.batch ? {
                        id: enrollment.batch.id,
                        batch_name: enrollment.batch.batch_name,
                        batch_code: enrollment.batch.batch_code,
                    } : null,
                }));
                setCourses(mappedCourses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">My Courses</h1>
                    <p className="text-gray-600">Continue your learning journey</p>
                </motion.div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                </div>

                {/* Courses List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                        <p>Fetching your curriculum...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <Card className="border-0 shadow-lg p-12 text-center">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Enrolled</h3>
                        <p className="text-gray-600 mb-6">You haven't been enrolled in any courses yet.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCourses.map((course) => (
                            <Link key={course.id} href={`/ems/student/courses/${course.id}`}>
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group h-full">
                                    <div className="relative h-40 overflow-hidden bg-blue-100">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.course_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen className="h-12 w-12 text-blue-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-bold text-lg line-clamp-1">{course.course_name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-blue-100 text-xs">{course.course_code}</p>
                                                {course.batch && (
                                                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold border border-white/20">
                                                        Batch: {course.batch.batch_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                                            {course.course_description}
                                        </p>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                <span>Duration: {course.duration || 'N/A'}</span>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">Curriculum Loaded</span>
                                        </div>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-lg">
                                            <Play className="h-4 w-4 mr-2" />
                                            Open Course
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
