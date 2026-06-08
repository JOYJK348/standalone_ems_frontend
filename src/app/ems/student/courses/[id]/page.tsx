"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronRight,
    FileText,
    PlayCircle,
    Loader2,
    Lock,
    CheckCircle,
    Calendar,
    Users,
    Clock,
    Download,
    Eye,
    Award,
    Zap
} from "lucide-react";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

interface Material {
    id: number;
    material_name: string;
    material_type: string;
    file_url: string;
}

interface Lesson {
    id: number;
    lesson_name: string;
    lesson_number: string;
    is_locked: boolean;
    course_materials: Material[];
}

interface Module {
    id: number;
    module_name: string;
    module_number: number;
    course_materials?: Material[];
    lessons: Lesson[];
}

interface CourseDetails {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    course_materials?: Material[];
    course_modules: Module[];
}

export default function StudentCourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);

    useEffect(() => {
        fetchCourseDetails();
        fetchAllocations();
    }, [params.id]);

    const fetchAllocations = async () => {
        try {
            const response = await api.get('/ems/practice/student/status');
            if (response.data.success) {
                setAllocations(response.data.data || []);
            }
        } catch (err) { }
    };

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${params.id}?include_active_session=true`);
            if (response.data.success) {
                setCourse(response.data.data);
                if (response.data.data.course_modules?.length > 0) {
                    setExpandedModules([response.data.data.course_modules[0].id]);
                }
            }
        } catch (error: any) {
            console.error("Error fetching course details:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId: number) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Course Not Found</h3>
                        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
                        <Button onClick={() => router.back()} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate progress
    const totalLessons = course.course_modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    const completedLessons = 0; // This would come from API
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const courseAllocation = allocations.find(a => a.course_id === parseInt(params.id as string));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 hover:bg-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* Course Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-6 rounded-2xl overflow-hidden shadow-xl"
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                    </div>

                    {/* Content */}
                    <div className="relative p-6 text-white">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2 line-clamp-2">{course.course_name}</h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg font-bold uppercase tracking-wider border border-white/30">
                                        {course.course_code}
                                    </span>
                                    <span className="text-white/60">•</span>
                                    <span className="text-white/90">{totalLessons} Lessons</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/80">Course Progress</span>
                                <span className="font-bold">{progress}%</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                            <div className="text-xs text-white/70">
                                {completedLessons} of {totalLessons} lessons completed
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Practice Lab Contextual Access */}
                {courseAllocation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6"
                    >
                        <Link href={`/ems/student/practice-lab?courseId=${course.id}`}>
                            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-xl transition-all cursor-pointer group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                                <CardContent className="p-5 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-white/30">
                                            <Zap className="h-6 w-6 text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Launch Finance Lab</h3>
                                            <p className="text-white/80 text-xs font-medium italic">Simulate real GST/TDS scenarios for this course</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/35 transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                )}

                {/* Course Description */}
                {course.course_description && (
                    <Card className="mb-6 border-0 shadow-md">
                        <CardContent className="p-5">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">About This Course</h3>
                            <p className="text-gray-700 leading-relaxed">{course.course_description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Course Materials (Handbooks) */}
                {course.course_materials && course.course_materials.length > 0 && (
                    <Card className="mb-6 border-0 shadow-md bg-blue-50/50">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Course Materials</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {course.course_materials.map(material => (
                                    <button
                                        key={material.id}
                                        onClick={() => window.open(material.file_url, '_blank')}
                                        className="flex items-center gap-3 bg-white hover:bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl transition-all group"
                                    >
                                        <Download className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{material.material_name}</p>
                                            <p className="text-xs text-gray-500 uppercase">{material.material_type}</p>
                                        </div>
                                        <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Curriculum Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full" />
                        Learning Curriculum
                    </h2>

                    {(!course.course_modules || course.course_modules.length === 0) ? (
                        <Card className="border-2 border-dashed border-gray-200">
                            <CardContent className="p-12 text-center">
                                <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-600 font-medium mb-1">No Content Available</p>
                                <p className="text-sm text-gray-400">Check back later when your tutor releases the curriculum.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {course.course_modules.map((module, moduleIndex) => (
                                <Card key={module.id} className="border-0 shadow-md overflow-hidden">
                                    {/* Module Header */}
                                    <div
                                        onClick={() => toggleModule(module.id)}
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 font-bold text-sm">{module.module_number}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{module.module_name}</h3>
                                                <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${expandedModules.includes(module.id) ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </div>

                                    {/* Module Materials */}
                                    {module.course_materials && module.course_materials.length > 0 && expandedModules.includes(module.id) && (
                                        <div className="px-4 pb-3 bg-purple-50/30 border-t border-gray-100">
                                            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 mt-3">Module Resources</div>
                                            <div className="flex flex-wrap gap-2">
                                                {module.course_materials.map(mat => (
                                                    <button
                                                        key={mat.id}
                                                        onClick={() => window.open(mat.file_url, '_blank')}
                                                        className="flex items-center gap-2 bg-white hover:bg-purple-50 border border-purple-100 px-3 py-2 rounded-lg transition-all text-sm"
                                                    >
                                                        <FileText className="h-3 w-3 text-purple-600" />
                                                        <span className="font-medium text-gray-700 text-xs">{mat.material_name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Lessons */}
                                    <AnimatePresence>
                                        {expandedModules.includes(module.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-gray-100"
                                            >
                                                <div className="p-4 space-y-2 bg-gray-50/50">
                                                    {module.lessons.map((lesson, lessonIndex) => (
                                                        <div
                                                            key={lesson.id}
                                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${lesson.is_locked
                                                                ? 'bg-gray-100 opacity-60'
                                                                : 'bg-white hover:shadow-md cursor-pointer'
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                {lesson.is_locked ? (
                                                                    <Lock className="h-4 w-4 text-gray-400" />
                                                                ) : (
                                                                    <PlayCircle className="h-4 w-4 text-blue-600" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm text-gray-900 truncate">
                                                                    {lesson.lesson_name}
                                                                </p>
                                                                {lesson.course_materials && lesson.course_materials.length > 0 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {lesson.course_materials.length} materials
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {!lesson.is_locked && (
                                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Achievement Badge */}
                <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Award className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 mb-1">Complete this course to earn a certificate!</h3>
                                <p className="text-sm text-gray-600">Finish all lessons and assignments to unlock your achievement.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <BottomNav />
        </div>
    );
}
