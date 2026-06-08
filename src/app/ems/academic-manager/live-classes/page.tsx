"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Video,
    Plus,
    Calendar,
    Clock,
    Users,
    ArrowRight,
    ExternalLink,
    Play,
    CheckCircle2,
    X,
    Filter,
    AlertCircle,
    Edit,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LiveClass {
    id: number;
    company_id: number;
    course_id: number;
    batch_id?: number;
    tutor_id?: number;
    class_title: string;
    class_description: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    meeting_platform: string;
    meeting_id: string;
    external_link?: string;
    recording_url?: string;
    status: string;
    courses?: { course_name: string; course_code: string };
    batches?: { batch_name: string };
    tutors?: { first_name: string; last_name: string };
}

export default function LiveClassesPage() {
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [tutors, setTutors] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        class_title: "",
        class_description: "",
        course_id: "",
        batch_id: "",
        tutor_id: "",
        scheduled_date: format(new Date(), "yyyy-MM-dd"),
        start_time: "10:00",
        end_time: "11:00",
        meeting_platform: "JITSI",
        external_link: ""
    });

    const [batches, setBatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'recordings'>('active');
    const [showRecordingModal, setShowRecordingModal] = useState<LiveClass | null>(null);
    const [recordingUrl, setRecordingUrl] = useState("");

    // Header customization
    const [pageTitle, setPageTitle] = useState("Live Class Manager");
    const [pageSubtitle, setPageSubtitle] = useState("Cheap & Best Jitsi Integration for Seamless Teaching");
    const [isEditingHeader, setIsEditingHeader] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        initPage();
    }, []);

    // Fetch tutors and batches when course changes
    useEffect(() => {
        if (formData.course_id) {
            const cid = parseInt(formData.course_id);
            fetchTutors(cid);
            fetchBatches(cid);
        } else {
            fetchTutors();
            fetchBatches();
        }
    }, [formData.course_id]);

    const initPage = async () => {
        setLoading(true);
        await Promise.all([
            fetchClasses(),
            fetchCourses(),
            fetchTutors(),
            fetchBatches()
        ]);
        setLoading(false);
    };

    const fetchBatches = async (courseId?: number) => {
        try {
            const url = courseId ? `/ems/batches?course_id=${courseId}` : "/ems/batches";
            const res = await api.get(url);
            if (res.data.success) setBatches(res.data.data || []);
        } catch (error: any) {
            console.error("❌ Error fetching batches:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get("/ems/live-classes");
            if (res.data.success) setClasses(res.data.data || []);
        } catch (error: any) {
            console.error("❌ Error fetching classes:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get("/ems/courses");
            if (res.data.success) {
                setCourses(res.data.data || []);
            }
        } catch (error: any) {
            console.error("❌ Error fetching courses:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        }
    };

    const fetchTutors = async (courseId?: number) => {
        try {
            const url = courseId ? `/ems/tutors?courseId=${courseId}` : "/ems/tutors";
            const res = await api.get(url);
            if (res.data.success) setTutors(res.data.data || []);
        } catch (error: any) {
            console.error("❌ Error fetching tutors:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        }
    };

    const handleEditButtonClick = (c: LiveClass) => {
        setEditingId(c.id);
        setFormData({
            class_title: c.class_title,
            class_description: c.class_description || "",
            course_id: String(c.course_id),
            batch_id: String(c.batch_id || ""),
            tutor_id: String(c.tutor_id || ""),
            scheduled_date: c.scheduled_date,
            start_time: c.start_time.substring(0, 5),
            end_time: c.end_time.substring(0, 5),
            meeting_platform: c.meeting_platform,
            external_link: c.external_link || ""
        });
        setShowCreateModal(true);
    };

    const handleDeleteClass = async (id: number) => {
        if (!confirm("Are you sure you want to cancel this live class?")) return;
        try {
            const res = await api.delete(`/ems/live-classes/${id}`);
            if (res.data.success) {
                toast.success("Live class cancelled successfully");
                fetchClasses();
            }
        } catch (error) {
            console.error("Error deleting class:", error);
            toast.error("Failed to cancel live class");
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (!formData.tutor_id) {
                toast.error("Please select a tutor");
                return;
            }

            const payload = {
                ...formData,
                course_id: parseInt(formData.course_id),
                tutor_id: parseInt(formData.tutor_id),
                batch_id: formData.batch_id ? parseInt(formData.batch_id) : null
            };

            const res = editingId
                ? await api.put(`/ems/live-classes/${editingId}`, payload)
                : await api.post("/ems/live-classes", payload);

            if (res.data.success) {
                setShowCreateModal(false);
                toast.success(editingId ? "Live class updated successfully" : "Live class scheduled successfully");
                fetchClasses();
                // Reset form
                setFormData({
                    class_title: "",
                    class_description: "",
                    course_id: "",
                    batch_id: "",
                    tutor_id: "",
                    scheduled_date: format(new Date(), "yyyy-MM-dd"),
                    start_time: "10:00",
                    end_time: "11:00",
                    meeting_platform: "JITSI",
                    external_link: ""
                });
                setEditingId(null);
            }
        } catch (err: any) {
            console.error("Error saving class:", err);
            const errMsg = err.response?.data?.message || "Failed to save class. Please ensure the table exists or check fields.";
            setError(errMsg);
            toast.error(errMsg);
        }
    };

    const updateRecording = async () => {
        if (!showRecordingModal || !recordingUrl) return;
        try {
            const res = await api.put(`/ems/live-classes/${showRecordingModal.id}`, {
                recording_url: recordingUrl,
                status: 'COMPLETED'
            });
            if (res.data.success) {
                toast.success("Class recording updated successfully");
                setShowRecordingModal(null);
                setRecordingUrl("");
                fetchClasses();
            }
        } catch (error) {
            console.error("Error updating recording:", error);
            toast.error("Failed to update recording");
        }
    };

    const joinClass = (liveClass: LiveClass) => {
        if (liveClass.meeting_platform === 'JITSI') {
            router.push(`/ems/live-room/${liveClass.meeting_id}?role=admin`);
        } else if (liveClass.external_link) {
            window.open(liveClass.external_link, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div className="group relative w-full sm:w-auto">
                        {isEditingHeader ? (
                            <div className="space-y-4 bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-purple-100 w-full sm:min-w-[400px]">
                                <div className="space-y-2">
                                    <Label>Page Title</Label>
                                    <Input value={pageTitle} onChange={e => setPageTitle(e.target.value)} className="font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle / Tagline</Label>
                                    <Textarea value={pageSubtitle} onChange={e => setPageSubtitle(e.target.value)} className="italic" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingHeader(false)}>Cancel</Button>
                                    <Button size="sm" className="bg-purple-600" onClick={() => setIsEditingHeader(false)}>Save Branding</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 flex items-center gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-200">
                                        <Video className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="tracking-tight">{pageTitle}</span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-400 italic mt-0.5 sm:mt-1">
                                            {pageSubtitle}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsEditingHeader(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 rounded-full hover:bg-purple-50 text-purple-400 hidden sm:flex"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </h1>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                class_title: "",
                                class_description: "",
                                course_id: "",
                                batch_id: "",
                                tutor_id: "",
                                scheduled_date: format(new Date(), "yyyy-MM-dd"),
                                start_time: "10:00",
                                end_time: "11:00",
                                meeting_platform: "JITSI",
                                external_link: ""
                            });
                            setShowCreateModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 h-10 sm:h-12 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="hidden sm:inline">Schedule New Class</span>
                        <span className="sm:hidden">New Class</span>
                    </Button>
                </div>

                {/* Tabs - Responsive */}
                <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-3 sm:pb-4 px-3 sm:px-4 font-bold text-xs sm:text-sm transition-all relative whitespace-nowrap ${activeTab === 'active' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Upcoming & Live</span>
                            <span className="sm:hidden">Live</span>
                        </div>
                        {activeTab === 'active' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('recordings')}
                        className={`pb-3 sm:pb-4 px-3 sm:px-4 font-bold text-xs sm:text-sm transition-all relative whitespace-nowrap ${activeTab === 'recordings' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Class Recordings</span>
                            <span className="sm:hidden">Recordings</span>
                        </div>
                        {activeTab === 'recordings' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
                    </button>
                </div>

                {/* Class List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                    </div>
                ) : classes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-white/50">
                        <CardContent className="p-20 text-center">
                            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">No Live Classes Scheduled</h3>
                            <p className="text-gray-500 mt-2">Get started by creating your first session today.</p>
                            <Button variant="outline" className="mt-6 border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => setShowCreateModal(true)}>
                                Schedule Now
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes
                            .filter(c => activeTab === 'recordings' ? (c.status === 'COMPLETED' || c.recording_url) : (c.status !== 'COMPLETED' && !c.recording_url))
                            .map((c, i) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative group bg-white">
                                        {/* Gradient Border Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Top Gradient Bar */}
                                        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600"></div>

                                        <CardContent className="p-6 relative">
                                            {/* Header Section */}
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100/50">
                                                        {c.courses?.course_code || 'EMS'}
                                                    </div>
                                                </div>
                                                {c.status === 'LIVE' ? (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full animate-pulse">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute"></span>
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">LIVE</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1 bg-gray-50 rounded-full">
                                                        {c.status}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight tracking-tight">
                                                {c.class_title}
                                            </h3>

                                            {/* Info Section with Better Spacing */}
                                            <div className="space-y-3 mb-6 bg-gradient-to-br from-gray-50/50 to-purple-50/30 rounded-xl p-4 border border-gray-100/50">
                                                <div className="flex items-center text-sm text-gray-600 gap-3 group/item">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover/item:shadow-md transition-shadow">
                                                        <Calendar className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <span className="font-semibold text-xs sm:text-sm">
                                                        {format(new Date(c.scheduled_date), "EEE, MMM do, yyyy")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 gap-3 group/item">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover/item:shadow-md transition-shadow">
                                                        <Clock className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                    <span className="font-semibold text-xs sm:text-sm">
                                                        {c.start_time.substring(0, 5)} - {c.end_time.substring(0, 5)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 gap-3 group/item">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover/item:shadow-md transition-shadow">
                                                        <Users className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <span className="font-semibold text-xs sm:text-sm truncate">
                                                        {c.tutors?.first_name} {c.tutors?.last_name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100">
                                                {activeTab === 'active' ? (
                                                    <div className="flex flex-col gap-2.5">
                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            <Button
                                                                onClick={() => joinClass(c)}
                                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 font-bold text-xs sm:text-sm h-10 sm:h-11 rounded-xl transition-all duration-300 group/btn"
                                                            >
                                                                <span className="hidden sm:inline">Join Class</span>
                                                                <span className="sm:hidden">Join</span>
                                                                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setShowRecordingModal(c);
                                                                    setRecordingUrl(c.recording_url || "");
                                                                }}
                                                                className="border-2 border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300 font-bold text-xs sm:text-sm h-10 sm:h-11 rounded-xl transition-all duration-300 group/btn"
                                                            >
                                                                <span className="hidden sm:inline">Record</span>
                                                                <span className="sm:hidden">Rec</span>
                                                                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover/btn:scale-110 transition-transform" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditButtonClick(c)}
                                                                className="text-gray-500 hover:text-purple-700 hover:bg-purple-50 h-9 font-semibold text-xs rounded-lg transition-all duration-200 group/btn"
                                                            >
                                                                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 group-hover/btn:rotate-12 transition-transform" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClass(c.id)}
                                                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-9 font-semibold text-xs rounded-lg transition-all duration-200 group/btn"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => window.open(c.recording_url, '_blank')}
                                                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 font-bold text-xs sm:text-sm h-10 sm:h-11 rounded-xl transition-all duration-300 group/btn"
                                                    >
                                                        <Play className="h-4 w-4 mr-2 fill-current group-hover/btn:scale-110 transition-transform" />
                                                        Watch on YouTube
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-2xl relative w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="bg-purple-600 p-6 flex justify-between items-center text-white shrink-0">
                                <h2 className="text-2xl font-bold">
                                    {editingId ? "Update Live Class" : "Schedule Live Class"}
                                </h2>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-purple-500 rounded-full" onClick={() => setShowCreateModal(false)}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-8 space-y-6 overflow-y-auto">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Class Title *</Label>
                                    <Input
                                        required
                                        placeholder="e.g. Introduction to React Hooks"
                                        value={formData.class_title}
                                        onChange={e => setFormData({ ...formData, class_title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Course *</Label>
                                        <select
                                            required
                                            className="w-full h-10 rounded-lg border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                                            value={formData.course_id}
                                            onChange={e => setFormData({ ...formData, course_id: e.target.value, tutor_id: "", batch_id: "" })}
                                        >
                                            <option value="">Select Course</option>
                                            {loading ? (
                                                <option disabled>Loading courses...</option>
                                            ) : courses && courses.length > 0 ? (
                                                courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)
                                            ) : (
                                                <option disabled>No courses found</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assigned Tutor *</Label>
                                        <select
                                            required
                                            disabled={!formData.course_id}
                                            className={`w-full h-10 rounded-lg border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 transition-all ${!formData.course_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={formData.tutor_id}
                                            onChange={e => setFormData({ ...formData, tutor_id: e.target.value })}
                                        >
                                            <option value="">{!formData.course_id ? "Select Course First" : "Select Tutor"}</option>
                                            {loading ? (
                                                <option disabled>Loading tutors...</option>
                                            ) : tutors.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className={!formData.course_id ? 'opacity-50' : ''}>Target Batch *</Label>
                                        <select
                                            required
                                            disabled={!formData.course_id}
                                            className={`w-full h-10 rounded-lg border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 transition-all ${!formData.course_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={formData.batch_id}
                                            onChange={e => setFormData({ ...formData, batch_id: e.target.value })}
                                        >
                                            <option value="">{!formData.course_id ? "Select Course First" : "Select Batch"}</option>
                                            {loading ? (
                                                <option disabled>Loading batches...</option>
                                            ) : batches && batches.length > 0 ? (
                                                batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)
                                            ) : (
                                                <option disabled>No batches found</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date *</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={formData.scheduled_date}
                                            onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="space-y-2 flex-1">
                                            <Label>Start *</Label>
                                            <Input
                                                type="time"
                                                required
                                                value={formData.start_time}
                                                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Label>End *</Label>
                                            <Input
                                                type="time"
                                                required
                                                value={formData.end_time}
                                                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Platform</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, meeting_platform: 'JITSI' })}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.meeting_platform === 'JITSI' ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}
                                        >
                                            <CheckCircle2 className={`h-4 w-4 mb-1 ${formData.meeting_platform === 'JITSI' ? 'text-purple-600' : 'text-gray-300'}`} />
                                            <span className="font-bold block text-sm">Jitsi Meet</span>
                                            <span className="text-[10px] text-gray-500">Free / In-App</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, meeting_platform: 'EXTERNAL' })}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.meeting_platform === 'EXTERNAL' ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}
                                        >
                                            <ExternalLink className={`h-4 w-4 mb-1 ${formData.meeting_platform === 'EXTERNAL' ? 'text-purple-600' : 'text-gray-300'}`} />
                                            <span className="font-bold block text-sm">External Link</span>
                                            <span className="text-[10px] text-gray-500">Zoom/Meet/Other</span>
                                        </button>
                                    </div>
                                </div>

                                {formData.meeting_platform === 'EXTERNAL' && (
                                    <div className="space-y-2">
                                        <Label>Paste Meeting Link</Label>
                                        <Input
                                            placeholder="https://zoom.us/j/..."
                                            value={formData.external_link}
                                            onChange={e => setFormData({ ...formData, external_link: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 pb-4">
                                    <Label>Description (Optional)</Label>
                                    <Textarea
                                        placeholder="Any instructions for students?"
                                        rows={2}
                                        value={formData.class_description}
                                        onChange={e => setFormData({ ...formData, class_description: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                    <Button variant="outline" className="flex-1 rounded-xl h-12" type="button" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl h-12 shadow-lg shadow-purple-200">
                                        {editingId ? "Update Class" : "Schedule Session"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Recording Link Modal */}
            <AnimatePresence>
                {showRecordingModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">Add YouTube Recording</h2>
                                <button onClick={() => setShowRecordingModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="p-4 bg-red-50 rounded-xl flex gap-3 text-red-700 text-sm border border-red-100">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>Marking a class as recorded will move it to the **Recordings Archive**.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>YouTube Link *</Label>
                                    <Input
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={recordingUrl}
                                        onChange={(e) => setRecordingUrl(e.target.value)}
                                        className="h-12 border-gray-200 focus:ring-red-500"
                                    />
                                    <p className="text-xs text-gray-500">Paste the URL of your YouTube Live stream or uploaded video.</p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowRecordingModal(null)}>Cancel</Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                                        onClick={updateRecording}
                                        disabled={!recordingUrl}
                                    >
                                        Save & Archive
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            </AcademicManagerLayout>
        </div>
    );
}

