"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    ArrowLeft,
    ChevronRight,
    MapPin,
    Edit,
    Trash2,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface ScheduledBatch {
    id: number;
    batch_name: string;
    batch_code: string;
    start_time: string;
    end_time: string;
    course: {
        id: number;
        course_name: string;
        course_code: string;
    };
    total_students: number;
    class_mode?: string;
    require_face_verification?: boolean;
    require_location_verification?: boolean;
    live_class?: {
        id: number;
        meeting_link: string;
        meeting_platform: string;
    } | null;
    session?: {
        id: number;
        status: string;
        present_count: number;
        absent_count: number;
    } | null;
    status: string;
    live_class_id?: number | null;
}

export default function AttendancePage() {
    const router = useRouter();
    const [schedule, setSchedule] = useState<ScheduledBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchDailySchedule();
    }, [selectedDate]);

    const fetchDailySchedule = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/attendance?mode=schedule&date=${selectedDate}`);
            if (response.data.success) {
                // Ensure we get the schedule array from the response object
                const scheduleData = response.data.data.schedule || response.data.data || [];
                setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (sessionId: number, status: string) => {
        try {
            toast.loading(`Updating status to ${status}...`);
            const response = await api.post("/ems/attendance?mode=session-status", {
                session_id: sessionId,
                status: status
            });
            toast.dismiss();
            if (response.data.success) {
                toast.success(`Attendance window: ${status}`);
                fetchDailySchedule(); // Refresh data
            }
        } catch (error: any) {
            toast.dismiss();
            console.error("Error updating status:", error);
            // Check for specific API error response
            if (error?.response?.data) {
                console.error("API Error Details:", error.response.data);
                toast.error(error.response.data.error?.message || "Failed to update status: API Error");
            } else {
                toast.error(error.message || "Failed to update status");
            }
        }
    };


    const handleMarkAttendance = async (batch: ScheduledBatch) => {
        // If session exists, navigate
        if (batch.session) {
            router.push(`/ems/academic-manager/attendance/${batch.session.id}`);
            return;
        }

        try {
            toast.loading("Starting session...");
            let courseId = (batch.course as any)?.id || 1;

            const response = await api.post("/ems/attendance?mode=session", {
                batch_id: batch.id,
                course_id: courseId,
                session_date: selectedDate,
                session_type: "REGULAR",
                start_time: batch.start_time || "09:00",
                end_time: batch.end_time || "10:00",
                live_class_id: batch.live_class_id,
                class_mode: batch.class_mode || 'OFFLINE',
                require_face_verification: batch.require_face_verification || false,
                require_location_verification: batch.require_location_verification || false
            });

            toast.dismiss();
            if (response.data.success) {
                fetchDailySchedule();
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to start session");
        }
    };

    // Edit & Cancel Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ScheduledBatch | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const handleCancelSession = async () => {
        if (!selectedSession?.session || !cancelReason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }

        try {
            setCancelling(true);
            const response = await api.post("/ems/attendance?mode=cancel-session", {
                session_id: selectedSession.session.id,
                cancellation_reason: cancelReason
            });

            if (response.data.success) {
                toast.success("Session cancelled successfully");
                setShowCancelModal(false);
                setCancelReason("");
                setSelectedSession(null);
                fetchDailySchedule();
            }
        } catch (error) {
            console.error("Error cancelling session:", error);
            toast.error("Failed to cancel session");
        } finally {
            setCancelling(false);
        }
    };

    const openCancelModal = (batch: ScheduledBatch) => {
        setSelectedSession(batch);
        setShowCancelModal(true);
    };

    const openEditModal = (batch: ScheduledBatch) => {
        setSelectedSession(batch);
        setShowEditModal(true);
    };

    const handleUpdateSession = async () => {
        if (!selectedSession?.session) return;

        try {
            toast.loading("Updating session...");
            const response = await api.post("/ems/attendance?mode=update-session", {
                session_id: selectedSession.session.id,
                class_mode: selectedSession.class_mode,
                require_face_verification: selectedSession.require_face_verification,
                require_location_verification: selectedSession.require_location_verification
            });

            toast.dismiss();
            if (response.data.success) {
                toast.success("Session updated successfully");
                setShowEditModal(false);
                fetchDailySchedule();
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to update session");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Attendance Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Today's Scheduled Classes ({mounted ? new Date(selectedDate).toLocaleDateString() : ''})
                        </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-0 focus-visible:ring-0 w-auto"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading schedule...</p>
                    </div>
                ) : schedule.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Classes Scheduled
                            </h3>
                            <p className="text-gray-600 mb-6">
                                There are no active batches scheduled for this date.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {schedule.map((batch) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <Card className={`border-0 shadow-md transition-all hover:shadow-xl ${batch.session?.status === 'COMPLETED' ? 'bg-green-50/50' : 'bg-white'
                                    }`}>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                            {/* Time Column */}
                                            <div className="flex flex-col items-center justify-center w-full sm:min-w-[80px] sm:w-auto p-3 bg-purple-50 rounded-xl text-purple-700">
                                                <span className="text-lg font-bold">
                                                    {batch.start_time ? batch.start_time.substring(0, 5) : '09:00'}
                                                </span>
                                                <span className="text-xs opacity-70">
                                                    {batch.end_time ? batch.end_time.substring(0, 5) : '10:00'}
                                                </span>
                                            </div>

                                            {/* Details Column */}
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                                        {batch.batch_name}
                                                    </h3>
                                                    {batch.session?.status === 'COMPLETED' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Completed
                                                        </span>
                                                    )}
                                                    {batch.session?.status === 'SCHEDULED' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Scheduled
                                                        </span>
                                                    )}
                                                    {batch.session?.status === 'IDENTIFYING_ENTRY' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1 animate-pulse">
                                                            <MapPin className="h-3 w-3" />
                                                            Entry Window Open
                                                        </span>
                                                    )}
                                                    {batch.session?.status === 'IDENTIFYING_EXIT' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium flex items-center gap-1 animate-pulse">
                                                            <MapPin className="h-3 w-3" />
                                                            Exit Window Open
                                                        </span>
                                                    )}
                                                    {batch.session?.status === 'IN_PROGRESS' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            In Progress
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-2 flex flex-wrap items-center gap-2 text-sm">
                                                    <span className="font-medium text-purple-600">{batch.course?.course_name}</span>
                                                    <span className="text-gray-300 hidden sm:inline">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> Classroom A
                                                    </span>
                                                </p>

                                                {/* Class Mode & Verification Settings */}
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    {/* Class Mode Badge */}
                                                    {batch.class_mode === 'ONLINE' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                                            🌐 Online Class
                                                        </span>
                                                    )}
                                                    {batch.class_mode === 'OFFLINE' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200">
                                                            🏫 Offline Class
                                                        </span>
                                                    )}
                                                    {batch.class_mode === 'HYBRID' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                                                            🔄 Hybrid Class
                                                        </span>
                                                    )}

                                                    {/* Face Verification Badge */}
                                                    {batch.require_face_verification && (
                                                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                                            👤 Face ON
                                                        </span>
                                                    )}
                                                    {!batch.require_face_verification && (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                                                            👤 Face OFF
                                                        </span>
                                                    )}


                                                    {/* Location Verification Badge - Only for Online/Hybrid */}
                                                    {(batch.class_mode === 'ONLINE' || batch.class_mode === 'HYBRID') && (
                                                        <>
                                                            {batch.require_location_verification && (
                                                                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                                                    📍 Location ON
                                                                </span>
                                                            )}
                                                            {!batch.require_location_verification && (
                                                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                                                                    📍 Location OFF
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {batch.session && (
                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500 mt-2">
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <Users className="h-3 w-3" /> {batch.session.present_count || 0}/{batch.total_students || 0} Present
                                                        </span>
                                                        <span className="flex items-center gap-1 text-red-600">
                                                            <Users className="h-3 w-3" /> {batch.session.absent_count || 0}/{batch.total_students || 0} Absent
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button & Controls - Responsive */}
                                            <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                                                {batch.session ? (
                                                    <>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            {batch.session.status === 'SCHEDULED' && (
                                                                <>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => openEditModal(batch)}
                                                                            className="text-[10px] h-8 font-bold border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
                                                                        >
                                                                            <Edit className="h-3 w-3 sm:mr-1" />
                                                                            <span className="hidden sm:inline">Edit</span>
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => openCancelModal(batch)}
                                                                            className="text-[10px] h-8 font-bold border-red-200 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                                                                        >
                                                                            <Trash2 className="h-3 w-3 sm:mr-1" />
                                                                            <span className="hidden sm:inline">Cancel</span>
                                                                        </Button>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleUpdateStatus(batch.session!.id, 'IDENTIFYING_ENTRY')}
                                                                        className="text-[10px] h-8 font-bold border-amber-200 text-amber-600 hover:bg-amber-50 w-full"
                                                                    >
                                                                        Open Entry
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {batch.session.status === 'IDENTIFYING_ENTRY' && (
                                                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleUpdateStatus(batch.session!.id, 'IN_PROGRESS')}
                                                                        className="text-[10px] h-8 font-bold text-gray-400 hover:bg-gray-50 flex-1"
                                                                    >
                                                                        Close Window
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleUpdateStatus(batch.session!.id, 'IDENTIFYING_EXIT')}
                                                                        className="text-[10px] h-8 font-bold border-orange-200 text-orange-600 hover:bg-orange-50 flex-1"
                                                                    >
                                                                        Open Exit
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {batch.session.status === 'IN_PROGRESS' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleUpdateStatus(batch.session!.id, 'IDENTIFYING_EXIT')}
                                                                    className="text-[10px] h-8 font-bold border-orange-200 text-orange-600 hover:bg-orange-50 w-full"
                                                                >
                                                                    Open Exit
                                                                </Button>
                                                            )}
                                                            {batch.session.status === 'IDENTIFYING_EXIT' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleUpdateStatus(batch.session!.id, 'COMPLETED')}
                                                                    className="text-[10px] h-8 font-bold border-purple-200 text-purple-600 hover:bg-purple-50 w-full"
                                                                >
                                                                    Mark Completed
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <Button
                                                            onClick={() => router.push(`/ems/academic-manager/attendance/${batch.session!.id}`)}
                                                            className="bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 h-9 font-bold text-xs w-full"
                                                        >
                                                            View Full Summary
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleMarkAttendance(batch as any)}
                                                        className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 w-full sm:min-w-[140px]"
                                                    >
                                                        Start Session
                                                        <ChevronRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>


            </AcademicManagerLayout>

            {/* Cancellation Modal */}
            <AnimatePresence>
                {showCancelModal && selectedSession && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Trash2 className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Cancel Class</h3>
                                            <p className="text-sm text-gray-500">This will soft-delete the scheduled session</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-700">{selectedSession.batch_name}</p>
                                        <p className="text-xs text-gray-500">{selectedSession.course?.course_name}</p>
                                        <div className="flex items-center mt-2 text-xs text-gray-400 gap-3">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedSession.start_time} - {selectedSession.end_time}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Reason for Cancellation <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="e.g., Tutor unavailable, technical issues, holiday..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none h-28 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 rounded-xl h-11 font-semibold text-gray-600 border-gray-200 hover:bg-gray-100"
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={handleCancelSession}
                                    disabled={cancelling || !cancelReason.trim()}
                                    className="flex-1 rounded-xl h-11 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {cancelling ? "Processing..." : "Confirm Cancel"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && selectedSession && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Edit className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Edit Session</h3>
                                            <p className="text-sm text-gray-500">Modify class configuration</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Class Mode</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['OFFLINE', 'ONLINE', 'HYBRID'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setSelectedSession({ ...selectedSession, class_mode: mode as any })}
                                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${selectedSession.class_mode === mode
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                                                    <Users className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">Face Verification</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedSession({ ...selectedSession, require_face_verification: !selectedSession.require_face_verification })}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${selectedSession.require_face_verification ? 'bg-purple-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedSession.require_face_verification ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">Location Lock</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedSession({ ...selectedSession, require_location_verification: !selectedSession.require_location_verification })}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${selectedSession.require_location_verification ? 'bg-emerald-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedSession.require_location_verification ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 rounded-xl h-11 font-semibold text-gray-600 border-gray-200 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateSession}
                                    className="flex-1 rounded-xl h-11 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

