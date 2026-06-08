"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Calendar as CalendarIcon,
    Clock,
    Globe,
    Building2,
    Layers,
    BookOpen,
    Users,
    Video,
    Shield
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface UnifiedScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const UnifiedScheduleModal = ({ isOpen, onClose, onSuccess }: UnifiedScheduleModalProps) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        courseId: "",
        batchId: "",
        title: "",
        classMode: "OFFLINE" as "ONLINE" | "OFFLINE" | "HYBRID",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "10:00",
        requireFaceVerification: false
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            console.log("Fetching courses...");
            const response = await api.get('/ems/courses');
            console.log("Courses Response:", response.data);

            const courseList = response.data?.data || [];
            if (courseList.length === 0) {
                toast.warning("No active courses found. Please create a course first.");
            }
            setCourses(courseList);
        } catch (err: any) {
            console.error("Courses Fetch Error:", err);
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                // Optional: Trigger logout flow or redirect
                window.location.href = '/';
                return;
            }
            toast.error(err.response?.data?.message || "Failed to load courses");
        }
    };

    const fetchBatches = async (courseId: string) => {
        try {
            console.log(`Fetching batches for course ${courseId}...`);
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            console.log("Batches Response:", response.data);

            const batchList = response.data?.data || [];
            if (batchList.length === 0) {
                toast.info("No active batches found for this course.");
            }
            setBatches(batchList);
        } catch (err: any) {
            console.error("Batches Fetch Error:", err);
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                window.location.href = '/';
                return;
            }
            toast.error(err.response?.data?.message || "Failed to load batches");
        }
    };

    const handleCourseChange = (id: string) => {
        setFormData(prev => ({ ...prev, courseId: id, batchId: "" }));
        fetchBatches(id);
    };

    const handleModeChange = (mode: "ONLINE" | "OFFLINE" | "HYBRID") => {
        setFormData(prev => ({
            ...prev,
            classMode: mode,
            // Auto-enable face for Online/Hybrid (enforced), keep previous state for Offline
            requireFaceVerification: mode !== 'OFFLINE' ? true : prev.requireFaceVerification
        }));
    };

    const handleSubmit = async () => {
        if (!formData.batchId || !formData.courseId) {
            toast.error("Please select both course and batch");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/ems/attendance?mode=session', {
                course_id: parseInt(formData.courseId),
                batch_id: parseInt(formData.batchId),
                session_date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                class_mode: formData.classMode,
                // Ensure true for non-offline modes securely before sending
                require_face_verification: formData.classMode !== 'OFFLINE' ? true : formData.requireFaceVerification,
                title: formData.title || `${formData.classMode} Class`,
                session_type: "REGULAR"
            });

            if (response.data.success) {
                toast.success("Class scheduled successfully!");
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to schedule class");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <CalendarIcon className="h-6 w-6" />
                            Schedule New Class
                        </DialogTitle>
                        <DialogDescription className="text-purple-100 font-medium">
                            Create a unified session for Online, Offline or Hybrid learning.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Class Mode Selection */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Class Mode</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'OFFLINE', label: 'Offline', icon: Building2, color: 'blue' },
                                { id: 'ONLINE', label: 'Online', icon: Globe, color: 'purple' },
                                { id: 'HYBRID', label: 'Hybrid', icon: Layers, color: 'orange' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeChange(mode.id as any)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 ${formData.classMode === mode.id
                                        ? `border-${mode.color}-500 bg-${mode.color}-50 ring-4 ring-${mode.color}-100`
                                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    <mode.icon className={`h-6 w-6 ${formData.classMode === mode.id ? `text-${mode.color}-600` : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${formData.classMode === mode.id ? `text-${mode.color}-700` : 'text-gray-500'}`}>{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Course & Batch */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Course</Label>
                            <Select onValueChange={handleCourseChange} value={formData.courseId}>
                                <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50 h-12">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-0 shadow-xl">
                                    {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.course_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Batch</Label>
                            <Select onValueChange={(val) => setFormData(prev => ({ ...prev, batchId: val }))} value={formData.batchId}>
                                <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50 h-12" disabled={!formData.courseId}>
                                    <SelectValue placeholder="Select Batch" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-0 shadow-xl">
                                    {batches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.batch_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Class Name */}
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500 text-gray-500">Class Title (Optional)</Label>
                        <Input
                            placeholder="e.g. Intro to Architecture"
                            className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Date</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-10 rounded-2xl border-gray-100 bg-gray-50 h-12"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="time"
                                    className="pl-10 rounded-2xl border-gray-100 bg-gray-50 h-12"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings - ONLY VISIBLE FOR OFFLINE MODE */}
                    {formData.classMode === 'OFFLINE' && (
                        <div className="p-5 rounded-[2rem] bg-gray-50 border border-gray-100 space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Attendance Settings</Label>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Face Verification</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Require biometric scan for attendance</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.requireFaceVerification}
                                    onCheckedChange={(val: boolean) => setFormData(prev => ({ ...prev, requireFaceVerification: val }))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100">
                    <Button variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-8 font-bold text-gray-500">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-2xl h-12 px-10 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-200"
                    >
                        {loading ? "Scheduling..." : "Create Schedule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
