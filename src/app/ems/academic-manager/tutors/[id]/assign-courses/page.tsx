"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    Save,
    Search,
    BookOpen,
    GraduationCap,
    Clock,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface Tutor {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
    employee_code?: string;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
    course_description?: string;
    course_level: string;
    duration_hours: number;
    is_published: boolean;
    assigned: boolean;
    assigned_to_other: boolean;
}

export default function TutorAssignCoursesPage() {
    const params = useParams();
    const id = params.id as string;

    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tutorRes, coursesRes] = await Promise.all([
                api.get(`/ems/tutors/${id}`),
                api.get(`/ems/tutors/${id}/courses`),
            ]);
            if (tutorRes.data.success) {
                setTutor(tutorRes.data.data);
            }
            if (coursesRes.data.success) {
                const data: Course[] = coursesRes.data.data || [];
                setCourses(data);
                setSelectedIds(new Set(data.filter(c => c.assigned).map(c => c.id)));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const toggleCourse = (courseId: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await api.post(`/ems/tutors/${id}/courses`, {
                course_ids: Array.from(selectedIds),
            });
            if (response.data.success) {
                toast.success("Course assignments updated successfully!");
                fetchData();
            }
        } catch (error) {
            console.error("Error saving assignments:", error);
            toast.error("Failed to save assignments");
        } finally {
            setSaving(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAssignedLabel = (course: Course) => {
        if (course.assigned_to_other && !selectedIds.has(course.id)) return "Assigned to Other";
        if (course.assigned) return "Assigned";
        return null;
    };

    if (loading) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24">
                    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                </div>
            </AcademicManagerLayout>
        );
    }

    return (
        <AcademicManagerLayout>
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/ems/academic-manager/tutors"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Assign Courses</h1>
                            {tutor && (
                                <p className="text-sm text-gray-500">
                                    Managing course assignments for {tutor.first_name} {tutor.last_name}
                                    {tutor.specialization && ` - ${tutor.specialization}`}
                                </p>
                            )}
                        </div>
                    </div>

                    <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search courses by name or code..."
                                        className="pl-10 h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-700 min-w-[140px]"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Assignments
                                        </>
                                    )}
                                </Button>
                            </div>

                            {selectedIds.size > 0 && (
                                <div className="mb-4 text-sm text-purple-600 font-medium">
                                    Selected Courses: {selectedIds.size}
                                </div>
                            )}

                            {filteredCourses.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No Courses Found</p>
                                    <p className="text-sm text-gray-400">Try adjusting your search query</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredCourses.map(course => (
                                        <label
                                            key={course.id}
                                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                                selectedIds.has(course.id)
                                                    ? "ring-2 ring-purple-500 bg-purple-50 border-purple-200"
                                                    : "border-0 shadow-md hover:shadow-lg transition-all"
                                            }`}
                                        >
                                            <Checkbox
                                                checked={selectedIds.has(course.id)}
                                                onCheckedChange={() => toggleCourse(course.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-900">
                                                        {course.course_name}
                                                    </span>
                                                    <span className="text-sm text-gray-400">|</span>
                                                    <span className="text-sm text-gray-500">{course.course_code}</span>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                                            course.is_published
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {course.is_published ? "Published" : "Draft"}
                                                    </span>
                                                    {getAssignedLabel(course) && (
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                                getAssignedLabel(course) === "Assigned to Other"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}
                                                        >
                                                            {getAssignedLabel(course)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {course.course_description || "No description"}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" />
                                                        Level: {course.course_level}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Duration: {course.duration_hours}h
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AcademicManagerLayout>
    );
}
