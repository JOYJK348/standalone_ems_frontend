"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    Plus,
    Search,
    UserPlus,
    Mail,
    Phone,
    ArrowLeft,
    X,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    CheckCircle2,
    Copy,
    ShieldCheck,
    Key,
    Lock,
    Zap,
    TrendingUp,
    RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    date_of_birth: string;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

interface Batch {
    id: number;
    batch_name: string;
    batch_code: string;
    course_id: number;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEnrollForm, setShowEnrollForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showPracticeModal, setShowPracticeModal] = useState(false);
    const [allocating, setAllocating] = useState(false);
    const [studentAllocations, setStudentAllocations] = useState<any[]>([]);

    const [studentFormData, setStudentFormData] = useState({
        student_code: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "MALE",
        password: "Student@123", // Default password
    });

    const [enrollFormData, setEnrollFormData] = useState({
        student_id: "",
        course_id: "",
        batch_id: "",
        payment_status: "PENDING",
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/students");
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
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

    const fetchBatchesByCourse = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/students", studentFormData);

            if (response.data.success) {
                const credentials = response.data.data.login_credentials;
                const studentName = `${response.data.data.first_name} ${response.data.data.last_name}`;

                setGeneratedCredentials({
                    ...credentials,
                    name: studentName
                });

                setShowCreateForm(false);
                setShowSuccessModal(true);
                fetchStudents();
                // Reset form
                setStudentFormData({
                    student_code: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    date_of_birth: "",
                    gender: "MALE",
                    password: "Student@123",
                });
            }
        } catch (error) {
            console.error("Error creating student:", error);
        }
    };

    const handleEnrollStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/enrollments", {
                ...enrollFormData,
                student_id: enrollFormData.student_id ? parseInt(enrollFormData.student_id) : null,
                course_id: enrollFormData.course_id ? parseInt(enrollFormData.course_id) : null,
                batch_id: enrollFormData.batch_id ? parseInt(enrollFormData.batch_id) : null,
            });

            if (response.data.success) {
                setShowEnrollForm(false);
                setSelectedStudent(null);
                // Reset form
                setEnrollFormData({
                    student_id: "",
                    course_id: "",
                    batch_id: "",
                    payment_status: "PENDING",
                });
                toast.success("Student enrolled successfully!");
            }
        } catch (error) {
            console.error("Error enrolling student:", error);
            toast.error("Failed to enroll student");
        }
    };

    const handleAllocatePractice = async (studentId: number, moduleType: string) => {
        try {
            setAllocating(true);
            const response = await api.post("/ems/practice/allocate", {
                studentId,
                moduleType,
                courseId: enrollFormData.course_id || 1, // Fallback if needed, but ideally we know the course
            });

            if (response.data.success) {
                toast.success(`${moduleType} Lab allocated successfully!`);
                fetchStudentAllocations(studentId);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to allocate lab");
        } finally {
            setAllocating(false);
        }
    };

    const handleResetPractice = async (allocationId: number) => {
        try {
            setAllocating(true);
            const response = await api.post('/ems/practice/manager/reset', { allocationId });
            if (response.data.success) {
                toast.success("Practice limit reset!");
                if (selectedStudent) fetchStudentAllocations(selectedStudent);
            }
        } catch (error) {
            toast.error("Failed to reset limit");
        } finally {
            setAllocating(false);
        }
    };

    const fetchStudentAllocations = async (studentId: number) => {
        try {
            // This is a custom endpoint we should have or we can filter from /api/ems/practice/dashboard results
            const response = await api.get(`/ems/practice/student/status?student_id=${studentId}`);
            if (response.data.success) {
                setStudentAllocations(response.data.data || []);
            }
        } catch (err) { }
    };

    const openPracticeModal = (studentId: number) => {
        setSelectedStudent(studentId);
        fetchStudentAllocations(studentId);
        setShowPracticeModal(true);
    };

    const openEnrollForm = (studentId: number) => {
        setSelectedStudent(studentId);
        setEnrollFormData({ ...enrollFormData, student_id: studentId.toString() });
        setShowEnrollForm(true);
    };

    const filteredStudents = students.filter((student) =>
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Students Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage student records and enrollments
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search students by name, email, or code..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Users className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Students Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Add your first student to get started
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Student
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg group-hover:scale-110 transition-transform">
                                                {student.first_name.charAt(0)}{student.last_name?.charAt(0)}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {student.first_name} {student.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            ID: {student.student_code}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">{student.email || 'No email'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{student.phone || 'No phone'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                onClick={() => openEnrollForm(student.id)}
                                            >
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                Enroll
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100"
                                                onClick={() => openPracticeModal(student.id)}
                                            >
                                                <Zap className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Student Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Add New Student
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateStudent} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="student_code">Student Code *</Label>
                                        <Input
                                            id="student_code"
                                            required
                                            placeholder="e.g., STU001"
                                            value={studentFormData.student_code}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, student_code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Gender *</Label>
                                        <select
                                            id="gender"
                                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                                            value={studentFormData.gender}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value })}
                                        >
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            required
                                            placeholder="John"
                                            value={studentFormData.first_name}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            placeholder="Doe"
                                            value={studentFormData.last_name}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="student@example.com"
                                            value={studentFormData.email}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            value={studentFormData.phone}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={studentFormData.date_of_birth}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, date_of_birth: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Login Password *</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            required
                                            placeholder="Set a password for student"
                                            value={studentFormData.password}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Default: Student@123</p>
                                    </div>
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
                                        Add Student
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enroll Student Modal */}
            <AnimatePresence>
                {showEnrollForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowEnrollForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Enroll Student
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowEnrollForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleEnrollStudent} className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="enroll_course_id">Select Course *</Label>
                                    <select
                                        id="enroll_course_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={enrollFormData.course_id}
                                        onChange={(e) => {
                                            setEnrollFormData({ ...enrollFormData, course_id: e.target.value, batch_id: "" });
                                            fetchBatchesByCourse(e.target.value);
                                        }}
                                    >
                                        <option value="">Choose a course...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="enroll_batch_id">Select Batch *</Label>
                                    <select
                                        id="enroll_batch_id"
                                        required
                                        disabled={!enrollFormData.course_id}
                                        className="w-full h-10 px-3 rounded-md border border-gray-300 disabled:bg-gray-100"
                                        value={enrollFormData.batch_id}
                                        onChange={(e) => setEnrollFormData({ ...enrollFormData, batch_id: e.target.value })}
                                    >
                                        <option value="">Choose a batch...</option>
                                        {batches.map((batch) => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.batch_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="payment_status">Payment Status *</Label>
                                    <select
                                        id="payment_status"
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={enrollFormData.payment_status}
                                        onChange={(e) => setEnrollFormData({ ...enrollFormData, payment_status: e.target.value })}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="PARTIAL">Partial</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowEnrollForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Enroll Student
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login Credentials Success Modal */}
            <AnimatePresence>
                {showSuccessModal && generatedCredentials && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Header with Success Animation */}
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-8 text-center text-white relative">
                                <div className="absolute top-4 right-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                                        onClick={() => setShowSuccessModal(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-md">
                                    <ShieldCheck className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-1">Admission Successful!</h2>
                                <p className="text-green-50/80 text-sm">Student account has been created</p>
                            </div>

                            {/* Credentials Body */}
                            <div className="p-8 font-sans">
                                <div className="space-y-6 text-left">
                                    <div>
                                        <Label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Student Name</Label>
                                        <p className="text-lg font-extrabold text-gray-900 leading-none">{generatedCredentials.name}</p>
                                    </div>

                                    <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 space-y-5">
                                        <div className="flex items-center justify-between group">
                                            <div>
                                                <Label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Login Username</Label>
                                                <p className="font-mono font-bold text-gray-800 text-sm">{generatedCredentials.student_code}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedCredentials.student_code);
                                                    toast.success("Username copied!");
                                                }}
                                            >
                                                <Copy className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between group">
                                            <div>
                                                <Label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Initial Password</Label>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Lock className="h-3 w-3 text-orange-500" />
                                                    <p className="font-mono font-bold text-gray-800">{generatedCredentials.password}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedCredentials.password);
                                                    toast.success("Password copied!");
                                                }}
                                            >
                                                <Copy className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl text-blue-700 text-[11px] leading-relaxed">
                                            <Key className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                            <p>Account secured and ready. share the "Welcome Kit" below with the student for their first login.</p>
                                        </div>
                                        <Button
                                            type="button"
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-7 rounded-2xl font-bold mt-2 shadow-lg shadow-purple-200 h-auto"
                                            onClick={() => {
                                                const kit = `🎓 STUDENT WELCOME KIT\n\nFull Name: ${generatedCredentials.name}\nUsername: ${generatedCredentials.student_code}\nPassword: ${generatedCredentials.password}\nPortal: ${window.location.origin}/login\n\nWelcome to the ecosystem! Please change your password after logging in.`;
                                                navigator.clipboard.writeText(kit);
                                                toast.success("Welcome Kit copied to clipboard!");
                                            }}
                                        >
                                            Copy Welcome Kit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full py-4 text-gray-500 font-bold h-auto hover:bg-gray-50"
                                            onClick={() => setShowSuccessModal(false)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Practice Lab Modal */}
            <AnimatePresence>
                {showPracticeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4"
                        onClick={() => setShowPracticeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 px-6 py-6 text-center text-white relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setShowPracticeModal(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-md">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold">Practical Lab Allocation</h2>
                                <p className="text-orange-50/80 text-xs">Assign simulation modules to student</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {['GST', 'TDS', 'INCOME_TAX'].map((type) => {
                                    const allocation = studentAllocations.find(a => a.module_type === type);

                                    return (
                                        <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div>
                                                <p className="font-bold text-gray-900">{type} Practice Lab</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                                    {allocation ? `Used: ${allocation.used_count}/5` : 'Not Allocated'}
                                                </p>
                                            </div>
                                            {allocation ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-600"
                                                        onClick={() => handleResetPractice(allocation.id)}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={allocating}
                                                    onClick={() => selectedStudent && handleAllocatePractice(selectedStudent, type)}
                                                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-[10px] font-black uppercase h-8"
                                                >
                                                    {allocating ? 'Wait...' : 'Allocate'}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-6 pb-6 mt-2">
                                <Button
                                    variant="ghost"
                                    className="w-full text-gray-400 text-xs font-bold py-4 h-auto"
                                    onClick={() => setShowPracticeModal(false)}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            </AcademicManagerLayout>
        </div>
    );
}

