"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    BookOpen,
    Plus,
    ChevronDown,
    ChevronRight,
    FileText,
    Video,
    Link2,
    Eye,
    EyeOff,
    Globe,
    Lock,
    Users,
    GraduationCap,
    Loader2,
    Trash2,
    Edit3,
    X,
    FilePlus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Course {
    id: number;
    course_code: string;
    course_name: string;
    course_description?: string;
    course_category?: string;
    course_level?: string;
    duration_hours?: number;
    price?: number;
    is_published: boolean;
    status: string;
    course_materials?: CourseMaterial[];
    course_modules?: CourseModule[];
}

interface CourseModule {
    id: number;
    module_name: string;
    module_description?: string;
    module_order: number;
    is_active: boolean;
    course_materials?: CourseMaterial[];
    lessons?: Lesson[];
}

interface Lesson {
    id: number;
    lesson_name: string;
    lesson_description?: string;
    lesson_type?: string;
    lesson_order: number;
    is_preview: boolean;
    is_active: boolean;
    course_materials?: CourseMaterial[];
}

interface CourseMaterial {
    id: number;
    material_name: string;
    material_type: string;
    file_url?: string;
    handbook_type?: string;
    target_audience?: string;
    is_active: boolean;
}

export default function CourseDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"curriculum" | "handbooks">(
        "curriculum",
    );
    const [expandedModules, setExpandedModules] = useState<Set<number>>(
        new Set(),
    );

    // Form states
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
        null,
    );
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
        null,
    );
    const [moduleName, setModuleName] = useState("");
    const [lessonName, setLessonName] = useState("");
    const [lessonType, setLessonType] = useState("VIDEO");
    const [materialName, setMaterialName] = useState("");
    const [materialUrl, setMaterialUrl] = useState("");
    const [materialType, setMaterialType] = useState("DOCUMENT");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (id) fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${id}`);
            if (response.data.success) {
                setCourse(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching course details:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId: number) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });
    };

    const handleCreateModule = async () => {
        if (!moduleName.trim()) {
            toast.error("Module name is required");
            return;
        }
        try {
            setCreating(true);
            const companyId = Cookies.get("company_id");
            const response = await api.post("/ems/modules", {
                company_id: parseInt(companyId || "0"),
                course_id: parseInt(id),
                module_name: moduleName.trim(),
                module_order: (course?.course_modules?.length || 0) + 1,
            });
            if (response.data.success) {
                toast.success("Module created");
                setModuleName("");
                setShowModuleForm(false);
                fetchCourse();
            }
        } catch (error) {
            console.error("Error creating module:", error);
            toast.error("Failed to create module");
        } finally {
            setCreating(false);
        }
    };

    const handleCreateLesson = async () => {
        if (!lessonName.trim() || !selectedModuleId) {
            toast.error("Lesson name is required");
            return;
        }
        try {
            setCreating(true);
            const companyId = Cookies.get("company_id");
            const response = await api.post("/ems/lessons", {
                company_id: parseInt(companyId || "0"),
                course_id: parseInt(id),
                module_id: selectedModuleId,
                lesson_name: lessonName.trim(),
                lesson_type: lessonType,
                lesson_order:
                    (course?.course_modules?.find(
                        (m) => m.id === selectedModuleId,
                    )?.lessons?.length || 0) + 1,
            });
            if (response.data.success) {
                toast.success("Lesson added");
                setLessonName("");
                setShowLessonForm(false);
                setSelectedModuleId(null);
                fetchCourse();
            }
        } catch (error) {
            console.error("Error adding lesson:", error);
            toast.error("Failed to add lesson");
        } finally {
            setCreating(false);
        }
    };

    const handleAttachMaterial = async () => {
        if (!materialName.trim() || !materialUrl.trim()) {
            toast.error("Name and URL are required");
            return;
        }
        if (!selectedLessonId && !selectedModuleId) {
            toast.error("Please select a lesson first");
            return;
        }
        try {
            setCreating(true);
            const companyId = Cookies.get("company_id");
            const payload: any = {
                company_id: parseInt(companyId || "0"),
                course_id: parseInt(id),
                material_name: materialName.trim(),
                material_type: materialType,
                file_url: materialUrl.trim(),
            };
            if (selectedLessonId) payload.lesson_id = selectedLessonId;
            else if (selectedModuleId) payload.module_id = selectedModuleId;

            const response = await api.post("/ems/materials", payload);
            if (response.data.success) {
                toast.success("Material attached");
                setMaterialName("");
                setMaterialUrl("");
                setShowMaterialForm(false);
                fetchCourse();
            }
        } catch (error) {
            console.error("Error attaching material:", error);
            toast.error("Failed to attach material");
        } finally {
            setCreating(false);
        }
    };

    const handleVisibilityToggle = async (
        type: string,
        contentId: number,
        visibility: string,
    ) => {
        try {
            const response = await api.patch(
                `/ems/courses/content/${type}/${contentId}/visibility`,
                { visibility },
            );
            if (response.data.success) {
                toast.success(`Visibility updated to ${visibility}`);
                fetchCourse();
            }
        } catch (error) {
            console.error("Error toggling visibility:", error);
            toast.error("Failed to update visibility");
        }
    };

    const modules = course?.course_modules?.filter((m) => m.is_active) || [];
    const handbooks =
        course?.course_materials?.filter(
            (m) =>
                m.handbook_type &&
                [
                    "STUDENT_HANDBOOK",
                    "TUTOR_HANDBOOK",
                    "GENERAL_RESOURCE",
                ].includes(m.handbook_type),
        ) || [];

    if (loading) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            </AcademicManagerLayout>
        );
    }

    if (!course) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24 flex flex-col items-center justify-center p-4">
                    <BookOpen className="h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Course not found
                    </h1>
                    <Link
                        href="/ems/academic-manager/courses"
                        className="mt-4 text-purple-600 hover:underline"
                    >
                        Back to Courses
                    </Link>
                </div>
            </AcademicManagerLayout>
        );
    }

    return (
        <AcademicManagerLayout>
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/ems/academic-manager/courses"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {course.course_name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="text-purple-600 border-purple-200 bg-purple-50"
                                >
                                    {course.course_code}
                                </Badge>
                                <Badge
                                    className={
                                        course.is_published
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }
                                >
                                    {course.is_published
                                        ? "Published"
                                        : "Draft"}
                                </Badge>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.put(
                                                `/ems/courses/${course.id}`,
                                                {
                                                    is_published:
                                                        !course.is_published,
                                                    status: course.is_published
                                                        ? "DRAFT"
                                                        : "PUBLISHED",
                                                },
                                            );
                                            setCourse((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          is_published:
                                                              !prev.is_published,
                                                          status: prev.is_published
                                                              ? "DRAFT"
                                                              : "PUBLISHED",
                                                      }
                                                    : prev,
                                            );
                                            toast.success(
                                                course.is_published
                                                    ? "Course unpublished"
                                                    : "Course published",
                                            );
                                        } catch {
                                            toast.error(
                                                "Failed to toggle status",
                                            );
                                        }
                                    }}
                                    className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                                        course.is_published
                                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                    }`}
                                >
                                    {course.is_published
                                        ? "Unpublish"
                                        : "Publish"}
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {course.course_description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <GraduationCap className="h-3 w-3" />
                                    {course.course_level || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {course.course_category || "N/A"}
                                </span>
                                <span>
                                    {course.duration_hours
                                        ? `${course.duration_hours}h`
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 border-b border-gray-200">
                        <button
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "curriculum"
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("curriculum")}
                        >
                            Course Curriculum
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "handbooks"
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("handbooks")}
                        >
                            Main Course Handbooks & Resources
                        </button>
                    </div>

                    {activeTab === "curriculum" && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Course Curriculum
                                </h2>
                                <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                    onClick={() => setShowModuleForm(true)}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Module
                                </Button>
                            </div>

                            {modules.length === 0 ? (
                                <Card className="border-0 shadow-md">
                                    <CardContent className="p-12 text-center">
                                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            Start Building your Course
                                        </h3>
                                        <p className="text-gray-400 max-w-md mx-auto mb-6">
                                            Create modules, add lessons, and
                                            upload materials to get started.
                                            Group your lessons into logical
                                            sections.
                                        </p>
                                        <Button
                                            className="bg-purple-600 hover:bg-purple-700"
                                            onClick={() =>
                                                setShowModuleForm(true)
                                            }
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Create First Module
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {modules.map((mod, modIdx) => (
                                        <Card
                                            key={mod.id}
                                            className="border-0 shadow-md overflow-hidden"
                                        >
                                            <div
                                                className="flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 cursor-pointer transition-colors"
                                                onClick={() =>
                                                    toggleModule(mod.id)
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    {expandedModules.has(
                                                        mod.id,
                                                    ) ? (
                                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                                    )}
                                                    <BookOpen className="h-5 w-5 text-purple-500" />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {mod.module_name}
                                                        </h3>
                                                        <p className="text-xs text-gray-400">
                                                            {mod.lessons
                                                                ?.length ||
                                                                0}{" "}
                                                            lessons
                                                            {mod
                                                                .course_materials
                                                                ?.length
                                                                ? ` | ${mod.course_materials.length} materials`
                                                                : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedModuleId(
                                                                mod.id,
                                                            );
                                                            setShowLessonForm(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-purple-600 transition-colors"
                                                        title="Add Lesson & Next"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedModuleId(
                                                                mod.id,
                                                            );
                                                            setSelectedLessonId(
                                                                null,
                                                            );
                                                            setShowMaterialForm(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-purple-600 transition-colors"
                                                        title="Attach Material"
                                                    >
                                                        <Link2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {expandedModules.has(mod.id) && (
                                                <div className="border-t border-gray-100">
                                                    <div className="p-4 space-y-3">
                                                        {mod.lessons?.filter(
                                                            (l) => l.is_active,
                                                        ).length === 0 ? (
                                                            <p className="text-sm text-gray-400 text-center py-4">
                                                                No lessons yet.
                                                                Add a lesson to
                                                                get started.
                                                            </p>
                                                        ) : (
                                                            mod.lessons
                                                                ?.filter(
                                                                    (l) =>
                                                                        l.is_active,
                                                                )
                                                                .map(
                                                                    (
                                                                        lesson,
                                                                        lIdx,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                lesson.id
                                                                            }
                                                                            className="bg-gray-50 rounded-xl p-4"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="text-xs font-medium text-gray-400 w-6">
                                                                                        {modIdx +
                                                                                            1}
                                                                                        .
                                                                                        {lIdx +
                                                                                            1}
                                                                                    </span>
                                                                                    {lesson.lesson_type ===
                                                                                    "VIDEO" ? (
                                                                                        <Video className="h-4 w-4 text-blue-500" />
                                                                                    ) : (
                                                                                        <FileText className="h-4 w-4 text-amber-500" />
                                                                                    )}
                                                                                    <span className="font-medium text-gray-900">
                                                                                        {
                                                                                            lesson.lesson_name
                                                                                        }
                                                                                    </span>
                                                                                    {lesson.is_preview && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-xs text-green-600 border-green-200"
                                                                                        >
                                                                                            Preview
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setSelectedLessonId(
                                                                                                lesson.id,
                                                                                            );
                                                                                            setSelectedModuleId(
                                                                                                mod.id,
                                                                                            );
                                                                                            setShowMaterialForm(
                                                                                                true,
                                                                                            );
                                                                                        }}
                                                                                        className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-purple-600 transition-colors"
                                                                                        title="Add Material to Module"
                                                                                    >
                                                                                        <FilePlus className="h-4 w-4" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            {lesson.course_materials &&
                                                                                lesson
                                                                                    .course_materials
                                                                                    .length >
                                                                                    0 && (
                                                                                    <div className="mt-3 ml-9 space-y-2">
                                                                                        {lesson.course_materials
                                                                                            .filter(
                                                                                                (
                                                                                                    m,
                                                                                                ) =>
                                                                                                    m.is_active,
                                                                                            )
                                                                                            .map(
                                                                                                (
                                                                                                    material,
                                                                                                ) => (
                                                                                                    <div
                                                                                                        key={
                                                                                                            material.id
                                                                                                        }
                                                                                                        className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-lg px-3 py-2"
                                                                                                    >
                                                                                                        <FileText className="h-3 w-3 text-gray-400" />
                                                                                                        <span>
                                                                                                            {
                                                                                                                material.material_name
                                                                                                            }
                                                                                                        </span>
                                                                                                        <span className="text-xs text-gray-300">
                                                                                                            |
                                                                                                        </span>
                                                                                                        <span className="text-xs">
                                                                                                            {
                                                                                                                material.material_type
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                ),
                                                                                            )}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    ),
                                                                )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "handbooks" && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Main Course Handbooks & Resources
                                </h2>
                                <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                    onClick={() => {
                                        setSelectedModuleId(null);
                                        setSelectedLessonId(null);
                                        setShowMaterialForm(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Course Material
                                </Button>
                            </div>
                            {handbooks.length === 0 ? (
                                <Card className="border-0 shadow-md">
                                    <CardContent className="p-12 text-center">
                                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">
                                            No handbooks or resources added yet.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {handbooks.map((material) => (
                                        <Card
                                            key={material.id}
                                            className="border-0 shadow-md hover:shadow-lg transition-all"
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-50">
                                                        <FileText className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {
                                                                material.material_name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {material.handbook_type?.replace(
                                                                /_/g,
                                                                " ",
                                                            )}
                                                            {material.target_audience &&
                                                                ` | ${material.target_audience}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {
                                                                material.material_type
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                {material.file_url && (
                                                    <Link
                                                        href={material.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-3 inline-flex items-center text-xs text-purple-600 hover:underline"
                                                    >
                                                        View Resource
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {showModuleForm && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowModuleForm(false)}
                        >
                            <div
                                className="bg-white rounded-2xl max-w-md w-full p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">
                                        Create Course Module
                                    </h3>
                                    <button
                                        onClick={() => setShowModuleForm(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Module Name</Label>
                                        <Input
                                            placeholder="e.g., Fundamentals of Design"
                                            value={moduleName}
                                            onChange={(e) =>
                                                setModuleName(e.target.value)
                                            }
                                            className="mt-1 h-11"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                                            onClick={handleCreateModule}
                                            disabled={creating}
                                        >
                                            {creating ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : null}
                                            Create Module & Next
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowModuleForm(false);
                                                setShowLessonForm(true);
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Lesson & Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showLessonForm && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowLessonForm(false)}
                        >
                            <div
                                className="bg-white rounded-2xl max-w-md w-full p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">
                                        Add New Lesson
                                    </h3>
                                    <button
                                        onClick={() => setShowLessonForm(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Lesson Name</Label>
                                        <Input
                                            placeholder="e.g., Intro to Layering"
                                            value={lessonName}
                                            onChange={(e) =>
                                                setLessonName(e.target.value)
                                            }
                                            className="mt-1 h-11"
                                        />
                                    </div>
                                    <div>
                                        <Label>Lesson Type</Label>
                                        <select
                                            className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            value={lessonType}
                                            onChange={(e) =>
                                                setLessonType(e.target.value)
                                            }
                                        >
                                            <option value="VIDEO">Video</option>
                                            <option value="DOCUMENT">
                                                Document
                                            </option>
                                            <option value="ARTICLE">
                                                Article
                                            </option>
                                        </select>
                                    </div>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        onClick={handleCreateLesson}
                                        disabled={creating || !selectedModuleId}
                                    >
                                        {creating ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        ) : null}
                                        {selectedModuleId
                                            ? "Add Lesson & Next"
                                            : "Please select a module first"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showMaterialForm && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowMaterialForm(false)}
                        >
                            <div
                                className="bg-white rounded-2xl max-w-md w-full p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">
                                        Add Course Material
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowMaterialForm(false)
                                        }
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Material Title</Label>
                                        <Input
                                            placeholder="e.g., Color Palette PDF"
                                            value={materialName}
                                            onChange={(e) =>
                                                setMaterialName(e.target.value)
                                            }
                                            className="mt-1 h-11"
                                        />
                                    </div>
                                    <div>
                                        <Label>Resource Link (S3/Drive)</Label>
                                        <Input
                                            placeholder="https://..."
                                            value={materialUrl}
                                            onChange={(e) =>
                                                setMaterialUrl(e.target.value)
                                            }
                                            className="mt-1 h-11"
                                        />
                                    </div>
                                    <div>
                                        <Label>Type</Label>
                                        <select
                                            className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            value={materialType}
                                            onChange={(e) =>
                                                setMaterialType(e.target.value)
                                            }
                                        >
                                            <option value="DOCUMENT">
                                                Document
                                            </option>
                                            <option value="VIDEO">Video</option>
                                            <option value="ARTICLE">
                                                Article
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Visibility</Label>
                                        <select
                                            className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            defaultValue="PUBLIC"
                                        >
                                            <option value="PUBLIC">
                                                Public (Free Preview)
                                            </option>
                                            <option value="ENROLLED">
                                                Enrolled Only (Paid)
                                            </option>
                                            <option value="PRIVATE">
                                                Private (Draft)
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                                            onClick={handleAttachMaterial}
                                            disabled={creating}
                                        >
                                            {creating ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : null}
                                            Attach & Stay
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                handleAttachMaterial();
                                                setShowMaterialForm(false);
                                            }}
                                        >
                                            Attach Material
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AcademicManagerLayout>
    );
}
