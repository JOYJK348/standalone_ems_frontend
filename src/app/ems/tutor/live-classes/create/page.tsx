"use client";

import React, { useState, useEffect } from "react";
import {
    Video,
    Calendar,
    Clock,
    BookOpen,
    ArrowLeft,
    Plus,
    Loader2,
    CheckCircle2,
    Users,
    Link as LinkIcon,
    Info,
    Layout,
    Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CreateLiveClassPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        course_id: "",
        batch_id: "",
        topic: "",
        description: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_minutes: 60,
        meeting_link: "",
        provider: "ZOOM"
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get("/ems/courses");
            setCourses(res.data.data || []);
        } catch (error) {
            toast.error("Failed to load courses");
        }
    };

    const fetchBatches = async (courseId: string) => {
        try {
            const res = await api.get(`/ems/batches?course_id=${courseId}`);
            setBatches(res.data.data || []);
        } catch (error) {
            toast.error("Failed to load batches");
        }
    };

    const handleCourseChange = (v: string) => {
        setFormData({ ...formData, course_id: v, batch_id: "" });
        fetchBatches(v);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post("/ems/live-classes", {
                ...formData,
                course_id: Number(formData.course_id),
                batch_id: Number(formData.batch_id),
                duration_minutes: Number(formData.duration_minutes)
            });

            if (response.data.success) {
                toast.success("Live class scheduled and sent for approval!");
                router.push("/ems/tutor/live-classes"); // Assuming this exists or redirect dashboard
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule live class");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-lg bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        className="rounded-xl hover:bg-gray-100 transition-all group"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Schedule</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Video className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                                Schedule Live Session
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Request approval for a new live class</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Session Details Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
                                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100 p-6 sm:p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                                                <Layout className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Session Details</CardTitle>
                                                <CardDescription className="text-sm">Configure your live class information</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="course">
                                                    Course *
                                                </Label>
                                                <Select value={formData.course_id} onValueChange={handleCourseChange}>
                                                    <SelectTrigger id="course" className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold hover:bg-gray-100 transition-colors">
                                                        <SelectValue placeholder="Select Course" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-gray-200">
                                                        {courses.map(course => (
                                                            <SelectItem key={course.id} value={course.id.toString()} className="font-semibold">
                                                                {course.course_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="batch">
                                                    Target Batch *
                                                </Label>
                                                <Select
                                                    value={formData.batch_id}
                                                    onValueChange={(v) => setFormData({ ...formData, batch_id: v })}
                                                    disabled={!formData.course_id}
                                                >
                                                    <SelectTrigger id="batch" className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50">
                                                        <SelectValue placeholder="Select Batch" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-gray-200">
                                                        {batches.map(batch => (
                                                            <SelectItem key={batch.id} value={batch.id.toString()} className="font-semibold">
                                                                {batch.batch_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                Session Topic *
                                            </Label>
                                            <Input
                                                placeholder="e.g. Introduction to Advanced React Patterns"
                                                className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold px-4 hover:bg-gray-100 transition-colors"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                Agenda / Description
                                            </Label>
                                            <Textarea
                                                placeholder="What will students learn in this session?"
                                                className="rounded-xl border-gray-200 bg-gray-50 font-medium px-4 py-3 min-h-[100px] sm:min-h-[120px] hover:bg-gray-100 transition-colors resize-none"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Schedule & Platform Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100 p-6 sm:p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                                <Clock className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Schedule & Platform</CardTitle>
                                                <CardDescription className="text-sm">Set date, time, and meeting details</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                    Date *
                                                </Label>
                                                <Input
                                                    type="date"
                                                    className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold px-4 hover:bg-gray-100 transition-colors"
                                                    value={formData.scheduled_date}
                                                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                    Start Time *
                                                </Label>
                                                <Input
                                                    type="time"
                                                    className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold px-4 hover:bg-gray-100 transition-colors"
                                                    value={formData.scheduled_time}
                                                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                    Duration (Minutes) *
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="15"
                                                    max="300"
                                                    step="15"
                                                    className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold px-4 hover:bg-gray-100 transition-colors"
                                                    value={formData.duration_minutes}
                                                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                    Platform *
                                                </Label>
                                                <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                                                    <SelectTrigger className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold hover:bg-gray-100 transition-colors">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-gray-200">
                                                        <SelectItem value="ZOOM" className="font-semibold">🎥 Zoom Meetings</SelectItem>
                                                        <SelectItem value="GOOGLE_MEET" className="font-semibold">📹 Google Meet</SelectItem>
                                                        <SelectItem value="MS_TEAMS" className="font-semibold">💼 Microsoft Teams</SelectItem>
                                                        <SelectItem value="JITSI_MEET" className="font-semibold">🎬 Jitsi Meet</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                Meeting Link *
                                            </Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    placeholder="https://zoom.us/j/..."
                                                    className="h-12 sm:h-14 rounded-xl border-gray-200 bg-gray-50 font-semibold pl-12 pr-4 hover:bg-gray-100 transition-colors"
                                                    value={formData.meeting_link}
                                                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-500/30 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                            Submit for Approval
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Approval Flow Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
                                <CardContent className="p-6 sm:p-8">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                                        <Target className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-4">Approval Workflow</h3>
                                    <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Your request will be sent to the Academic Manager for approval</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Students will be notified once approved</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Meeting link becomes visible 15 minutes before start time</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Tips Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Info className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-blue-900 mb-2">Pro Tip</h4>
                                            <p className="text-xs text-blue-700 leading-relaxed">
                                                Record your sessions and upload them as course materials for students who miss the live class.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="hidden lg:block"
                        >
                            <Card className="border-0 shadow-lg rounded-3xl bg-white overflow-hidden">
                                <CardContent className="p-6 sm:p-8">
                                    <h4 className="font-bold text-sm text-gray-900 mb-4">Platform Features</h4>
                                    <div className="space-y-3 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                            <span>Automatic student notifications</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                            <span>Attendance tracking</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                            <span>Session recording support</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLiveClassPage;
