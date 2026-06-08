"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    Camera,
    AlertCircle,
    Download,
    Filter,
    Search
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import Image from "next/image";

interface AttendanceRecord {
    id: number;
    student_id: number;
    check_in_time: string | null;
    check_out_time: string | null;
    check_in_lat: number | null;
    check_in_long: number | null;
    check_out_lat: number | null;
    check_out_long: number | null;
    check_in_face_url: string | null;
    check_out_face_url: string | null;
    check_in_face_score: number | null;
    check_out_face_score: number | null;
    attendance_status: string;
    is_location_verified: boolean;
    is_face_verified: boolean;
    students: {
        first_name: string;
        last_name: string;
        student_code: string;
        profile_url: string;
    };
}

export default function ClassAttendancePage() {
    const params = useParams();
    const classId = params.id;

    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [classInfo, setClassInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'PARTIAL'>('ALL');

    useEffect(() => {
        if (classId) {
            fetchAttendance();
            fetchClassInfo();
        }
    }, [classId]);

    const fetchClassInfo = async () => {
        try {
            const res = await api.get(`/ems/live-classes/${classId}`);
            if (res.data.success) setClassInfo(res.data.data);
        } catch (error) {
            console.error("Error fetching class:", error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/ems/attendance/class/${classId}`);
            if (res.data.success) setAttendance(res.data.data || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            PRESENT: { bg: "bg-green-100", text: "text-green-700", label: "PRESENT", icon: CheckCircle2 },
            PARTIAL: { bg: "bg-yellow-100", text: "text-yellow-700", label: "PARTIAL", icon: Clock },
            ABSENT: { bg: "bg-red-100", text: "text-red-700", label: "ABSENT", icon: XCircle },
            LATE: { bg: "bg-orange-100", text: "text-orange-700", label: "LATE", icon: AlertCircle }
        };
        return badges[status as keyof typeof badges] || badges.ABSENT;
    };

    const filteredAttendance = attendance.filter(a =>
        filter === 'ALL' || a.attendance_status === filter
    );

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.attendance_status === 'PRESENT').length,
        partial: attendance.filter(a => a.attendance_status === 'PARTIAL').length,
        absent: attendance.filter(a => a.attendance_status === 'ABSENT').length
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            CLASS ATTENDANCE
                        </h1>
                        {classInfo && (
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {classInfo.class_title} • {format(new Date(classInfo.scheduled_date), "MMM do, yyyy")}
                            </p>
                        )}
                    </div>
                    <Button className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Total Students", value: stats.total, color: "from-blue-600 to-cyan-600" },
                        { label: "Present", value: stats.present, color: "from-green-600 to-emerald-600" },
                        { label: "Partial", value: stats.partial, color: "from-yellow-600 to-orange-600" },
                        { label: "Absent", value: stats.absent, color: "from-red-600 to-pink-600" }
                    ].map((stat, idx) => (
                        <Card key={idx} className="border-0 shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-0">
                                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                                <div className="p-6 text-center">
                                    <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    {['ALL', 'PRESENT', 'PARTIAL', 'ABSENT'].map((f) => (
                        <Button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`h-10 px-6 rounded-xl font-bold transition-all ${filter === f
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            {f}
                        </Button>
                    ))}
                </div>

                {/* Attendance List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredAttendance.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>No attendance records found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAttendance.map((record) => {
                            const statusBadge = getStatusBadge(record.attendance_status);
                            const StatusIcon = statusBadge.icon;

                            return (
                                <motion.div key={record.id} layout>
                                    <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-6">
                                                {/* Student Info */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-black text-xl overflow-hidden">
                                                        {record.students.profile_url ? (
                                                            <Image src={record.students.profile_url} alt="" width={64} height={64} className="object-cover" />
                                                        ) : (
                                                            record.students.first_name[0]
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-lg">
                                                            {record.students.first_name} {record.students.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-medium">
                                                            {record.students.student_code}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Check-In Info */}
                                                <div className="flex items-center gap-8">
                                                    <div className="text-center">
                                                        <div className="text-xs text-gray-500 font-bold uppercase mb-1">Check-In</div>
                                                        {record.check_in_time ? (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    {format(new Date(record.check_in_time), "HH:mm")}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">—</span>
                                                        )}
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="text-xs text-gray-500 font-bold uppercase mb-1">Check-Out</div>
                                                        {record.check_out_time ? (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    {format(new Date(record.check_out_time), "HH:mm")}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">—</span>
                                                        )}
                                                    </div>

                                                    {/* Verification Badges */}
                                                    <div className="flex gap-2">
                                                        {record.is_face_verified && (
                                                            <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center" title="Face Verified">
                                                                <Camera className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        {record.is_location_verified && (
                                                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center" title="Location Verified">
                                                                <MapPin className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className={`px-4 py-2 rounded-xl ${statusBadge.bg} ${statusBadge.text} flex items-center gap-2 font-black text-xs uppercase`}>
                                                        <StatusIcon className="h-4 w-4" />
                                                        {statusBadge.label}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
