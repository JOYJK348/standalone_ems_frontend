"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
    FileText,
    ArrowLeft,
    Loader2,
    Calendar,
    Target,
    Users,
    Info,
    BrainCircuit
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        assignment_title: "",
        assignment_description: "",
        course_id: "",
        batch_id: "",
        max_marks: 100,
        deadline: "",
        submission_mode: "ONLINE" as "ONLINE" | "OFFLINE",
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (formData.course_id) {
            fetchBatches(formData.course_id);
        }
    }, [formData.course_id]);

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
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.course_id) return toast.error("Please select a course");
        if (!formData.assignment_title.trim()) return toast.error("Assignment title is required");

        try {
            setLoading(true);
            const payload = {
                ...formData,
                course_id: parseInt(formData.course_id),
                batch_id: formData.batch_id ? parseInt(formData.batch_id) : null,
                max_marks: Number(formData.max_marks),
                deadline: new Date(formData.deadline).toISOString(),
            };

            const response = await api.post("/ems/assignments", payload);
            if (response.data.success) {
                toast.success("Assignment created and sent for approval");
                router.push("/ems/tutor/assignments");
            }
        } catch (error: any) {
            console.error("Error creating assignment:", error);
            toast.error(error.response?.data?.message || "Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Button
                    variant="ghost"
                    className="mb-6 hover:bg-white"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Assignments
                </Button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Request Assignment Approval</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-0 shadow-xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Assignment Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Final Project: Database Design"
                                    className="h-12"
                                    value={formData.assignment_title}
                                    onChange={(e) => setFormData({ ...formData, assignment_title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description & Instructions</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide detailed instructions for the assignment..."
                                    className="min-h-[150px] resize-none"
                                    value={formData.assignment_description}
                                    onChange={(e) => setFormData({ ...formData, assignment_description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Select Course *</Label>
                                    <Select
                                        value={formData.course_id}
                                        onValueChange={(v) => setFormData({ ...formData, course_id: v })}
                                        required
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Choose a course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.course_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Batch (Optional)</Label>
                                    <Select
                                        value={formData.batch_id}
                                        onValueChange={(v) => setFormData({ ...formData, batch_id: v })}
                                        disabled={!formData.course_id}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={formData.course_id ? "All Batches" : "Select course first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Batches</SelectItem>
                                            {batches.map(batch => (
                                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                                    {batch.batch_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-600" />
                                Configuration & Deadline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="marks">Maximum Marks *</Label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="marks"
                                            type="number"
                                            className="h-12 pl-10"
                                            value={formData.max_marks}
                                            onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Submission Deadline *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="deadline"
                                            type="datetime-local"
                                            className="h-12 pl-10"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Submission Mode</Label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, submission_mode: 'ONLINE' })}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${formData.submission_mode === 'ONLINE'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold flex items-center justify-between">
                                            Online Submission
                                            {formData.submission_mode === 'ONLINE' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black mt-1">Files / Links</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, submission_mode: 'OFFLINE' })}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${formData.submission_mode === 'OFFLINE'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold flex items-center justify-between">
                                            Offline / Physical
                                            {formData.submission_mode === 'OFFLINE' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black mt-1">In-person Viva</div>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <BrainCircuit className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                                <div>
                                    <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Manager Approval Notice</p>
                                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                        All new assignments are subject to verification by the Academic Manager.
                                        Your assignment will appear in the "Review Center" and will only be visible to students once approved.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            "Submit Assignment for Approval"
                        )}
                    </Button>
                </form>
            </div>

            <TutorBottomNav />
        </div>
    );
}
