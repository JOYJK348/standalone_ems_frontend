"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Users,
    Clock,
    Calendar,
    Camera,
    MapPin,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Save,
    Search,
    UserCheck,
    FileText,
    Circle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface Session {
    id: number;
    batch_name: string;
    course_name: string;
    session_date: string;
    status: string;
    require_face_verification: boolean;
    require_location_verification: boolean;
}

interface AttendanceRecord {
    student_id: number;
    student: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
    status: "PRESENT" | "ABSENT" | "IDENTIFYING_ENTRY" | "IDENTIFYING_EXIT";
    entry_verified_at?: string;
    exit_verified_at?: string;
    entry_image?: string;
    exit_image?: string;
    entry_distance?: number;
    exit_distance?: number;
    entry_location_verified: boolean;
    exit_location_verified: boolean;
    entry_status?: string;
    exit_status?: string;
    remarks?: string;
}

export default function AttendanceSessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<Session | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("All Status");
    const [searchQuery, setSearchQuery] = useState("");
    const [remarks, setRemarks] = useState<Record<number, string>>({});
    const [selectedStudent, setSelectedStudent] =
        useState<AttendanceRecord | null>(null);

    useEffect(() => {
        if (sessionId) fetchData();
    }, [sessionId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(
                `/ems/attendance?mode=detail&session_id=${sessionId}`,
            );
            if (response.data.success) {
                const data = response.data.data;
                setSession(data.session);
                const recordsList: AttendanceRecord[] = data.records || [];
                setRecords(recordsList);
                const initRemarks: Record<number, string> = {};
                recordsList.forEach((r) => {
                    initRemarks[r.student_id] = r.remarks || "";
                });
                setRemarks(initRemarks);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load session details");
        } finally {
            setLoading(false);
        }
    };

    const updateSessionStatus = async (status: string) => {
        try {
            toast.loading(`Updating session status...`);
            const response = await api.post(
                "/ems/attendance?mode=session-status",
                {
                    session_id: parseInt(sessionId),
                    status,
                },
            );
            toast.dismiss();
            if (response.data.success) {
                toast.success(`Session is now ${status}`);
                fetchData();
            }
        } catch (error: any) {
            toast.dismiss();
            console.error("Error updating status:", error);
            toast.error(
                error.response?.data?.error?.message ||
                    "Failed to update session status",
            );
        }
    };

    const markAttendance = async (studentId: number, status: string) => {
        try {
            const response = await api.post("/ems/attendance?mode=mark", {
                session_id: parseInt(sessionId),
                student_id: studentId,
                status,
            });
            if (response.data.success) {
                toast.success("Attendance marked successfully");
                fetchData();
            }
        } catch (error: any) {
            console.error("Error saving attendance:", error);
            toast.error(
                error.response?.data?.error?.message ||
                    "Failed to save attendance",
            );
        }
    };

    const handleSaveRemarks = async () => {
        try {
            setSaving(true);
            const payload = Object.entries(remarks)
                .filter(([_, val]) => val.trim())
                .map(([studentId, remark]) => ({
                    session_id: parseInt(sessionId),
                    student_id: parseInt(studentId),
                    remarks: remark,
                }));
            if (payload.length === 0) {
                toast.error("No attendance changes to save");
                return;
            }
            const response = await api.post("/ems/attendance?mode=remarks", {
                records: payload,
            });
            if (response.data.success) {
                toast.success("Remarks saved successfully");
            }
        } catch (error: any) {
            console.error("Error saving attendance:", error);
            toast.error(
                error.response?.data?.error?.message ||
                    "Failed to save attendance",
            );
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PRESENT":
                return "bg-green-100 text-green-700 border-green-200";
            case "ABSENT":
                return "bg-red-100 text-red-700 border-red-200";
            case "IDENTIFYING_ENTRY":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "IDENTIFYING_EXIT":
                return "bg-blue-100 text-blue-700 border-blue-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const filteredRecords = records.filter((r) => {
        const matchSearch =
            `${r.student.first_name} ${r.student.last_name} ${r.student.student_code}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchFilter =
            statusFilter === "All Status" || r.status === statusFilter;
        return matchSearch && matchFilter;
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const entryVerified = records.filter((r) => r.entry_verified_at).length;
    const exitVerified = records.filter((r) => r.exit_verified_at).length;

    if (loading) {
        return (
            <AcademicManagerLayout>
                <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            </AcademicManagerLayout>
        );
    }

    return (
        <AcademicManagerLayout>
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/ems/academic-manager/attendance"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Mark Attendance
                            </h1>
                            {session && (
                                <p className="text-sm text-gray-500">
                                    {session.batch_name} - {session.course_name}{" "}
                                    |{" "}
                                    {new Date(
                                        session.session_date,
                                    ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={fetchData}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {total}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-500">Present</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {present}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-500">Absent</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {absent}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Entry Verified
                                </p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {entryVerified}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Exit Verified
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {exitVerified}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {session && session.status !== "COMPLETED" && (
                        <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
                            <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-medium text-gray-700">
                                    Session Actions:
                                </span>
                                {session.status !== "IN_PROGRESS" && (
                                    <Button
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700"
                                        onClick={() =>
                                            updateSessionStatus("IN_PROGRESS")
                                        }
                                    >
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Open Entry Window
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        updateSessionStatus("PENDING")
                                    }
                                >
                                    <Camera className="h-4 w-4 mr-1" />
                                    Open Exit Window
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                    onClick={() =>
                                        updateSessionStatus("COMPLETED")
                                    }
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Mark Session Completed
                                </Button>
                                {session.status === "IN_PROGRESS" && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">
                                        LIVE TRACKING OPEN
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search student name or code..."
                                        className="pl-10 h-11 bg-gray-50 border-gray-100 focus:bg-white"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <select
                                    className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                >
                                    <option>All Status</option>
                                    <option>PRESENT</option>
                                    <option>ABSENT</option>
                                    <option>IDENTIFYING_ENTRY</option>
                                    <option>IDENTIFYING_EXIT</option>
                                </select>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        setStatusFilter(
                                            statusFilter === "Present Only"
                                                ? "All Status"
                                                : "Present Only",
                                        )
                                    }
                                >
                                    Present Only
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        setStatusFilter(
                                            statusFilter === "Absent Only"
                                                ? "All Status"
                                                : "Absent Only",
                                        )
                                    }
                                >
                                    Absent Only
                                </Button>
                            </div>

                            {filteredRecords.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">
                                        No students found matching current
                                        filters
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Entry (Arrival)
                                                </th>
                                                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Exit (Departure)
                                                </th>
                                                <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Remarks
                                                </th>
                                                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredRecords.map(
                                                (record, idx) => (
                                                    <tr
                                                        key={record.student_id}
                                                        className="hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="py-3 px-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                                                                    {
                                                                        record
                                                                            .student
                                                                            .first_name[0]
                                                                    }
                                                                    {
                                                                        record
                                                                            .student
                                                                            .last_name[0]
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {
                                                                            record
                                                                                .student
                                                                                .first_name
                                                                        }{" "}
                                                                        {
                                                                            record
                                                                                .student
                                                                                .last_name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {
                                                                            record
                                                                                .student
                                                                                .student_code
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3 text-center">
                                                            <Badge
                                                                className={getStatusColor(
                                                                    record.status,
                                                                )}
                                                            >
                                                                {record.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <div className="flex flex-col items-center gap-1">
                                                                {record.entry_image && (
                                                                    <img
                                                                        src={
                                                                            record.entry_image
                                                                        }
                                                                        alt="Entry"
                                                                        className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                                                                        onClick={() =>
                                                                            setSelectedStudent(
                                                                                record,
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                                {record.entry_verified_at ? (
                                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        {new Date(
                                                                            record.entry_verified_at,
                                                                        ).toLocaleTimeString(
                                                                            "en-US",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            },
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        No trace
                                                                    </span>
                                                                )}
                                                                {record.entry_distance !==
                                                                    undefined && (
                                                                    <span className="text-xs text-gray-400">
                                                                        Distance:{" "}
                                                                        {Math.round(
                                                                            record.entry_distance,
                                                                        )}
                                                                        m
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <div className="flex flex-col items-center gap-1">
                                                                {record.exit_image && (
                                                                    <img
                                                                        src={
                                                                            record.exit_image
                                                                        }
                                                                        alt="Exit"
                                                                        className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                                                                        onClick={() =>
                                                                            setSelectedStudent(
                                                                                record,
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                                {record.exit_verified_at ? (
                                                                    <span className="text-xs text-blue-600 flex items-center gap-1">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        {new Date(
                                                                            record.exit_verified_at,
                                                                        ).toLocaleTimeString(
                                                                            "en-US",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            },
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        No trace
                                                                    </span>
                                                                )}
                                                                {record.exit_distance !==
                                                                    undefined && (
                                                                    <span className="text-xs text-gray-400">
                                                                        Distance:{" "}
                                                                        {Math.round(
                                                                            record.exit_distance,
                                                                        )}
                                                                        m
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <Input
                                                                placeholder="Add insight..."
                                                                className="h-8 text-xs bg-gray-50 border-gray-100"
                                                                value={
                                                                    remarks[
                                                                        record
                                                                            .student_id
                                                                    ] || ""
                                                                }
                                                                onChange={(e) =>
                                                                    setRemarks(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [record.student_id]:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="py-3 px-3 text-center">
                                                            <div className="flex items-center gap-1 justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                                                                    onClick={() =>
                                                                        markAttendance(
                                                                            record.student_id,
                                                                            "PRESENT",
                                                                        )
                                                                    }
                                                                    title="Mark Present"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                                                    onClick={() =>
                                                                        markAttendance(
                                                                            record.student_id,
                                                                            "ABSENT",
                                                                        )
                                                                    }
                                                                    title="Mark Absent"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            variant="outline"
                            onClick={handleSaveRemarks}
                            disabled={saving}
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {saving ? "Saving..." : "Final Save"}
                        </Button>
                    </div>

                    {selectedStudent && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setSelectedStudent(null)}
                        >
                            <div
                                className="bg-white rounded-2xl max-w-lg w-full p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold mb-4">
                                    Student Detail
                                </h3>
                                <div className="space-y-4">
                                    <p className="font-medium">
                                        {selectedStudent.student.first_name}{" "}
                                        {selectedStudent.student.last_name}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedStudent.entry_image && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">
                                                    Arrival Trace
                                                </p>
                                                <img
                                                    src={
                                                        selectedStudent.entry_image
                                                    }
                                                    alt="Entry"
                                                    className="w-full rounded-xl"
                                                />
                                            </div>
                                        )}
                                        {selectedStudent.exit_image && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">
                                                    Departure Trace
                                                </p>
                                                <img
                                                    src={
                                                        selectedStudent.exit_image
                                                    }
                                                    alt="Exit"
                                                    className="w-full rounded-xl"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AcademicManagerLayout>
    );
}
