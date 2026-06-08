"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Clock,
    CheckCircle2,
    Loader2,
    Hammer,
    X,
    Target,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    course_id: number;
    total_marks: number;
    pass_marks: number;
    duration_minutes: number;
    max_attempts?: number;
    total_questions?: number;
    is_active: boolean;
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    courses?: {
        course_name: string;
        course_code: string;
        tutors?: Array<{
            tutor_id: number;
            employees?: { first_name: string, last_name?: string };
        }>;
        enrollments?: Array<{
            student_id: number;
            students: { first_name: string, last_name: string };
        }>;
    };
    quiz_assignments?: Array<{
        batch_id?: number;
        student_id?: number;
        batches?: { id: number, batch_name: string };
        students?: { id: number, first_name: string, last_name: string };
    }>;
    quiz_questions?: Array<{ id: number }>;
}

export default function TutorQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        quiz_title: "",
        quiz_description: "",
        course_id: "",
        total_marks: 100,
        duration_minutes: 60,
        max_attempts: 3,
        passing_marks: 40,
        assignment_type: 'ALL',
        selected_batch_id: "",
        selected_student_id: "",
    });

    useEffect(() => {
        fetchQuizzes();
        fetchCourses();
    }, []);

    useEffect(() => {
        if (formData.course_id) {
            fetchBatches(formData.course_id);
            fetchStudents(formData.course_id);
        }
    }, [formData.course_id]);

    const fetchBatches = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchStudents = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/students?course_id=${courseId}`);
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get("/ems/courses");
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/quizzes");
            if (response.data.success) {
                setQuizzes(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching quizzes:", error);
            toast.error(error.response?.data?.message || "Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const response = await api.delete(`/ems/quizzes/${id}`);
            if (response.data.success) {
                toast.success("Quiz deleted successfully");
                fetchQuizzes();
            }
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error("Failed to delete quiz");
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const assignments = [];
            if (formData.assignment_type === 'BATCH' && formData.selected_batch_id) {
                assignments.push({ batch_id: parseInt(formData.selected_batch_id) });
            } else if (formData.assignment_type === 'STUDENT' && formData.selected_student_id) {
                assignments.push({ student_id: parseInt(formData.selected_student_id) });
            }

            const { assignment_type, selected_batch_id, selected_student_id, ...quizData } = formData;

            // Clean payload: converted empty strings to null for dates
            const payload = {
                ...quizData,
                course_id: parseInt(formData.course_id),
                total_marks: parseInt(formData.total_marks.toString()),
                duration_minutes: parseInt(formData.duration_minutes.toString()),
                max_attempts: parseInt(formData.max_attempts.toString()),
                passing_marks: parseInt(formData.passing_marks.toString()),
                start_datetime: (formData as any).start_datetime || null,
                end_datetime: (formData as any).end_datetime || null,
                assignments: assignments
            };

            const response = editingQuiz
                ? await api.patch(`/ems/quizzes/${editingQuiz.id}`, payload)
                : await api.post("/ems/quizzes", payload);

            if (response.data.success) {
                toast.success(editingQuiz ? "Quiz updated successfully" : "Quiz created successfully");
                setShowModal(false);
                setEditingQuiz(null);
                resetForm();
                fetchQuizzes();
            }
        } catch (error: any) {
            console.error("Error saving quiz:", error);
            toast.error(error.response?.data?.message || "Failed to save quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setEditingQuiz(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (quiz: Quiz) => {
        // Find existing assignment
        let type = 'ALL';
        let bId = "";
        let sId = "";

        if (quiz.quiz_assignments && quiz.quiz_assignments.length > 0) {
            const asg = quiz.quiz_assignments[0];
            if (asg.batch_id) {
                type = 'BATCH';
                bId = asg.batch_id.toString();
            } else if (asg.student_id) {
                type = 'STUDENT';
                sId = asg.student_id.toString();
            }
        }

        setFormData({
            quiz_title: quiz.quiz_title,
            quiz_description: quiz.quiz_description || "",
            course_id: quiz.course_id.toString(),
            total_marks: quiz.total_marks,
            duration_minutes: quiz.duration_minutes,
            max_attempts: quiz.max_attempts || 3,
            passing_marks: quiz.pass_marks || 40,
            assignment_type: type,
            selected_batch_id: bId,
            selected_student_id: sId,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            quiz_title: "",
            quiz_description: "",
            course_id: "",
            total_marks: 100,
            duration_minutes: 60,
            max_attempts: 3,
            passing_marks: 40,
            assignment_type: 'ALL',
            selected_batch_id: "",
            selected_student_id: "",
        });
    };

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            My Quizzes
                        </h1>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Request Quiz Approval
                    </Button>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search quizzes..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quizzes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading quizzes...</span>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <BookOpen className="h-20 w-20 text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Quizzes Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first quiz to assess student learning
                            </p>
                            <Button
                                onClick={openCreateModal}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Request First Quiz Approval
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${quiz.approval_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                        quiz.approval_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}
                                                >
                                                    {quiz.approval_status}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-medium ${quiz.is_active
                                                        ? "bg-green-50 text-green-600"
                                                        : "bg-gray-50 text-gray-500"
                                                        }`}
                                                >
                                                    {quiz.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg mt-3 line-clamp-2">
                                            {quiz.quiz_title}
                                        </CardTitle>
                                        {quiz.courses && (
                                            <p className="text-sm text-blue-600 font-medium">
                                                {quiz.courses.course_name}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {quiz.quiz_description || "No description"}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 font-semibold">{quiz.total_marks} marks</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 font-semibold">{quiz.duration_minutes}m</span>
                                            </div>
                                            <div className="col-span-2 text-gray-600 text-xs">
                                                {quiz.total_questions || quiz.quiz_questions?.length || 0} questions • {quiz.max_attempts} attempts
                                            </div>
                                        </div>

                                        {/* Assignments Section */}
                                        <div className="space-y-3 pt-3 border-t border-gray-100 mb-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Target Students</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {quiz.quiz_assignments && quiz.quiz_assignments.length > 0 ? (
                                                        quiz.quiz_assignments.map((asg, idx) => (
                                                            <span key={idx} className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded border border-purple-100 font-medium">
                                                                {asg.batches ? `Batch: ${asg.batches.batch_name}` :
                                                                    asg.students ? `Student: ${asg.students.first_name} ${asg.students.last_name || ''}` :
                                                                        'Assigned'}
                                                            </span>
                                                        ))
                                                    ) : quiz.courses?.enrollments && quiz.courses.enrollments.length > 0 ? (
                                                        quiz.courses.enrollments.map((enr, idx) => (
                                                            <span key={idx} className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded border border-green-100 font-medium">
                                                                {enr.students?.first_name} {enr.students?.last_name || ''}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px] italic">No students enrolled</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Assigned Tutors</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {quiz.courses?.tutors && quiz.courses.tutors.length > 0 ? (
                                                        quiz.courses.tutors.map((t, idx) => (
                                                            <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-medium">
                                                                {t.employees ? `${t.employees.first_name} ${t.employees.last_name || ''}` : 'Unnamed Tutor'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px] italic">No tutors assigned yet</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="grid grid-cols-3 gap-2 w-full">
                                                <Link href={`/ems/tutor/quizzes/view?id=${quiz.id}`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={`/ems/tutor/quizzes/builder?id=${quiz.id}`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                                                        <Hammer className="h-4 w-4 mr-1" />
                                                        Build
                                                    </Button>
                                                </Link>
                                                <Link href={`/ems/tutor/quizzes/${quiz.id}/results`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Results
                                                    </Button>
                                                </Link>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => openEditModal(quiz)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDelete(quiz.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingQuiz ? "Edit Quiz" : "Request New Quiz Approval"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                            Quiz Title
                                        </label>
                                        <Input
                                            required
                                            placeholder="e.g. Midterm Assessment"
                                            value={formData.quiz_title}
                                            onChange={(e) => setFormData({ ...formData, quiz_title: e.target.value })}
                                            className="h-12 border-gray-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="What is this quiz about?"
                                            value={formData.quiz_description}
                                            onChange={(e) => setFormData({ ...formData, quiz_description: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                            Assigned Course
                                        </label>
                                        <select
                                            required
                                            value={formData.course_id}
                                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                            className="w-full h-12 rounded-lg border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="">Select a course</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.course_name} ({course.course_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div>
                                            <Label>Assign To</Label>
                                            <div className="flex gap-4 mt-2">
                                                {['ALL', 'BATCH', 'STUDENT'].map((type) => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="assignment_type"
                                                            value={type}
                                                            checked={formData.assignment_type === type}
                                                            onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                                                            className="text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                                            {type === 'ALL' ? 'All Students' : type.toLowerCase()}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.assignment_type === 'BATCH' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                <Label htmlFor="batch_id">Select Batch *</Label>
                                                <select
                                                    id="batch_id"
                                                    required
                                                    className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                                                    value={formData.selected_batch_id}
                                                    onChange={(e) => setFormData({ ...formData, selected_batch_id: e.target.value })}
                                                >
                                                    <option value="">Choose a batch...</option>
                                                    {batches.map((batch) => (
                                                        <option key={batch.id} value={batch.id}>
                                                            {batch.batch_name} ({batch.batch_code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </motion.div>
                                        )}

                                        {formData.assignment_type === 'STUDENT' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                <Label htmlFor="student_id">Select Student *</Label>
                                                <select
                                                    id="student_id"
                                                    required
                                                    className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                                                    value={formData.selected_student_id}
                                                    onChange={(e) => setFormData({ ...formData, selected_student_id: e.target.value })}
                                                >
                                                    <option value="">Choose a student...</option>
                                                    {students.map((student) => (
                                                        <option key={student.id} value={student.id}>
                                                            {student.first_name} {student.last_name} ({student.student_code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Total Marks
                                            </label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={formData.total_marks}
                                                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Passing Marks
                                            </label>
                                            <Input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.passing_marks}
                                                onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) })}
                                                className="h-12 border-gray-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Duration (min)
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={formData.duration_minutes}
                                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                                                Max Attempts
                                            </label>
                                            <Input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.max_attempts}
                                                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                                                className="h-12 border-gray-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            editingQuiz ? "Update Quiz" : "Submit for Approval"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TutorBottomNav />
        </div>
    );
}
