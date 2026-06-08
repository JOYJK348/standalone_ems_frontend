"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ClipboardCheck,
    Plus,
    Search,
    Clock,
    Target,
    ArrowLeft,
    X,
    Edit,
    Trash2,
    Eye,
    CheckCircle2,
    Hammer,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    course_id: number;
    total_marks: number;
    duration_minutes: number;
    max_attempts: number;
    status: string;
    total_questions?: number;
    question_count?: number;
    courses?: {
        course_name: string;
        tutors?: Array<{
            tutor_id: number;
            employees?: {
                first_name: string;
                last_name?: string;
                employee_code: string;
            };
        }>;
        enrollments?: Array<{
            student_id: number;
            students: { first_name: string; last_name: string };
        }>;
    };
    quiz_assignments?: Array<{
        batch_id?: number;
        student_id?: number;
        batches?: { id: number; batch_name: string };
        students?: { id: number; first_name: string; last_name: string };
    }>;
    quiz_questions?: Array<{ id: number }>;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
}

interface Batch {
    id: number;
    batch_name: string;
    batch_code: string;
}

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        quiz_title: "",
        quiz_description: "",
        course_id: "",
        total_marks: 100,
        duration_minutes: 60,
        max_attempts: 3,
        passing_marks: 40,
        start_datetime: "",
        end_datetime: "",
        assignment_type: "ALL", // ALL, BATCH, STUDENT
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

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/quizzes");
            if (response.data.success) {
                setQuizzes(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
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

    const fetchBatches = async (courseId: string) => {
        try {
            const response = await api.get(
                `/ems/batches?course_id=${courseId}`,
            );
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchStudents = async (courseId: string) => {
        try {
            const response = await api.get(
                `/ems/students?course_id=${courseId}`,
            );
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const openEditModal = (quiz: Quiz) => {
        setEditingQuiz(quiz);

        // Find existing assignment
        let type = "ALL";
        let bId = "";
        let sId = "";

        if (quiz.quiz_assignments && quiz.quiz_assignments.length > 0) {
            const asg = quiz.quiz_assignments[0];
            if (asg.batch_id) {
                type = "BATCH";
                bId = asg.batch_id.toString();
            } else if (asg.student_id) {
                type = "STUDENT";
                sId = asg.student_id.toString();
            }
        }

        setFormData({
            quiz_title: quiz.quiz_title,
            quiz_description: quiz.quiz_description || "",
            course_id: quiz.course_id.toString(),
            total_marks: quiz.total_marks,
            duration_minutes: quiz.duration_minutes,
            max_attempts: quiz.max_attempts,
            passing_marks: 40, // Should ideally be in the database
            start_datetime: "",
            end_datetime: "",
            assignment_type: type,
            selected_batch_id: bId,
            selected_student_id: sId,
        });
        setShowCreateForm(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const assignments = [];
            if (
                formData.assignment_type === "BATCH" &&
                formData.selected_batch_id
            ) {
                assignments.push({
                    batch_id: parseInt(formData.selected_batch_id),
                });
            } else if (
                formData.assignment_type === "STUDENT" &&
                formData.selected_student_id
            ) {
                assignments.push({
                    student_id: parseInt(formData.selected_student_id),
                });
            } else if (formData.assignment_type === "ALL") {
                // For 'ALL', we send an empty array to clear assignments in update
                // or just don't send assignments for create (defaults to course-wide)
            }

            const {
                assignment_type,
                selected_batch_id,
                selected_student_id,
                ...quizData
            } = formData;

            // Clean payload: converted empty strings to null for dates
            const payload = {
                ...quizData,
                course_id: parseInt(formData.course_id),
                total_marks: parseInt(formData.total_marks.toString()),
                duration_minutes: parseInt(
                    formData.duration_minutes.toString(),
                ),
                max_attempts: parseInt(formData.max_attempts.toString()),
                passing_marks: parseInt(formData.passing_marks.toString()),
                start_datetime: formData.start_datetime || null,
                end_datetime: formData.end_datetime || null,
                assignments: assignments,
            };

            const response = editingQuiz
                ? await api.patch(`/ems/quizzes/${editingQuiz.id}`, payload)
                : await api.post("/ems/quizzes", payload);

            if (response.data.success) {
                toast.success(
                    editingQuiz
                        ? "Quiz updated successfully"
                        : "Quiz created successfully",
                );
                setShowCreateForm(false);
                setEditingQuiz(null);
                fetchQuizzes();
                setFormData({
                    quiz_title: "",
                    quiz_description: "",
                    course_id: "",
                    total_marks: 100,
                    duration_minutes: 60,
                    max_attempts: 3,
                    passing_marks: 40,
                    start_datetime: "",
                    end_datetime: "",
                    assignment_type: "ALL",
                    selected_batch_id: "",
                    selected_student_id: "",
                });
            }
        } catch (error: any) {
            console.error("Error saving quiz:", error);
            toast.error(error.response?.data?.message || "Failed to save quiz");
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
        } catch (error: any) {
            console.error("Error deleting quiz:", error);
            toast.error(
                error.response?.data?.message || "Failed to delete quiz",
            );
        }
    };

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.quiz_title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex items-center justify-between mb-6">
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
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                Quizzes & Assessments
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Create and manage quizzes for your courses
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingQuiz(null);
                                setShowCreateForm(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Quiz
                        </Button>
                    </div>

                    <Card className="mb-6 border-0 shadow-md">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search quizzes..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">
                                Loading quizzes...
                            </p>
                        </div>
                    ) : filteredQuizzes.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <ClipboardCheck className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    No Quizzes Yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first quiz to assess student
                                    learning
                                </p>
                                <Button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Quiz
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map((quiz) => (
                                <div key={quiz.id}>
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <ClipboardCheck className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        quiz.status ===
                                                        "PUBLISHED"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {quiz.status}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                {quiz.quiz_title}
                                            </h3>
                                            <p className="text-sm text-purple-600 font-medium mb-3">
                                                {quiz.courses?.course_name ||
                                                    "No course"}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {quiz.quiz_description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        {quiz.duration_minutes}{" "}
                                                        min
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        {quiz.total_marks} marks
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-gray-600">
                                                    {quiz.total_questions ||
                                                        quiz.quiz_questions
                                                            ?.length ||
                                                        0}{" "}
                                                    questions •{" "}
                                                    {quiz.max_attempts} attempts
                                                </div>
                                            </div>

                                            {/* Assignments & Tutors Section */}
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                                                    Target Students
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {quiz.quiz_assignments &&
                                                    quiz.quiz_assignments
                                                        .length > 0 ? (
                                                        quiz.quiz_assignments.map(
                                                            (asg, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded border border-purple-100 font-medium"
                                                                >
                                                                    {asg.batches
                                                                        ? `Batch: ${asg.batches.batch_name}`
                                                                        : asg.students
                                                                          ? `Student: ${asg.students.first_name} ${asg.students.last_name || ""}`
                                                                          : "Assigned"}
                                                                </span>
                                                            ),
                                                        )
                                                    ) : quiz.courses
                                                          ?.enrollments &&
                                                      quiz.courses.enrollments
                                                          .length > 0 ? (
                                                        quiz.courses.enrollments.map(
                                                            (enr, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded border border-green-100 font-medium"
                                                                >
                                                                    {
                                                                        enr
                                                                            .students
                                                                            ?.first_name
                                                                    }{" "}
                                                                    {enr
                                                                        .students
                                                                        ?.last_name ||
                                                                        ""}
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px] italic">
                                                            No students enrolled
                                                            in course
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                                                    Assigned Tutors
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {quiz.courses?.tutors &&
                                                    quiz.courses.tutors.length >
                                                        0 ? (
                                                        quiz.courses.tutors.map(
                                                            (t, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-medium"
                                                                >
                                                                    {t.employees
                                                                        ? `${t.employees.first_name} ${t.employees.last_name || ""}`
                                                                        : "Unnamed Tutor"}
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px] italic">
                                                            No tutors assigned
                                                            yet
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                                    onClick={() =>
                                                        openEditModal(quiz)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit Info
                                                </Button>
                                                <Link
                                                    href={`/ems/academic-manager/quizzes/builder?id=${quiz.id}`}
                                                    className="w-full"
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        <Hammer className="h-4 w-4 mr-1" />
                                                        Questions
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={`/ems/academic-manager/quizzes/${quiz.id}/results`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Results
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={`/ems/academic-manager/quizzes/view?id=${quiz.id}`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Review
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-red-600 hover:text-red-700"
                                                    onClick={() =>
                                                        handleDelete(quiz.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Quiz Modal */}
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
                                    {editingQuiz
                                        ? "Edit Quiz Details"
                                        : "Create New Quiz"}
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
                                onSubmit={handleFormSubmit}
                                className="p-6 space-y-6"
                            >
                                <div>
                                    <Label htmlFor="quiz_title">
                                        Quiz Title *
                                    </Label>
                                    <Input
                                        id="quiz_title"
                                        required
                                        placeholder="e.g., JavaScript Fundamentals Quiz"
                                        value={formData.quiz_title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quiz_title: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="quiz_description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="quiz_description"
                                        rows={3}
                                        placeholder="Describe what this quiz covers..."
                                        value={formData.quiz_description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quiz_description:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="course_id">
                                        Select Course *
                                    </Label>
                                    <select
                                        id="course_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={formData.course_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                course_id: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Choose a course...
                                        </option>
                                        {courses.map((course) => (
                                            <option
                                                key={course.id}
                                                value={course.id}
                                            >
                                                {course.course_name} (
                                                {course.course_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div>
                                        <Label>Assign To</Label>
                                        <div className="flex gap-4 mt-2">
                                            {["ALL", "BATCH", "STUDENT"].map(
                                                (type) => (
                                                    <label
                                                        key={type}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="assignment_type"
                                                            value={type}
                                                            checked={
                                                                formData.assignment_type ===
                                                                type
                                                            }
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    assignment_type:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            className="text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                                            {type === "ALL"
                                                                ? "All Students"
                                                                : type.toLowerCase()}
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {formData.assignment_type === "BATCH" && (
                                        <div>
                                            <Label htmlFor="batch_id">
                                                Select Batch *
                                            </Label>
                                            <select
                                                id="batch_id"
                                                required
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                                                value={
                                                    formData.selected_batch_id
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        selected_batch_id:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Choose a batch...
                                                </option>
                                                {batches.map((batch) => (
                                                    <option
                                                        key={batch.id}
                                                        value={batch.id}
                                                    >
                                                        {batch.batch_name} (
                                                        {batch.batch_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.assignment_type === "STUDENT" && (
                                        <div>
                                            <Label htmlFor="student_id">
                                                Select Student *
                                            </Label>
                                            <select
                                                id="student_id"
                                                required
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1"
                                                value={
                                                    formData.selected_student_id
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        selected_student_id:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Choose a student...
                                                </option>
                                                {students.map((student) => (
                                                    <option
                                                        key={student.id}
                                                        value={student.id}
                                                    >
                                                        {student.first_name}{" "}
                                                        {student.last_name} (
                                                        {student.student_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="total_marks">
                                            Total Marks *
                                        </Label>
                                        <Input
                                            id="total_marks"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.total_marks}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    total_marks: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="passing_marks">
                                            Passing Marks *
                                        </Label>
                                        <Input
                                            id="passing_marks"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.passing_marks}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    passing_marks: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="duration_minutes">
                                            Duration (Minutes) *
                                        </Label>
                                        <Input
                                            id="duration_minutes"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.duration_minutes}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    duration_minutes: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="max_attempts">
                                            Max Attempts *
                                        </Label>
                                        <Input
                                            id="max_attempts"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.max_attempts}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    max_attempts: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_datetime">
                                            Start Date & Time
                                        </Label>
                                        <Input
                                            id="start_datetime"
                                            type="datetime-local"
                                            value={formData.start_datetime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    start_datetime:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            When quiz becomes available
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="end_datetime">
                                            End Date & Time
                                        </Label>
                                        <Input
                                            id="end_datetime"
                                            type="datetime-local"
                                            value={formData.end_datetime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    end_datetime:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            When quiz closes
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        💡 After creating the quiz, you can add
                                        questions from the quiz details page.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        {editingQuiz
                                            ? "Update Quiz"
                                            : "Create Quiz"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AcademicManagerLayout>
        </div>
    );
}
