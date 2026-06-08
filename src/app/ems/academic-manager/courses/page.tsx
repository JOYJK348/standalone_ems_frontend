"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    ArrowLeft,
    X,
    UserPlus,
    Loader2,
    TrendingUp,
    Upload,
    Camera,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { MultiTutorModal } from "@/components/ems/multi-tutor-modal";
import { DeleteCourseModal } from "@/components/ems/delete-course-modal";
import { EnrollStudentModal } from "@/components/ems/enroll-student-modal";

interface Course {
    id: number;
    course_code: string;
    course_name: string;
    course_description: string;
    course_category: string;
    course_level: string;
    duration_hours: number;
    price: number;
    status: string;
    total_lessons: number;
    enrollment_capacity: number;
    tutor?: {
        id: number;
        name: string;
        email: string;
    } | null;
    tutors?: Array<{
        id: number;
        name: string;
        email: string;
        employeeCode?: string;
        isPrimary?: boolean;
        role?: string;
    }>;
    students?: Array<{
        id: number;
        name: string;
        email: string;
        studentCode: string;
    }>;
    studentCount?: number;
    thumbnail_url?: string;
    enabled_practice_modules?: string[];
    is_published?: boolean;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseMappings, setCourseMappings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [tutors, setTutors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        course_code: "",
        course_name: "",
        course_description: "",
        course_category: "TECHNOLOGY",
        course_level: "BEGINNER",
        duration_hours: 40,
        price: 0,
        enrollment_capacity: 30,
        tutor_id: "",
        thumbnail_url: "",
        enabled_practice_modules: [] as string[],
        status: "DRAFT",
        is_published: false,
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const [debugInfo, setDebugInfo] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCourses(),
                fetchCourseMappings(),
                fetchTutors(),
            ]);
        } catch (error) {
            console.error("❌ [Courses] Load Data Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            console.log("📡 [Courses] Fetching courses list...");
            const response = await api.get(`/ems/courses?_t=${Date.now()}`);

            // Capture debug info
            const companyId = Cookies.get("x-company-id");
            const backendDebug = response.data.meta?.debug || {};

            setDebugInfo((prev: any) => ({
                ...prev,
                status: response.status,
                companyId: companyId || "missing",
                lastFetch: new Date().toLocaleTimeString(),
                ...backendDebug,
            }));

            if (response.data.success) {
                const raw = response.data.data || [];
                const data = Array.isArray(raw) ? raw : raw.courses || [];
                console.log("✅ [Courses] Fetched courses count:", data.length);
                setCourses(data);
                return data;
            }
        } catch (error: any) {
            console.error("❌ [Courses] List Fetch Error:", error);
            setDebugInfo((prev: any) => ({
                ...prev,
                status: "ERROR",
                error: error.message,
            }));
            throw error;
        }
    };

    const fetchCourseMappings = async () => {
        try {
            console.log("📡 [Courses] Fetching course mappings...");
            const response = await api.get(
                `/ems/dashboard/course-mapping?_t=${Date.now()}`,
            );
            if (response.data.success) {
                const mappings = response.data.data || [];
                setCourseMappings(mappings);
                console.log(
                    "✅ [Courses] Fetched mappings count:",
                    mappings.length,
                );

                // Merge mapping data with courses if they already exist
                setCourses((prevCourses) => {
                    if (prevCourses.length === 0) return prevCourses;
                    return prevCourses.map((course) => {
                        const mapping = mappings.find(
                            (m: any) => m.courseId === course.id,
                        );
                        if (mapping) {
                            return {
                                ...course,
                                tutor: mapping.tutor,
                                tutors: mapping.tutors,
                                students: mapping.students,
                                studentCount: mapping.studentCount,
                            };
                        }
                        return course;
                    });
                });
            }
        } catch (error) {
            console.error("❌ [Courses] Mapping Fetch Error:", error);
        }
    };

    const fetchTutors = async () => {
        try {
            const response = await api.get("/ems/tutors");
            if (response.data.success) {
                setTutors(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching tutors:", error);
        }
    };

    const handleThumbnailUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "branding");
        formData.append("folder", "courses/thumbnails");

        try {
            const { data } = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                setFormData((prev) => ({
                    ...prev,
                    thumbnail_url: data.data.url,
                }));
                toast.success("Thumbnail uploaded");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response;

            const payload = {
                ...formData,
                tutor_id: formData.tutor_id
                    ? parseInt(formData.tutor_id)
                    : null,
            };

            if (selectedCourse) {
                // Update existing course
                response = await api.put(
                    `/ems/courses/${selectedCourse.id}`,
                    payload,
                );
            } else {
                // Create new course
                response = await api.post("/ems/courses", payload);
            }

            if (response.data.success) {
                setShowCreateForm(false);
                setSelectedCourse(null);
                fetchCourses();
                fetchCourseMappings();
                setFormData({
                    course_code: "",
                    course_name: "",
                    course_description: "",
                    course_category: "TECHNOLOGY",
                    course_level: "BEGINNER",
                    duration_hours: 40,
                    price: 0,
                    enrollment_capacity: 30,
                    tutor_id: "",
                    thumbnail_url: "",
                    enabled_practice_modules: [],
                    status: "DRAFT",
                    is_published: false,
                });
                toast.success(
                    selectedCourse
                        ? "Course updated successfully!"
                        : "Course created successfully!",
                );
            }
        } catch (error: any) {
            console.error("Error saving course:", error);
            toast.error(
                error.response?.data?.message || "Failed to save course",
            );
        }
    };

    const handleEditCourse = (course: Course) => {
        setFormData({
            course_code: course.course_code,
            course_name: course.course_name,
            course_description: course.course_description || "",
            course_category: course.course_category,
            course_level: course.course_level,
            duration_hours: course.duration_hours,
            price: course.price,
            enrollment_capacity: course.enrollment_capacity,
            tutor_id: course.tutor ? course.tutor.id.toString() : "",
            thumbnail_url: course.thumbnail_url || "",
            enabled_practice_modules: course.enabled_practice_modules
                ? course.enabled_practice_modules
                : [],
            status: course.status || "DRAFT",
            is_published: course.is_published ?? false,
        });
        setSelectedCourse(course);
        setShowCreateForm(true);
    };

    const handleDeleteCourse = (course: Course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const filteredCourses = courses.filter(
        (course) =>
            course.course_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            course.course_code
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <Link href="/ems/academic-manager/dashboard">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mb-2"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                    Courses Management
                                </h1>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadData}
                                    disabled={loading}
                                    className="h-8 text-xs bg-white/50 border-purple-200 text-purple-700 hover:bg-purple-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : (
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                            <p className="text-gray-600 mt-1">
                                Create and manage your course catalog
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setSelectedCourse(null);
                                setFormData({
                                    course_code: "",
                                    course_name: "",
                                    course_description: "",
                                    course_category: "TECHNOLOGY",
                                    course_level: "BEGINNER",
                                    duration_hours: 40,
                                    price: 0,
                                    enrollment_capacity: 30,
                                    tutor_id: "",
                                    thumbnail_url: "",
                                    enabled_practice_modules: [],
                                    status: "DRAFT",
                                    is_published: false,
                                });
                                setShowCreateForm(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </Button>
                    </div>

                    {/* Search and Filter */}
                    <Card className="mb-6 border-0 shadow-md">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search courses by name or code..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Courses Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">
                                Loading courses...
                            </p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <BookOpen className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    No Courses Yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Get started by creating your first course
                                </p>
                                <Button
                                    onClick={() => {
                                        setSelectedCourse(null);
                                        setFormData({
                                            course_code: "",
                                            course_name: "",
                                            course_description: "",
                                            course_category: "TECHNOLOGY",
                                            course_level: "BEGINNER",
                                            duration_hours: 40,
                                            price: 0,
                                            enrollment_capacity: 30,
                                            tutor_id: "",
                                            thumbnail_url: "",
                                            enabled_practice_modules: [],
                                            status: "DRAFT",
                                            is_published: false,
                                        });
                                        setShowCreateForm(true);
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Course
                                </Button>

                                {/* Debug Info UI (Hidden by default, useful for support) */}
                                {debugInfo && (
                                    <details className="mt-8 max-w-sm mx-auto text-left">
                                        <summary className="cursor-pointer text-[10px] text-gray-400 hover:text-gray-600 transition-colors mb-2">
                                            Advanced Diagnostic Info
                                        </summary>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-xs text-gray-600 shadow-inner">
                                            <h4 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">
                                                System Context
                                            </h4>
                                            <p>
                                                <strong>Status:</strong>{" "}
                                                {debugInfo.status}
                                            </p>
                                            <p>
                                                <strong>Company ID:</strong>{" "}
                                                {debugInfo.companyId}
                                            </p>
                                            <p>
                                                <strong>User ID:</strong>{" "}
                                                {debugInfo.userId}
                                            </p>
                                            <p>
                                                <strong>Role:</strong>{" "}
                                                {debugInfo.role} (L
                                                {debugInfo.roleLevel})
                                            </p>
                                            <p>
                                                <strong>Logic:</strong>{" "}
                                                {debugInfo.selectionReason}
                                            </p>
                                            <p>
                                                <strong>Raw Count (DB):</strong>{" "}
                                                {debugInfo.rawCount}
                                            </p>
                                            <p>
                                                <strong>Fetch Time:</strong>{" "}
                                                {debugInfo.lastFetch}
                                            </p>
                                            {debugInfo.error && (
                                                <p className="text-red-500 font-bold mt-2">
                                                    {debugInfo.error}
                                                </p>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-3 h-7 text-[10px] bg-white"
                                                onClick={() => loadData()}
                                            >
                                                Force Re-fetch
                                            </Button>
                                        </div>
                                    </details>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div key={course.id}>
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                                        <div className="relative h-40 w-full overflow-hidden bg-purple-50">
                                            {course.thumbnail_url ? (
                                                <img
                                                    src={course.thumbnail_url}
                                                    alt={course.course_name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="h-12 w-12 text-purple-200" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                                                        course.status ===
                                                            "PUBLISHED" ||
                                                        course.status ===
                                                            "ACTIVE"
                                                            ? "bg-green-500/80 text-white border-green-400"
                                                            : "bg-yellow-500/80 text-white border-yellow-400"
                                                    }`}
                                                >
                                                    {course.status === "ACTIVE"
                                                        ? "PUBLISHED"
                                                        : course.status}
                                                </span>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                {course.course_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Code: {course.course_code}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {course.course_description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">
                                                        Duration
                                                    </p>
                                                    <p className="font-semibold">
                                                        {course.duration_hours}h
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">
                                                        Lessons
                                                    </p>
                                                    <p className="font-semibold">
                                                        {course.total_lessons}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">
                                                        Level
                                                    </p>
                                                    <p className="font-semibold">
                                                        {course.course_level}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">
                                                        Price
                                                    </p>
                                                    <p className="font-semibold">
                                                        ₹{course.price}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tutor & Student Info */}
                                            <div className="mb-4 space-y-2">
                                                {/* Tutors */}
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <span className="text-blue-700 font-bold">
                                                            👨‍🏫 Tutors:
                                                        </span>
                                                        <span className="text-blue-600 font-bold ml-1">
                                                            {course.tutors
                                                                ?.length || 0}
                                                        </span>
                                                    </div>

                                                    {course.tutors &&
                                                    course.tutors.length > 0 ? (
                                                        <div className="flex flex-col gap-1.5">
                                                            {course.tutors.map(
                                                                (tutor) => (
                                                                    <div
                                                                        key={
                                                                            tutor.id
                                                                        }
                                                                        className="flex items-center justify-between group"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                                                    tutor.isPrimary
                                                                                        ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                                                        : "bg-blue-100 text-blue-700"
                                                                                }`}
                                                                            >
                                                                                {tutor.name.charAt(
                                                                                    0,
                                                                                )}
                                                                            </div>
                                                                            <span
                                                                                className={`font-semibold ${tutor.isPrimary ? "text-blue-900" : "text-gray-700"}`}
                                                                            >
                                                                                {
                                                                                    tutor.name
                                                                                }
                                                                                {tutor.isPrimary && (
                                                                                    <span
                                                                                        className="ml-1 text-yellow-600"
                                                                                        title="Primary Tutor"
                                                                                    >
                                                                                        ⭐
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {tutor.role && (
                                                                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                                                                                {
                                                                                    tutor.role
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 italic">
                                                            No tutors assigned
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Students */}
                                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                                                    <span className="text-green-700 font-bold">
                                                        👥 Students:
                                                    </span>
                                                    <span className="text-green-900 font-bold text-base">
                                                        {course.studentCount ||
                                                            0}
                                                    </span>
                                                    {course.studentCount &&
                                                    course.studentCount > 0 ? (
                                                        <span className="text-green-800 font-medium ml-auto">
                                                            enrolled
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 italic font-medium ml-auto">
                                                            None
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                                    onClick={() => {
                                                        setSelectedCourse(
                                                            course,
                                                        );
                                                        setShowAssignTutorModal(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    {course.tutor
                                                        ? "Manage Tutors"
                                                        : "Assign Tutors"}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 font-semibold"
                                                    onClick={() => {
                                                        setSelectedCourse(
                                                            course,
                                                        );
                                                        setShowEnrollModal(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Manage Students
                                                </Button>

                                                {/* Other Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/ems/academic-manager/courses/${course.id}`}
                                                        className="flex-1"
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleEditCourse(
                                                                course,
                                                            )
                                                        }
                                                        className="hover:bg-blue-50 hover:border-blue-500"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCourse(
                                                                course,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Course Modal */}
                {showCreateForm && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Create New Course
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form
                                onSubmit={handleCreateCourse}
                                className="p-6 space-y-6"
                            >
                                {/* Thumbnail Upload Section */}
                                <div className="space-y-4 p-4 bg-purple-50/50 rounded-2xl border-2 border-dashed border-purple-100 relative group">
                                    <Label className="text-purple-900 font-bold uppercase tracking-widest text-[10px]">
                                        Course Display Banner
                                    </Label>
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative w-full sm:w-40 h-40 sm:h-24 rounded-xl overflow-hidden bg-white shadow-inner border border-purple-100 flex items-center justify-center shrink-0">
                                            {formData.thumbnail_url ? (
                                                <img
                                                    src={formData.thumbnail_url}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                />
                                            ) : (
                                                <Camera className="h-8 w-8 text-purple-200" />
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 w-full">
                                            <p className="text-xs text-purple-700 font-medium">
                                                Upload a professional thumbnail
                                                for your course. Ideal size:
                                                800x450px.
                                            </p>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="thumbnail"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleThumbnailUpload
                                                    }
                                                    disabled={uploading}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "thumbnail",
                                                            )
                                                            ?.click()
                                                    }
                                                    className="w-full bg-white border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {formData.thumbnail_url
                                                        ? "Change Image"
                                                        : "Upload Image"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="course_code">
                                            Course Code *
                                        </Label>
                                        <Input
                                            id="course_code"
                                            required
                                            placeholder="e.g., WEB101"
                                            value={formData.course_code}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    course_code: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="course_level">
                                            Level *
                                        </Label>
                                        <select
                                            id="course_level"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.course_level}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    course_level:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="BEGINNER">
                                                Beginner
                                            </option>
                                            <option value="INTERMEDIATE">
                                                Intermediate
                                            </option>
                                            <option value="ADVANCED">
                                                Advanced
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="course_name">
                                        Course Name *
                                    </Label>
                                    <Input
                                        id="course_name"
                                        required
                                        placeholder="e.g., Web Development Fundamentals"
                                        value={formData.course_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                course_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="course_description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="course_description"
                                        rows={4}
                                        placeholder="Describe what students will learn..."
                                        value={formData.course_description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                course_description:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="course_category">
                                            Category
                                        </Label>
                                        <select
                                            id="course_category"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.course_category}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    course_category:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="TECHNOLOGY">
                                                Technology
                                            </option>
                                            <option value="BUSINESS">
                                                Business
                                            </option>
                                            <option value="DESIGN">
                                                Design
                                            </option>
                                            <option value="MARKETING">
                                                Marketing
                                            </option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="tutor_id">
                                            Assign Tutor
                                        </Label>
                                        <select
                                            id="tutor_id"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.tutor_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    tutor_id: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">
                                                -- Select Tutor --
                                            </option>
                                            {tutors.map((tutor) => (
                                                <option
                                                    key={tutor.id}
                                                    value={tutor.id}
                                                >
                                                    {tutor.first_name}{" "}
                                                    {tutor.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="duration_hours">
                                            Duration (Hours)
                                        </Label>
                                        <Input
                                            id="duration_hours"
                                            type="number"
                                            min="1"
                                            value={formData.duration_hours}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    duration_hours: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">Price (₹)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    price: parseFloat(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="enrollment_capacity">
                                            Max Students
                                        </Label>
                                        <Input
                                            id="enrollment_capacity"
                                            type="number"
                                            min="1"
                                            value={formData.enrollment_capacity}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    enrollment_capacity:
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 p-6 bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-orange-100 rounded-lg">
                                            <TrendingUp className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <Label className="text-orange-900 font-black uppercase tracking-widest text-[10px]">
                                            Practical Simulation Labs
                                        </Label>
                                    </div>
                                    <p className="text-xs text-orange-700 font-medium">
                                        Enable simulation modules for this
                                        course. Students will receive practice
                                        licenses upon allocation.
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        {["GST", "TDS", "INCOME_TAX"].map(
                                            (module) => (
                                                <div
                                                    key={module}
                                                    className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-orange-100 shadow-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`module-${module}`}
                                                        className="w-4 h-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                                        checked={formData.enabled_practice_modules.includes(
                                                            module,
                                                        )}
                                                        onChange={(e) => {
                                                            const current = [
                                                                ...formData.enabled_practice_modules,
                                                            ];
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                setFormData({
                                                                    ...formData,
                                                                    enabled_practice_modules:
                                                                        [
                                                                            ...current,
                                                                            module,
                                                                        ],
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    enabled_practice_modules:
                                                                        current.filter(
                                                                            (
                                                                                m,
                                                                            ) =>
                                                                                m !==
                                                                                module,
                                                                        ),
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`module-${module}`}
                                                        className="text-sm font-bold text-gray-700 cursor-pointer"
                                                    >
                                                        {module} Lab
                                                    </Label>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            Course Status
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formData.is_published
                                                ? "Published & Active"
                                                : "Draft — not visible to students"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                is_published:
                                                    !formData.is_published,
                                                status: formData.is_published
                                                    ? "DRAFT"
                                                    : "PUBLISHED",
                                            })
                                        }
                                        className={`relative w-14 h-7 rounded-full transition-colors ${
                                            formData.is_published
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                                formData.is_published
                                                    ? "translate-x-7"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:flex-1"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        {selectedCourse
                                            ? "Update Course"
                                            : "Create Course"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Multi-Tutor Assignment Modal */}
                <MultiTutorModal
                    isOpen={showAssignTutorModal && !!selectedCourse}
                    onClose={() => {
                        setShowAssignTutorModal(false);
                        setSelectedCourse(null);
                    }}
                    courseId={selectedCourse?.id || 0}
                    courseName={selectedCourse?.course_name || ""}
                    onSuccess={() => {
                        fetchCourses();
                        fetchCourseMappings();
                    }}
                />

                {/* Enroll Student Modal */}
                <EnrollStudentModal
                    isOpen={showEnrollModal && !!selectedCourse}
                    onClose={() => {
                        setShowEnrollModal(false);
                        setSelectedCourse(null);
                    }}
                    courseId={selectedCourse?.id || 0}
                    courseName={selectedCourse?.course_name || ""}
                    enrolledStudentIds={(selectedCourse?.students || []).map(
                        (s) => s.id,
                    )}
                    onSuccess={() => {
                        fetchCourses();
                        fetchCourseMappings();
                    }}
                />

                {/* Delete Course Modal */}
                <DeleteCourseModal
                    isOpen={showDeleteModal && !!courseToDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setCourseToDelete(null);
                    }}
                    courseId={courseToDelete?.id || 0}
                    courseName={courseToDelete?.course_name || ""}
                    onSuccess={() => {
                        fetchCourses();
                        fetchCourseMappings();
                    }}
                />
            </AcademicManagerLayout>
        </div>
    );
}
