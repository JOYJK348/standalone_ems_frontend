"use client";

import { motion } from "framer-motion";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Plus,
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    BookOpen,
    Layers
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function TutorBatchesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/batches");
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter(batch =>
        batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.batch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.courses?.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Batches</h1>
                    </div>
                    <Link href="/ems/tutor/batches/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Request New Batch Approval
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, code, or course..."
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                ) : filteredBatches.length === 0 ? (
                    <Card className="border-0 shadow-lg p-12 text-center">
                        <Layers className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Batches Found</h3>
                        <p className="text-gray-500 mb-6">You haven't requested any batches yet or none match your search.</p>
                        <Link href="/ems/tutor/batches/create">
                            <Button variant="outline">Request Your First Batch Approval</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBatches.map((batch) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full bg-white group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <Badge className={`
                                                px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border-0
                                                ${batch.approval_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                    batch.approval_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'}
                                            `}>
                                                {batch.approval_status}
                                            </Badge>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                                {batch.batch_code}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{batch.batch_name}</h3>
                                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                                                <BookOpen className="h-3 w-3" />
                                                {batch.courses?.course_name}
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-50">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{new Date(batch.start_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className="capitalize">{batch.batch_type}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">Total Capacity</span>
                                                <span className="font-bold text-gray-900">{batch.max_students} Students</span>
                                            </div>
                                        </div>

                                        {batch.approval_status === 'APPROVED' && (
                                            <Link href={`/ems/tutor/batches/${batch.id}`} className="mt-6 block">
                                                <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider">
                                                    View Details
                                                </Button>
                                            </Link>
                                        )}
                                        {batch.approval_status === 'REJECTED' && batch.rejection_reason && (
                                            <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                                <p className="text-[10px] font-bold text-rose-700 uppercase mb-1">Rejection Reason:</p>
                                                <p className="text-xs text-rose-600">{batch.rejection_reason}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
