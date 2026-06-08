"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Award,
    Plus,
    Search,
    Download,
    Eye,
    CheckCircle,
    ArrowLeft,
    X,
    FileCheck,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Certificate {
    id: number;
    student_id: number;
    course_id: number;
    certificate_code: string;
    issue_date: string;
    status: string;
    students?: {
        first_name: string;
        last_name: string;
    };
    courses?: {
        course_name: string;
    };
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showIssueForm, setShowIssueForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        student_id: "",
        course_id: "",
        issue_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchCertificates();
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/certificates");
            if (response.data.success) {
                setCertificates(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get("/ems/students");
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

    const handleIssueCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/certificates", {
                ...formData,
                student_id: parseInt(formData.student_id),
                course_id: parseInt(formData.course_id),
            });

            if (response.data.success) {
                setShowIssueForm(false);
                fetchCertificates();
                setFormData({
                    student_id: "",
                    course_id: "",
                    issue_date: new Date().toISOString().split('T')[0],
                });
            }
        } catch (error) {
            console.error("Error issuing certificate:", error);
        }
    };

    const filteredCertificates = certificates.filter((cert) =>
        cert.certificate_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${cert.students?.first_name} ${cert.students?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Certificates
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Issue and manage course completion certificates
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowIssueForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Issue Certificate
                    </Button>
                </div>

                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search by certificate code or student name..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading certificates...</p>
                    </div>
                ) : filteredCertificates.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Award className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Certificates Issued Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Issue your first certificate to recognize student achievement
                            </p>
                            <Button
                                onClick={() => setShowIssueForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Issue First Certificate
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCertificates.map((certificate) => (
                            <motion.div
                                key={certificate.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-bl-full"></div>
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Award className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${certificate.status === 'ISSUED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {certificate.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {certificate.students?.first_name} {certificate.students?.last_name}
                                        </h3>
                                        <p className="text-sm text-purple-600 font-medium mb-3">
                                            {certificate.courses?.course_name}
                                        </p>

                                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FileCheck className="h-4 w-4 text-gray-400" />
                                                <span>Code: {certificate.certificate_code}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    Issued: {new Date(certificate.issue_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Issue Certificate Modal */}
            <AnimatePresence>
                {showIssueForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowIssueForm(false)}
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
                                    Issue Certificate
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowIssueForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleIssueCertificate} className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="student_id">Select Student *</Label>
                                    <select
                                        id="student_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                    >
                                        <option value="">Choose a student...</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name} ({student.student_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="course_id">Select Course *</Label>
                                    <select
                                        id="course_id"
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300"
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
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
                                    <Label htmlFor="issue_date">Issue Date *</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        required
                                        value={formData.issue_date}
                                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    />
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <p className="text-sm text-purple-800">
                                        🎓 A unique certificate code will be generated automatically upon issuance.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowIssueForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Issue Certificate
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            </AcademicManagerLayout>
        </div>
    );
}

