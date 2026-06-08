"use client";

import React, { useState, useEffect } from "react";
import {
    Calendar,
    Users,
    ArrowLeft,
    Plus,
    Loader2,
    Play,
    XOctagon,
    CheckCircle2,
    Clock,
    Search,
    BookOpen,
    Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AttendanceManagementPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState<any[]>([]);
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [batchesRes, sessionsRes] = await Promise.all([
                api.get("/ems/batches"),
                api.get("/ems/attendance") // Fetches recent sessions
            ]);
            setBatches(batchesRes.data.data || []);
            // Filter sessions that are 'SCHEDULED' or 'IN_PROGRESS' as active
            const allSessions = sessionsRes.data.data || [];
            setActiveSessions(allSessions.filter((s: any) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'));
        } catch (error) {
            console.error("Failed to load attendance data", error);
            toast.error("Failed to load attendance records");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEntry = async (batchId: number, courseId: number) => {
        try {
            toast.loading("Opening attendance session...");
            const res = await api.post("/ems/attendance?mode=session", {
                batch_id: batchId,
                course_id: courseId,
                session_type: "LECTURE",
                session_date: new Date().toISOString().split('T')[0],
                start_time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
                end_time: "23:59", // Default end for now
                class_mode: "OFFLINE",
                require_face_verification: false
            });

            if (res.data.success) {
                toast.dismiss();
                toast.success("Attendance session opened!");
                fetchInitialData();
            }
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Failed to open session");
        }
    };

    const handleCloseEntry = async (sessionId: number) => {
        try {
            toast.loading("Closing attendance session...");
            const res = await api.post(`/ems/attendance?mode=session-status`, {
                session_id: sessionId,
                status: 'COMPLETED'
            });

            if (res.data.success) {
                toast.dismiss();
                toast.success("Attendance session closed.");
                fetchInitialData();
            }
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Failed to close session");
        }
    };

    const filteredBatches = batches.filter(b =>
        b.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.courses?.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">Attendance Portal</h1>
                        <p className="text-gray-500 font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            Manage daily attendance and session entries.
                        </p>
                    </motion.div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search batches..."
                            className="pl-11 rounded-2xl border-gray-100 bg-white h-12 shadow-sm focus:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Loading Attendance Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Summary & Active Sessions */}
                        <div className="lg:col-span-8 space-y-8">
                            {activeSessions.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                                        <Play className="h-5 w-5 text-emerald-500 fill-current" />
                                        In-Progress Sessions
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeSessions.map(session => (
                                            <Card key={session.id} className="border-0 shadow-xl shadow-emerald-500/10 rounded-[2rem] bg-white overflow-hidden border-l-4 border-emerald-500">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 rounded-md mb-2 font-black text-[10px] uppercase tracking-tighter">
                                                                Status: Open
                                                            </Badge>
                                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{session.batches?.batch_name}</h3>
                                                            <p className="text-sm font-bold text-gray-500">{session.courses?.course_name}</p>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                            <Users className="h-6 w-6 text-emerald-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                        <div>12 Students Marked</div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleCloseEntry(session.id)}
                                                        className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest transition-all shadow-lg"
                                                    >
                                                        <XOctagon className="mr-2 h-4 w-4" />
                                                        Close Entry
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section>
                                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Your Assigned Batches
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredBatches.length === 0 ? (
                                        <div className="col-span-2 p-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Batches Found</p>
                                        </div>
                                    ) : (
                                        filteredBatches.map(batch => (
                                            <Card key={batch.id} className="border-0 shadow-lg hover:shadow-xl transition-all rounded-[2rem] bg-white group overflow-hidden border-b-4 border-blue-500/10 hover:border-blue-500">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                                                            <Users className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Code</p>
                                                            <p className="text-xs font-bold text-gray-900">{batch.batch_code}</p>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{batch.batch_name}</h3>
                                                    <p className="text-sm font-bold text-gray-500 mb-6">{batch.courses?.course_name}</p>

                                                    <Button
                                                        onClick={() => handleOpenEntry(batch.id, batch.course_id)}
                                                        variant="outline"
                                                        className="w-full h-12 rounded-xl border-gray-100 font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                                        disabled={activeSessions.some(s => s.batch_id === batch.id)}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Open New Entry
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-gray-900 text-white overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                        <Info className="h-7 w-7 text-orange-400" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">How it works</h3>
                                    <div className="space-y-4 text-gray-400 font-medium text-sm leading-relaxed">
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                            <p>Click <span className="text-white">"Open New Entry"</span> when a live class or offline lab session begins.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                            <p>Students can then use their dashboard to check-in using the session code or QR.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                            <p>Click <span className="text-white">"Close Entry"</span> at the end of the class to finalize and submit for approval.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-[10px] tracking-widest text-amber-600 mb-1">Approval Rule</h4>
                                    <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                                        All finalized attendance sessions are automatically sent to the Academic Manager for verification before marks are officially recorded.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceManagementPage;
