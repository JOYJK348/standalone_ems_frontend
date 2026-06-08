"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    ChevronRight,
    PlayCircle,
    FileText,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    ArrowLeft,
    Plus,
    MoreVertical,
    Eye,
    EyeOff,
    Upload,
    FileUp,
    Layout,
    Type,
    BrainCircuit,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Lesson {
    id: number;
    lesson_name: string;
    lesson_number: string;
    lesson_type: string;
    duration_minutes: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ENROLLED';
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Module {
    id: number;
    module_name: string;
    module_number: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ENROLLED';
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    lessons: Lesson[];
}

interface CourseDetails {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    thumbnail_url: string;
    is_published: boolean;
    course_modules: Module[];
    _count?: {
        student_enrollments: number;
    };
}

export default function CourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [moduleName, setModuleName] = useState("");
    const [lessonData, setLessonData] = useState({
        lesson_name: "",
        lesson_type: "VIDEO",
        duration_minutes: 30,
        content_body: ""
    });
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("curriculum");

    useEffect(() => {
        if (params.id) {
            fetchCourseDetails();
        }
    }, [params.id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${params.id}`);
            if (response.data.success) {
                setCourse(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching course:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async () => {
        if (!moduleName.trim()) return toast.error("Module name is required");
        try {
            setIsSubmitting(true);
            const response = await api.post(`/ems/courses/${params.id}/modules`, {
                module_name: moduleName,
                module_order: (course?.course_modules?.length || 0) + 1,
            });
            if (response.data.success) {
                toast.success("Module created and sent for approval");
                setIsAddModuleOpen(false);
                setModuleName("");
                fetchCourseDetails();
            }
        } catch (error) {
            toast.error("Failed to create module");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddLesson = async () => {
        if (!lessonData.lesson_name.trim()) return toast.error("Lesson name is required");
        if (!selectedModuleId) return toast.error("Module selection is required");

        try {
            setIsSubmitting(true);
            const response = await api.post(`/ems/courses/modules/${selectedModuleId}/lessons`, {
                ...lessonData,
                duration_minutes: Number(lessonData.duration_minutes),
                lesson_order: 1, // Will be handled by backend usually
            });
            if (response.data.success) {
                toast.success("Lesson submitted for manager approval");
                setIsAddLessonOpen(false);
                setLessonData({ lesson_name: "", lesson_type: "VIDEO", duration_minutes: 30, content_body: "" });
                fetchCourseDetails();
            }
        } catch (error) {
            toast.error("Failed to submit lesson");
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePublish = async (type: 'module' | 'lesson', id: number, currentVisibility: string) => {
        // Cycle visibility: PUBLIC -> ENROLLED -> PRIVATE -> PUBLIC
        const cycle: Record<string, 'PUBLIC' | 'PRIVATE' | 'ENROLLED'> = {
            'PUBLIC': 'ENROLLED',
            'ENROLLED': 'PRIVATE',
            'PRIVATE': 'PUBLIC'
        };
        const nextVisibility = cycle[currentVisibility] || 'PRIVATE';

        try {
            const response = await api.patch(`/ems/courses/content/${type}/${id}/visibility`, {
                visibility: nextVisibility
            });
            if (response.data.success) {
                toast.success(`Visibility updated to ${nextVisibility}`);
                fetchCourseDetails(); // Refresh
            }
        } catch (error) {
            toast.error("Failed to update visibility");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <TutorTopNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
                <TutorBottomNav />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col text-center py-20">
                <TutorTopNavbar />
                <AlertCircle className="h-20 w-20 text-red-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Course Not Found</h1>
                <Button onClick={() => router.back()} variant="ghost" className="mt-4 mx-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
                <TutorBottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            {/* Sticky Course Header */}
            <div className="bg-white border-b sticky top-[64px] z-30 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                    {course.course_code}
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{course.course_name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="hidden sm:flex" onClick={() => window.open(`/ems/courses/${course.id}`, '_blank')}>
                            Preview as Student
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-md"
                            onClick={() => setIsAddModuleOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Request Module Approval
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto mt-4 flex gap-6 overflow-x-auto no-scrollbar">
                    {["curriculum", "students", "assignments"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === "curriculum" && (
                        <motion.div
                            key="curriculum"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {!course.course_modules || course.course_modules.length === 0 ? (
                                <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50">
                                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold">Your curriculum is empty</h3>
                                    <p className="text-gray-500 mb-6">Start by creating your first module and lessons.</p>
                                    <Button className="bg-blue-600" onClick={() => setIsAddModuleOpen(true)}>Request First Module Approval</Button>
                                </Card>
                            ) : (
                                course.course_modules.map((module, mIdx) => (
                                    <Card key={module.id} className="border-0 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                                    {module.module_number}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-gray-900">{module.module_name}</h3>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${module.approval_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                            module.approval_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {module.approval_status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{module.lessons?.length || 0} Lessons</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-8 gap-2 px-3 text-xs font-bold transition-all ${module.visibility === 'PUBLIC' ? 'text-blue-600 hover:bg-blue-50' :
                                                        module.visibility === 'ENROLLED' ? 'text-green-600 hover:bg-green-50' :
                                                            'text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => togglePublish('module', module.id, module.visibility)}
                                                >
                                                    {module.visibility === 'PUBLIC' ? <Eye className="h-4 w-4 mr-1" /> :
                                                        module.visibility === 'ENROLLED' ? <CheckCircle2 className="h-4 w-4 mr-1" /> :
                                                            <EyeOff className="h-4 w-4 mr-1" />}
                                                    {module.visibility}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="divide-y">
                                            {module.lessons?.map((lesson, lIdx) => (
                                                <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            {lesson.lesson_number}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-semibold text-gray-800">{lesson.lesson_name}</h4>
                                                                <span className={`text-[8px] px-1 rounded uppercase font-bold ${lesson.visibility === 'PUBLIC' ? 'bg-blue-100 text-blue-600' :
                                                                    lesson.visibility === 'ENROLLED' ? 'bg-green-100 text-green-600' :
                                                                        'bg-orange-100 text-orange-600'
                                                                    }`}>
                                                                    {lesson.visibility}
                                                                </span>
                                                                <span className={`text-[8px] px-1 rounded uppercase font-black tracking-tighter ${lesson.approval_status === 'APPROVED' ? 'text-emerald-600' :
                                                                    lesson.approval_status === 'REJECTED' ? 'text-rose-600' :
                                                                        'text-amber-600'
                                                                    }`}>
                                                                    • {lesson.approval_status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                                                                <Clock className="h-2 w-2" />
                                                                {lesson.duration_minutes || 0}m • {lesson.lesson_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                            <PlayCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                className="w-full py-3 px-6 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                                                onClick={() => {
                                                    setSelectedModuleId(module.id);
                                                    setIsAddLessonOpen(true);
                                                }}
                                            >
                                                <Plus className="h-3 w-3" />
                                                Request Lesson Approval for this Module
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            )}
                            <Button
                                variant="outline"
                                className="w-full py-8 border-dashed border-2 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all"
                                onClick={() => setIsAddModuleOpen(true)}
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Request New Module Approval
                            </Button>
                        </motion.div>
                    )}

                    {activeTab === "students" && (
                        <motion.div
                            key="students"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">Assigned Student Tracking Coming Soon</h3>
                            <p className="text-gray-500">Student enrollment and progress tracking for this course.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layout className="h-5 w-5 text-blue-600" />
                            Request New Module Approval
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="module_name">Module Name</Label>
                            <Input
                                id="module_name"
                                placeholder="e.g., Introduction to React"
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                            <Info className="h-5 w-5 text-amber-600 shrink-0" />
                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                <span className="font-bold block uppercase tracking-tighter mb-0.5">Approval Workflow:</span>
                                New modules will be sent to the Academic Manager for review. Once approved, you can start adding lessons.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600"
                            onClick={handleAddModule}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Module"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5 text-blue-600" />
                            Request New Lesson Approval
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Lesson Name</Label>
                                <Input
                                    placeholder="Lesson title"
                                    value={lessonData.lesson_name}
                                    onChange={(e) => setLessonData({ ...lessonData, lesson_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Lesson Type</Label>
                                <Select
                                    value={lessonData.lesson_type}
                                    onValueChange={(v) => setLessonData({ ...lessonData, lesson_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIDEO">Video Lecture</SelectItem>
                                        <SelectItem value="DOCUMENT">Document / Text</SelectItem>
                                        <SelectItem value="OFFLINE">Offline Link</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Duration (Minutes)</Label>
                            <Input
                                type="number"
                                value={lessonData.duration_minutes}
                                onChange={(e) => setLessonData({ ...lessonData, duration_minutes: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Brief Content Description</Label>
                            <Textarea
                                placeholder="What will students learn in this lesson?"
                                className="h-24 resize-none"
                                value={lessonData.content_body}
                                onChange={(e) => setLessonData({ ...lessonData, content_body: e.target.value })}
                            />
                        </div>

                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                            <BrainCircuit className="h-5 w-5 text-blue-600 shrink-0" />
                            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                                <span className="font-bold block uppercase tracking-tighter mb-0.5">Manager Review Required:</span>
                                Lessons are automatically marked as 'Pending Approval'. They will appear in the Academic Manager's dashboard for verification.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600"
                            onClick={handleAddLesson}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Approval"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TutorBottomNav />
        </div>
    );
}
