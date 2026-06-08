"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    FileText,
    Plus,
    Search,
    Calendar,
    Clock,
    ArrowLeft,
    X,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Assignment {
    id: number;
    assignment_title: string;
    assignment_description: string;
    course_id: number;
    batch_id?: number;
    max_marks: number;
    deadline: string;
    status: string;
    submission_mode: "ONLINE" | "OFFLINE";
    submission_count?: number;
    courses?:
        | {
              course_name: string;
          }
        | { course_name: string }[];
    batches?:
        | {
              batch_name: string;
          }
        | { batch_name: string }[];
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

interface Batch {
    id: number;
    batch_name: string;
    course_id: number;
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allBatches, setAllBatches] = useState<Batch[]>([]); // Prefetched all batches
    const [batches, setBatches] = useState<Batch[]>([]); // Filtered batches for UI
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        assignment_title: "",
        assignment_description: "",
        course_id: "",
        batch_id: "",
        submission_mode: "ONLINE",
        max_marks: 100,
        deadline: "",
        instructions: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAssignments(),
                fetchCourses(),
                fetchAllBatches(),
            ]);
        } catch (error) {
            console.error("❌ [Assignments] Load Data Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/assignments?_t=${Date.now()}`);
            if (response.data.success) {
                setAssignments(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    const [debugInfo, setDebugInfo] = useState<any>(null);

    const fetchCourses = async () => {
        try {
            console.log("Fetching courses with timestamp:", Date.now());
            setLoading(true);
            const response = await api.get(`/ems/courses?_t=${Date.now()}`);

            // Capture debug info from backend + local context
            const companyId = Cookies.get("x-company-id");
            const backendDebug = response.data.meta?.debug || {};

            setDebugInfo({
                status: response.status,
                success: response.data.success,
                count: response.data.data?.length,
                companyId: companyId || "missing",
                lastFetch: new Date().toLocaleTimeString(),
                message: response.data.message,
                ...backendDebug, // Spread backend debug info (userId, role, rawCount)
            });

            if (response.data.success) {
                console.log(
                    "Courses fetched:",
                    response.data.data?.length,
                    "Debug:",
                    backendDebug,
                );
                const coursesList = response.data.data || [];
                setCourses(coursesList);
                if (coursesList.length === 0) {
                    toast.warning("No courses found for this company context.");
                }
            } else {
                console.warn("Failed to fetch courses:", response.data.message);
                toast.error(`Failed to load courses: ${response.data.message}`);
            }
        } catch (error: any) {
            console.error("Error fetching courses:", error);
            setDebugInfo({
                status: "ERROR",
                error: error.message,
                companyId: Cookies.get("x-company-id") || "missing",
                lastFetch: new Date().toLocaleTimeString(),
            });
            toast.error("Error loading courses. Check console/debug info.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllBatches = async () => {
        try {
            // Fetch all batches for this company once
            const response = await api.get("/ems/batches");
            if (response.data.success) {
                setAllBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("❌ [Assignments] All Batches Fetch Error:", error);
        }
    };

    // Fast Local Filter
    useEffect(() => {
        if (formData.course_id) {
            const courseIdNum = parseInt(formData.course_id);
            const filtered = allBatches.filter(
                (b) => b.course_id === courseIdNum,
            );
            setBatches(filtered);

            // Auto-reset batch_id if it's not in the new filtered list
            if (
                formData.batch_id &&
                !filtered.find((f) => f.id === parseInt(formData.batch_id))
            ) {
                setFormData((prev) => ({ ...prev, batch_id: "" }));
            }
        } else {
            setBatches([]);
        }
    }, [formData.course_id, allBatches]);

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                assignment_description: formData.instructions
                    ? `${formData.assignment_description}\n\nInstructions:\n${formData.instructions}`
                    : formData.assignment_description,
                course_id: parseInt(formData.course_id),
                batch_id: formData.batch_id
                    ? parseInt(formData.batch_id)
                    : null,
            };
            // Remove instructions as it's not in the schema
            delete (payload as any).instructions;

            const response = await api.post("/ems/assignments", payload);

            if (response.data.success) {
                toast.success("Assignment created successfully");
                setShowCreateForm(false);
                fetchAssignments();
                setFormData({
                    assignment_title: "",
                    assignment_description: "",
                    course_id: "",
                    batch_id: "",
                    submission_mode: "ONLINE",
                    max_marks: 100,
                    deadline: "",
                    instructions: "",
                });
            }
        } catch (error: any) {
            console.error("Error creating assignment:", error);
            toast.error(
                error.response?.data?.message || "Failed to create assignment",
            );
        }
    };

    // Refetch courses when modal opens to ensure up-to-date list
    useEffect(() => {
        if (showCreateForm) {
            fetchCourses();
        }
    }, [showCreateForm]);

    const filteredAssignments = assignments.filter((assignment) =>
        assignment.assignment_title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
    );

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

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
                                Assignments Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Create and manage course assignments
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Assignment
                        </Button>
                    </div>

                    <Card className="mb-6 border-0 shadow-md">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search assignments..."
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
                                Loading assignments...
                            </p>
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    No Assignments Yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first assignment to get started
                                </p>
                                <Button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Assignment
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredAssignments.map((assignment) => (
                                <div key={assignment.id}>
                                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="h-6 w-6 text-purple-600" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                                    {
                                                                        assignment.assignment_title
                                                                    }
                                                                </h3>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {(() => {
                                                                        const c =
                                                                            assignment.courses;
                                                                        const name =
                                                                            c
                                                                                ? Array.isArray(
                                                                                      c,
                                                                                  )
                                                                                    ? c[0]
                                                                                          ?.course_name
                                                                                    : c.course_name
                                                                                : null;
                                                                        return (
                                                                            <p className="text-sm text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                                                                                {name ||
                                                                                    "No course"}
                                                                            </p>
                                                                        );
                                                                    })()}

                                                                    {(() => {
                                                                        const b =
                                                                            assignment.batches;
                                                                        if (!b)
                                                                            return null;
                                                                        const name =
                                                                            Array.isArray(
                                                                                b,
                                                                            )
                                                                                ? b[0]
                                                                                      ?.batch_name
                                                                                : b.batch_name;
                                                                        if (
                                                                            !name
                                                                        )
                                                                            return null;
                                                                        return (
                                                                            <p className="text-sm text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                                                                                {
                                                                                    name
                                                                                }
                                                                            </p>
                                                                        );
                                                                    })()}
                                                                    <p
                                                                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border-2 ${
                                                                            assignment.submission_mode ===
                                                                            "ONLINE"
                                                                                ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                                                                                : "border-amber-200 text-amber-600 bg-amber-50"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            assignment.submission_mode
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    isOverdue(
                                                                        assignment.deadline,
                                                                    )
                                                                        ? "bg-red-100 text-red-700"
                                                                        : assignment.status ===
                                                                            "PUBLISHED"
                                                                          ? "bg-green-100 text-green-700"
                                                                          : "bg-yellow-100 text-yellow-700"
                                                                }`}
                                                            >
                                                                {isOverdue(
                                                                    assignment.deadline,
                                                                )
                                                                    ? "Overdue"
                                                                    : assignment.status}
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                            {
                                                                assignment.assignment_description
                                                            }
                                                        </p>

                                                        <div className="flex flex-wrap gap-4 text-sm">
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                                <span>
                                                                    Due:{" "}
                                                                    {new Date(
                                                                        assignment.deadline,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <CheckCircle className="h-4 w-4 text-gray-400" />
                                                                <span>
                                                                    {assignment.submission_count ||
                                                                        0}{" "}
                                                                    submissions
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <AlertCircle className="h-4 w-4 text-gray-400" />
                                                                <span>
                                                                    {
                                                                        assignment.max_marks
                                                                    }{" "}
                                                                    marks
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 ml-4">
                                                    <Link
                                                        href={`/ems/academic-manager/assignments/${assignment.id}`}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            View Students
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Edit
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

                {/* Create Assignment Modal */}
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
                                    Create New Assignment
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
                                onSubmit={handleCreateAssignment}
                                className="p-6 space-y-6"
                            >
                                <div>
                                    <Label htmlFor="assignment_title">
                                        Assignment Title *
                                    </Label>
                                    <Input
                                        id="assignment_title"
                                        required
                                        placeholder="e.g., HTML & CSS Project"
                                        value={formData.assignment_title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                assignment_title:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="assignment_description">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="assignment_description"
                                        required
                                        rows={4}
                                        placeholder="Describe the assignment requirements..."
                                        value={formData.assignment_description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                assignment_description:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
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
                                            disabled={courses.length === 0}
                                        >
                                            <option value="">
                                                {courses.length === 0
                                                    ? "No courses found"
                                                    : "Choose a course..."}
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => fetchCourses()}
                                        title="Refresh Courses"
                                        className="mb-0.5"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-rotate-cw"
                                        >
                                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                            <path d="M21 3v5h-5" />
                                        </svg>
                                    </Button>
                                </div>
                                {courses.length === 0 && (
                                    <div className="mt-2 text-xs">
                                        <p className="text-red-500 mb-1">
                                            No courses available.{" "}
                                            <Link
                                                href="/ems/academic-manager/courses"
                                                className="underline font-bold"
                                            >
                                                Create a course here
                                            </Link>{" "}
                                            first.
                                        </p>

                                        {/* Debug Info UI */}
                                        {debugInfo && (
                                            <div className="bg-gray-100 p-2 rounded border border-gray-200 font-mono text-[10px] text-gray-600">
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
                                                    <strong>Profile:</strong>{" "}
                                                    {debugInfo.profileType}
                                                </p>
                                                <p>
                                                    <strong>Raw Count:</strong>{" "}
                                                    {debugInfo.rawCount}
                                                </p>
                                                <p>
                                                    <strong>Time:</strong>{" "}
                                                    {debugInfo.lastFetch}
                                                </p>
                                                {debugInfo.error && (
                                                    <p className="text-red-600 font-bold">
                                                        {debugInfo.error}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="submission_mode">
                                            Submission Mode *
                                        </Label>
                                        <select
                                            id="submission_mode"
                                            required
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={formData.submission_mode}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    submission_mode:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="ONLINE">
                                                Online Portal
                                            </option>
                                            <option value="OFFLINE">
                                                Offline Submission
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label htmlFor="batch_id">
                                                Target Batch (Optional)
                                            </Label>
                                            <select
                                                id="batch_id"
                                                className="w-full h-10 px-3 rounded-md border border-gray-300"
                                                value={formData.batch_id}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        batch_id:
                                                            e.target.value,
                                                    })
                                                }
                                                disabled={!formData.course_id}
                                            >
                                                <option value="">
                                                    All Batches
                                                </option>
                                                {batches.map((batch) => (
                                                    <option
                                                        key={batch.id}
                                                        value={batch.id}
                                                    >
                                                        {batch.batch_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => fetchAllBatches()}
                                            title="Refresh Batches"
                                            className="mb-0.5"
                                            disabled={!formData.course_id}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-rotate-cw"
                                            >
                                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                                <path d="M21 3v5h-5" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="max_marks">
                                            Total Marks *
                                        </Label>
                                        <Input
                                            id="max_marks"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.max_marks}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    max_marks: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="deadline">
                                            Due Date *
                                        </Label>
                                        <Input
                                            id="deadline"
                                            type="datetime-local"
                                            required
                                            value={formData.deadline}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    deadline: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="instructions">
                                        Instructions
                                    </Label>
                                    <Textarea
                                        id="instructions"
                                        rows={3}
                                        placeholder="Additional instructions for students..."
                                        value={formData.instructions}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                instructions: e.target.value,
                                            })
                                        }
                                    />
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
                                        Create Assignment
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
