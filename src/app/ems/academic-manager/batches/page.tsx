"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    GraduationCap,
    Plus,
    Search,
    Users,
    Calendar,
    ArrowLeft,
    X,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { BatchDetailsModal } from "@/components/ems/batch-details-modal";
import { toast } from "sonner";

interface Batch {
    id: number;
    batch_code: string;
    batch_name: string;
    course_id: number;
    max_students: number;
    enrolled_count: number;
    start_date: string;
    end_date: string;
    status: string;
    courses?: {
        course_name: string;
    };
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

export default function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        batch_code: "",
        batch_name: "",
        course_id: "",
        max_students: 30,
        start_date: "",
        end_date: "",
        schedule_details: "",
    });
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchBatches();
        fetchCourses();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/batches");
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await api.post("/ems/batches", {
                ...formData,
                course_id: parseInt(formData.course_id),
                max_students: parseInt(formData.max_students.toString()),
            });

            if (response.data.success) {
                toast.success("Batch created successfully!");
                setShowCreateForm(false);
                fetchBatches();
                // Reset form
                setFormData({
                    batch_code: "",
                    batch_name: "",
                    course_id: "",
                    max_students: 30,
                    start_date: "",
                    end_date: "",
                    schedule_details: "",
                });
            } else {
                toast.error(response.data.message || "Failed to create batch");
            }
        } catch (error: any) {
            console.error("Error creating batch:", error);
            // Try to extract the most descriptive error message
            const serverMessage = error.response?.data?.error?.message;
            const apiMessage = error.response?.data?.message;
            const errMsg = serverMessage || apiMessage || error.message || "An unexpected error occurred";
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredBatches = batches.filter((batch) =>
        batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.batch_code.toLowerCase().includes(searchQuery.toLowerCase())
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
                            Batches Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Organize students into batches and manage schedules
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Batch
                    </Button>
                </div>

                {/* Search */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search batches by name or code..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Batches Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading batches...</p>
                    </div>
                ) : filteredBatches.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <GraduationCap className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Batches Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first batch to start organizing students
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Batch
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBatches.map((batch) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <GraduationCap className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${batch.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : batch.status === 'UPCOMING'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {batch.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {batch.batch_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Code: {batch.batch_code}
                                        </p>
                                        <p className="text-sm text-purple-600 font-medium mb-4">
                                            {batch.courses?.course_name || 'No course assigned'}
                                        </p>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {batch.enrolled_count || 0} / {batch.max_students || 'No limit'} students
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'Not set'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Enrollment</span>
                                                <span>
                                                    {batch.max_students
                                                        ? `${Math.round(((batch.enrolled_count || 0) / batch.max_students) * 100)}%`
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${batch.max_students ? Math.min(((batch.enrolled_count || 0) / batch.max_students) * 100, 100) : 0}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                                                onClick={() => {
                                                    setSelectedBatchId(batch.id);
                                                    setShowDetailsModal(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
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

            {/* Create Batch Modal */}
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
                                    Create New Batch
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateBatch} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="batch_code">Batch Code *</Label>
                                        <Input
                                            id="batch_code"
                                            required
                                            placeholder="e.g., WEB101-JAN24"
                                            value={formData.batch_code}
                                            onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="max_students">Max Students *</Label>
                                        <Input
                                            id="max_students"
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.max_students}
                                            onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="batch_name">Batch Name *</Label>
                                    <Input
                                        id="batch_name"
                                        required
                                        placeholder="e.g., January 2024 Batch"
                                        value={formData.batch_name}
                                        onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                                    />
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
                                                {course.course_name} ({course.course_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date">Start Date *</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            required
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="schedule_details">Schedule Details</Label>
                                    <Textarea
                                        id="schedule_details"
                                        rows={3}
                                        placeholder="e.g., Mon-Fri, 10 AM - 12 PM"
                                        value={formData.schedule_details}
                                        onChange={(e) => setFormData({ ...formData, schedule_details: e.target.value })}
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
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Creating..." : "Create Batch"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BatchDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedBatchId(null);
                }}
                batchId={selectedBatchId}
            />

            </AcademicManagerLayout>
        </div>
    );
}

