"use client";

import { useState, useEffect } from "react";
import HRManagerLayout from "@/components/layout/HRManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    CheckSquare,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Download,
    Calendar,
    Users,
    UserCheck,
    TrendingUp,
    Clock,
    Search,
    Filter,
    X,
} from "lucide-react";
import api from "@/lib/api";

interface AttendanceSession {
    id: number;
    courses: { course_name: string; course_code: string };
    session_date: string;
    session_type: string;
    status: string;
    total_count: number;
    present_count: number;
    attendanceRate: number;
}

interface AttendancePerson {
    id: string;
    student_id: number | null;
    user_id: number | null;
    user_type: string;
    first_name: string;
    last_name: string;
    email: string;
    code: string;
    total: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
}

interface Summary {
    totalSessions?: number;
    totalRecords: number;
    totalPresent: number;
    totalPeople?: number;
    overallRate: number;
    days: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState<"sessions" | "people">(
        "sessions",
    );
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [people, setPeople] = useState<AttendancePerson[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [days, setDays] = useState(30);
    const [userType, setUserType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                days: days.toString(),
                view: activeTab,
            });
            if (userType) params.set("user_type", userType);

            const res = await api.get(`/ems/hr/attendance?${params}`);
            if (res.data.success) {
                if (activeTab === "sessions") {
                    setSessions(res.data.data.sessions || []);
                    setTotalPages(res.data.data.pagination?.totalPages || 1);
                } else {
                    setPeople(res.data.data.people || []);
                    setTotalPages(1);
                }
                setSummary(res.data.data.summary || null);
            }
        } catch {
            toast.error("Failed to load attendance data");
            setSessions([]);
            setPeople([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, activeTab, userType, days]);

    const handleExport = () => {
        const headers =
            activeTab === "sessions"
                ? [
                      "Course",
                      "Date",
                      "Type",
                      "Status",
                      "Total",
                      "Present",
                      "Rate",
                  ]
                : [
                      "Name",
                      "Email",
                      "Type",
                      "Code",
                      "Total",
                      "Present",
                      "Late",
                      "Absent",
                      "Rate",
                  ];

        const rows =
            activeTab === "sessions"
                ? sessions.map((s) => [
                      s.courses?.course_name || s.courses?.course_code,
                      s.session_date,
                      s.session_type,
                      s.status,
                      s.total_count,
                      s.present_count,
                      `${s.attendanceRate}%`,
                  ])
                : people.map((p) => [
                      `${p.first_name} ${p.last_name}`,
                      p.email,
                      p.user_type,
                      p.code,
                      p.total,
                      p.present,
                      p.late,
                      p.absent,
                      `${p.attendanceRate}%`,
                  ]);

        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${activeTab}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report exported");
    };

    const filteredPeople = people.filter((p) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q)
        );
    });

    const tabs = [
        { id: "sessions" as const, label: "Sessions", icon: Calendar },
        { id: "people" as const, label: "People", icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <HRManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
                                    Attendance Hub
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Track attendance across all courses and
                                    personnel
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summary && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                                                {activeTab === "sessions"
                                                    ? "Total Sessions"
                                                    : "Total People"}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                                {activeTab === "sessions"
                                                    ? summary.totalSessions
                                                    : summary.totalPeople}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                                                Overall Rate
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                                {summary.overallRate}%
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                                Present
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                                {summary.totalPresent}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <UserCheck className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                                                Period
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                                {days}d
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tabs & Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPage(1);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <select
                                value={userType}
                                onChange={(e) => {
                                    setUserType(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Types</option>
                                <option value="STUDENT">Students</option>
                                <option value="TUTOR">Tutors</option>
                                <option value="STAFF">Staff</option>
                            </select>

                            <select
                                value={days}
                                onChange={(e) => {
                                    setDays(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={7}>Last 7 days</option>
                                <option value={30}>Last 30 days</option>
                                <option value={60}>Last 60 days</option>
                                <option value={90}>Last 90 days</option>
                            </select>

                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={
                                    loading ||
                                    (activeTab === "sessions"
                                        ? sessions.length === 0
                                        : filteredPeople.length === 0)
                                }
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* People tab search */}
                    {activeTab === "people" && (
                        <div className="relative max-w-md mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-gray-200"
                            />
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <span className="ml-3 text-gray-600">
                                Loading attendance data...
                            </span>
                        </div>
                    ) : activeTab === "sessions" ? (
                        /* ─── Sessions View ─── */
                        <>
                            <Card className="border-0 shadow-lg overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Course
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Total
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Present
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {sessions.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="px-6 py-12 text-center text-gray-500"
                                                        >
                                                            <CheckSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                                            <p className="font-medium">
                                                                No attendance
                                                                sessions found
                                                            </p>
                                                            <p className="text-sm">
                                                                Try adjusting
                                                                the date range
                                                                or filters
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    sessions.map((s, i) => (
                                                        <tr
                                                            key={s.id}
                                                            className="hover:bg-gray-50/50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <p className="font-medium text-gray-900">
                                                                    {s.courses
                                                                        ?.course_name ||
                                                                        s
                                                                            .courses
                                                                            ?.course_code}
                                                                </p>
                                                                {s.courses
                                                                    ?.course_code && (
                                                                    <p className="text-xs text-gray-400">
                                                                        {
                                                                            s
                                                                                .courses
                                                                                .course_code
                                                                        }
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {new Date(
                                                                    s.session_date,
                                                                ).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                        s.session_type ===
                                                                        "LECTURE"
                                                                            ? "bg-blue-100 text-blue-700"
                                                                            : s.session_type ===
                                                                                "LAB"
                                                                              ? "bg-purple-100 text-purple-700"
                                                                              : s.session_type ===
                                                                                  "EXAM"
                                                                                ? "bg-red-100 text-red-700"
                                                                                : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                                >
                                                                    {s.session_type ||
                                                                        "—"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                                {s.total_count}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                                {
                                                                    s.present_count
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${
                                                                                s.attendanceRate >=
                                                                                80
                                                                                    ? "bg-green-500"
                                                                                    : s.attendanceRate >=
                                                                                        50
                                                                                      ? "bg-yellow-500"
                                                                                      : "bg-red-500"
                                                                            }`}
                                                                            style={{
                                                                                width: `${s.attendanceRate}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span
                                                                        className={`text-xs font-bold ${
                                                                            s.attendanceRate >=
                                                                            80
                                                                                ? "text-green-700"
                                                                                : s.attendanceRate >=
                                                                                    50
                                                                                  ? "text-yellow-700"
                                                                                  : "text-red-700"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            s.attendanceRate
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ─── People View ─── */
                        <>
                            <Card className="border-0 shadow-lg overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Total
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Present
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Late
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Absent
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                                                        Rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredPeople.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
                                                            className="px-6 py-12 text-center text-gray-500"
                                                        >
                                                            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                                            <p className="font-medium">
                                                                No attendance
                                                                records found
                                                            </p>
                                                            <p className="text-sm">
                                                                Try adjusting
                                                                the filters
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredPeople.map(
                                                        (p, i) => (
                                                            <tr
                                                                key={p.id}
                                                                className="hover:bg-gray-50/50 transition-colors"
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <p className="font-medium text-gray-900">
                                                                        {
                                                                            p.first_name
                                                                        }{" "}
                                                                        {
                                                                            p.last_name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {
                                                                            p.email
                                                                        }
                                                                    </p>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span
                                                                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                            p.user_type ===
                                                                            "STUDENT"
                                                                                ? "bg-blue-100 text-blue-700"
                                                                                : p.user_type ===
                                                                                    "TUTOR"
                                                                                  ? "bg-green-100 text-green-700"
                                                                                  : "bg-purple-100 text-purple-700"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            p.user_type
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                                    {p.total}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-green-700 font-medium">
                                                                    {p.present}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-yellow-700 font-medium">
                                                                    {p.late}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-red-700 font-medium">
                                                                    {p.absent}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full transition-all ${
                                                                                    p.attendanceRate >=
                                                                                    80
                                                                                        ? "bg-green-500"
                                                                                        : p.attendanceRate >=
                                                                                            50
                                                                                          ? "bg-yellow-500"
                                                                                          : "bg-red-500"
                                                                                }`}
                                                                                style={{
                                                                                    width: `${p.attendanceRate}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span
                                                                            className={`text-xs font-bold ${
                                                                                p.attendanceRate >=
                                                                                80
                                                                                    ? "text-green-700"
                                                                                    : p.attendanceRate >=
                                                                                        50
                                                                                      ? "text-yellow-700"
                                                                                      : "text-red-700"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                p.attendanceRate
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-4 text-sm text-gray-500 text-center">
                                Showing {filteredPeople.length} of{" "}
                                {people.length} people
                            </div>
                        </>
                    )}
                </div>
            </HRManagerLayout>
        </div>
    );
}
