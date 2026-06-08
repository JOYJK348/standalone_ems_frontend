"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Calendar,
    Clock,
    BookOpen,
    ArrowLeft,
    Plus,
    Loader2,
    CheckCircle2,
    Building,
    Target,
    Users2,
    Info
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
import { toast } from "sonner";
import { motion } from "framer-motion";

const CreateBatchPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        course_id: "",
        batch_name: "",
        batch_code: "",
        batch_type: "WEEKDAY",
        start_date: "",
        end_date: "",
        start_time: "09:00",
        end_time: "10:00",
        max_students: 30
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post("/ems/batches", {
                ...formData,
                course_id: Number(formData.course_id),
                max_students: Number(formData.max_students)
            });

            if (response.data.success) {
                toast.success("Batch created and sent for approval!");
                router.push("/ems/tutor/courses"); // Or redirect to a batches list if it exists
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create batch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 rounded-2xl hover:bg-white shadow-sm transition-all group"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">Request New Batch Approval</h1>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tight text-gray-900">General Information</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Course</Label>
                                        <Select
                                            value={formData.course_id}
                                            onValueChange={(v) => setFormData({ ...formData, course_id: v })}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus:ring-2 focus:ring-blue-500 transition-all">
                                                <SelectValue placeholder="Select a course" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                                                {courses.map(course => (
                                                    <SelectItem key={course.id} value={course.id.toString()} className="font-bold py-3">
                                                        {course.course_name} ({course.course_code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Batch Name</Label>
                                            <Input
                                                placeholder="e.g. Spring 2024 Advanced"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                                                value={formData.batch_name}
                                                onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Batch Code</Label>
                                            <Input
                                                placeholder="e.g. BATCH-24-S1"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6 uppercase"
                                                value={formData.batch_code}
                                                onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Batch Schedule Type</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {["WEEKDAY", "WEEKEND"].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, batch_type: type })}
                                                    className={`py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-2 ${formData.batch_type === type
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                        : "bg-white border-gray-100 text-gray-400 hover:border-blue-200"
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <Calendar className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tight text-gray-900">Schedule & Capacity</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Start Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="date"
                                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold pl-12"
                                                    value={formData.start_date}
                                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">End Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="date"
                                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold pl-12"
                                                    value={formData.end_date}
                                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Daily Start Time</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="time"
                                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold pl-12"
                                                    value={formData.start_time}
                                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Capacity (Max Students)</Label>
                                            <div className="relative">
                                                <Users2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold pl-12"
                                                    value={formData.max_students}
                                                    onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-16 rounded-[1.5rem] bg-gray-900 hover:bg-black text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Submit for Approval"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-gray-900 text-white overflow-hidden">
                            <CardContent className="p-8">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Loader2 className="h-7 w-7 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Manager Approval</h3>
                                <div className="space-y-4 text-gray-400 font-medium text-sm leading-relaxed">
                                    <p className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>New batches require review by an Academic Manager before activation.</span>
                                    </p>
                                    <p className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>Once approved, you can start enrolling students and scheduling classes.</span>
                                    </p>
                                    <p className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>You will be notified once the status changes to APPROVED.</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                                <Info className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-[10px] tracking-widest text-amber-600 mb-1">Important Note</h4>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Ensure batch codes follow the institutional format (e.g., YEAR-COURSE-SEQUENCE) to maintain curriculum consistency.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBatchPage;
