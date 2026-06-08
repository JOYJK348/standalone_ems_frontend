"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Video,
    Calendar,
    Clock,
    VideoIcon,
    CheckCircle2,
    Timer,
    Lock,
    Unlock,
    Camera,
    MapPin,
    FileText,
    Download,
    ExternalLink,
    RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import {
    format,
    differenceInSeconds,
    isWithinInterval,
    addMinutes,
    subMinutes,
} from "date-fns";
import dynamic from "next/dynamic";
const AttendanceVerification = dynamic(
    () =>
        import("@/components/ems/attendance/AttendanceVerification").then(
            (mod) => mod.AttendanceVerification,
        ),
    { ssr: false },
);
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LiveClass {
    id: number;
    class_title: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: string;
    meeting_id: string;
    meeting_platform: string;
    courses: { course_name: string; course_code: string };
    lessons?: {
        id: number;
        lesson_name: string;
        materials?: {
            id: number;
            material_name: string;
            material_type: string;
            file_url: string;
        }[];
    };
}

export default function StudentLiveClasses() {
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeVerification, setActiveVerification] = useState<{
        id: number;
        type: "IN" | "OUT";
    } | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchStudentClasses();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchStudentClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ems/live-classes"); // Same API, tenant scoping handles it
            if (res.data.success) setClasses(res.data.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (liveClass: LiveClass) => {
        const classDate = liveClass.scheduled_date;
        const startStr = `${classDate}T${liveClass.start_time}`;
        const endStr = `${classDate}T${liveClass.end_time}`;

        const startTime = new Date(startStr);
        const endTime = new Date(endStr);

        const checkInEnd = addMinutes(startTime, 5);
        const checkOutStart = subMinutes(endTime, 5);

        const isInCheckInWindow =
            currentTime >= startTime && currentTime <= checkInEnd;
        const isInCheckOutWindow =
            currentTime >= checkOutStart && currentTime <= endTime;

        return {
            isInCheckInWindow,
            isInCheckOutWindow,
            isLive: currentTime >= startTime && currentTime <= endTime,
            checkInEnd,
            checkOutStart,
        };
    };

    const joinMeeting = (liveClass: LiveClass) => {
        if (liveClass.meeting_platform === "JITSI") {
            router.push(`/ems/live-room/${liveClass.meeting_id}?role=student`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
                    <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        MY LIVE CLASSES
                    </h1>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border">
                        <Timer className="h-4 w-4 text-purple-600 animate-pulse" />
                        <span className="text-sm font-mono font-bold tracking-tighter">
                            {format(currentTime, "HH:mm:ss")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {activeVerification ? (
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => setActiveVerification(null)}
                            className="mb-4 text-gray-500 hover:text-purple-600 transition-colors"
                        >
                            ← Back to list
                        </Button>
                        <AttendanceVerification
                            sessions={[
                                {
                                    id: activeVerification.id,
                                    course: {
                                        course_name: classes.find(
                                            (c) =>
                                                c.id === activeVerification.id,
                                        )?.class_title,
                                    },
                                    verification_type: activeVerification.type,
                                },
                            ]}
                            onSuccess={() => {
                                setActiveVerification(null);
                                fetchStudentClasses();
                            }}
                            onClose={() => setActiveVerification(null)}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <RefreshCw className="h-10 w-10 text-purple-600 animate-spin" />
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <VideoIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p>No classes scheduled for you today.</p>
                            </div>
                        ) : (
                            classes.map((c) => {
                                const info = getStatusInfo(c);
                                return (
                                    <div key={c.id}>
                                        <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white mb-6">
                                            <CardContent className="p-0">
                                                <div className="grid grid-cols-1 lg:grid-cols-12">
                                                    {/* Left Section - Class Info */}
                                                    <div className="lg:col-span-8 p-10">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-black uppercase tracking-widest">
                                                                {
                                                                    c.courses
                                                                        .course_code
                                                                }
                                                            </div>
                                                            {info.isLive && (
                                                                <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-lg">
                                                                    <div className="h-2 w-2 bg-red-600 rounded-full animate-ping" />
                                                                    <span className="text-red-600 text-[10px] font-black uppercase">
                                                                        LIVE NOW
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <h2 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
                                                            {c.class_title}
                                                        </h2>
                                                        <p className="text-gray-500 font-medium line-clamp-2 mb-8">
                                                            {
                                                                c.courses
                                                                    .course_name
                                                            }{" "}
                                                            • Professional EMS
                                                            Training Session
                                                        </p>

                                                        <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {format(
                                                                    new Date(
                                                                        c.scheduled_date,
                                                                    ),
                                                                    "MMM do, yyyy",
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                {c.start_time} -{" "}
                                                                {c.end_time}
                                                            </div>
                                                        </div>

                                                        {/* Integrated Class Materials */}
                                                        {c.lessons?.materials &&
                                                            c.lessons.materials
                                                                .length > 0 && (
                                                                <div className="mt-8 pt-8 border-t border-gray-100">
                                                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                                                                        <FileText className="h-3 w-3" />
                                                                        Related
                                                                        Study
                                                                        Materials
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {c.lessons.materials.map(
                                                                            (
                                                                                mat,
                                                                            ) => (
                                                                                <button
                                                                                    key={
                                                                                        mat.id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        window.open(
                                                                                            mat.file_url,
                                                                                            "_blank",
                                                                                        )
                                                                                    }
                                                                                    className="flex items-center gap-3 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 px-4 py-2.5 rounded-xl transition-all group"
                                                                                >
                                                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                                        <FileText className="h-4 w-4" />
                                                                                    </div>
                                                                                    <div className="text-left">
                                                                                        <p className="text-xs font-bold text-gray-800 line-clamp-1">
                                                                                            {
                                                                                                mat.material_name
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-[10px] text-gray-400 font-medium uppercase">
                                                                                            {
                                                                                                mat.material_type
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                    <Download className="h-3 w-3 text-gray-300 group-hover:text-blue-600 ml-2" />
                                                                                </button>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>

                                                    {/* Right Section - Verification Status */}
                                                    <div className="lg:col-span-4 bg-gray-50 border-l p-10 flex flex-col justify-center gap-4">
                                                        <div className="space-y-4">
                                                            {/* Check-In Action */}
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">
                                                                    Entry
                                                                    Check-In
                                                                </p>
                                                                <Button
                                                                    className={`w-full h-14 rounded-2xl font-black transition-all ${
                                                                        info.isInCheckInWindow
                                                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-200"
                                                                            : "bg-white text-gray-400 border-2 border-gray-100"
                                                                    }`}
                                                                    disabled={
                                                                        !info.isInCheckInWindow
                                                                    }
                                                                    onClick={() =>
                                                                        setActiveVerification(
                                                                            {
                                                                                id: c.id,
                                                                                type: "IN",
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    {info.isInCheckInWindow ? (
                                                                        <Unlock className="mr-2 h-5 w-5" />
                                                                    ) : (
                                                                        <Lock className="mr-2 h-5 w-5 opacity-50" />
                                                                    )}
                                                                    {info.isInCheckInWindow
                                                                        ? "CHECK-IN NOW"
                                                                        : "CHECK-IN LOCKED"}
                                                                </Button>
                                                            </div>

                                                            {/* Check-Out Action */}
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">
                                                                    Exit
                                                                    Check-Out
                                                                </p>
                                                                <Button
                                                                    className={`w-full h-14 rounded-2xl font-black transition-all ${
                                                                        info.isInCheckOutWindow
                                                                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-200"
                                                                            : "bg-white text-gray-400 border-2 border-gray-100"
                                                                    }`}
                                                                    disabled={
                                                                        !info.isInCheckOutWindow
                                                                    }
                                                                    onClick={() =>
                                                                        setActiveVerification(
                                                                            {
                                                                                id: c.id,
                                                                                type: "OUT",
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    {info.isInCheckOutWindow ? (
                                                                        <Unlock className="mr-2 h-5 w-5" />
                                                                    ) : (
                                                                        <Lock className="mr-2 h-5 w-5 opacity-50" />
                                                                    )}
                                                                    {info.isInCheckOutWindow
                                                                        ? "CHECK-OUT NOW"
                                                                        : "CHECK-OUT LOCKED"}
                                                                </Button>
                                                            </div>

                                                            {/* Join Class Button */}
                                                            <Button
                                                                variant="outline"
                                                                className="w-full h-14 rounded-2xl font-black border-2 border-purple-200 text-purple-600 hover:bg-purple-50 mt-2"
                                                                onClick={() =>
                                                                    joinMeeting(
                                                                        c,
                                                                    )
                                                                }
                                                            >
                                                                <VideoIcon className="mr-2 h-5 w-5" />
                                                                GO TO CLASS
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
