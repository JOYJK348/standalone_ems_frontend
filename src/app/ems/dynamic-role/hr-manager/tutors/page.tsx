"use client";

import { useState, useEffect } from "react";
import HRManagerLayout from "@/components/layout/HRManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import {
    GraduationCap,
    Search,
    Loader2,
    BookOpen,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

interface Tutor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    employee_code: string;
    department_id: number;
    designation_id: number;
    is_active: boolean;
    courses: any[];
    courseCount: number;
}

const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
};

export default function TutorsPage() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTutors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });
            if (search) params.set("search", search);
            const res = await api.get(`/ems/hr/tutors?${params}`);
            if (res.data.success) {
                setTutors(res.data.data.data || []);
                setTotalPages(res.data.data.pagination?.totalPages || 1);
            }
        } catch (err: any) {
            toast.error("Failed to load tutors");
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, [page]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <HRManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
                            Tutor Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            View and manage tutors across all courses
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search tutors..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10 border-gray-200"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <span className="ml-3 text-gray-600">
                                Loading tutors...
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {tutors.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No tutors found</p>
                                    </div>
                                ) : (
                                    tutors.map((tutor, i) => (
                                        <div key={tutor.id}>
                                            <Link
                                                href={`/ems/dynamic-role/hr-manager/tutors/${tutor.id}`}
                                            >
                                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                                                    <CardContent className="p-5">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">
                                                                        {
                                                                            tutor.first_name
                                                                        }{" "}
                                                                        {
                                                                            tutor.last_name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {tutor.employee_code ||
                                                                            "—"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tutor.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                                                            >
                                                                {tutor.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1.5 mb-3">
                                                            {tutor.email && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="h-3.5 w-3.5" />
                                                                    <span className="truncate">
                                                                        {
                                                                            tutor.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {tutor.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {
                                                                            tutor.phone
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                            <div className="flex items-center gap-1.5">
                                                                <BookOpen className="h-4 w-4 text-indigo-400" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {
                                                                        tutor.courseCount
                                                                    }{" "}
                                                                    Courses
                                                                </span>
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
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
                    )}
                </div>
            </HRManagerLayout>
        </div>
    );
}
