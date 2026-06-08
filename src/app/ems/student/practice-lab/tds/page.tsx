"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';
import { TDSPracticePortal } from '@/components/ems/practice/TDSPracticePortal';

export default function TDSLabPage() {
    const router = useRouter();
    const [allocation, setAllocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllocation();
    }, []);

    const fetchAllocation = async () => {
        try {
            const response = await api.get('/ems/practice/student/status');
            if (response.data.success) {
                const tdsAllocation = response.data.data.find((a: any) => a.module_type === 'TDS');
                if (tdsAllocation) {
                    setAllocation(tdsAllocation);
                } else {
                    toast.error('TDS Lab not available');
                    router.push('/ems/student/practice-lab');
                }
            }
        } catch (error) {
            toast.error('Failed to load TDS Lab');
            router.push('/ems/student/practice-lab');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        fetchAllocation();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Calculator className="h-12 w-12 text-orange-500" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            <TopNavbar />

            <div className="container mx-auto px-4 py-8 pb-24 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/ems/student/practice-lab')}
                        className="mb-4 hover:bg-orange-100"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Practice Lab
                    </Button>

                    <Card className="border-0 shadow-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white overflow-hidden">
                        <CardContent className="p-8 relative">
                            <div className="absolute top-0 right-0 opacity-10">
                                <Calculator className="h-48 w-48 transform rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-sm font-bold">TRACES Portal Simulation</span>
                                </div>
                                <h1 className="text-4xl font-black mb-3">TDS Practice Lab</h1>
                                <p className="text-lg opacity-90 mb-6">
                                    Master Form 26Q filing with realistic TDS scenarios
                                </p>
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <p className="opacity-75">Attempts Used</p>
                                        <p className="text-2xl font-bold">{allocation?.used_count || 0}</p>
                                    </div>
                                    <div className="h-12 w-px bg-white/30"></div>
                                    <div>
                                        <p className="opacity-75">Remaining</p>
                                        <p className="text-2xl font-bold">
                                            {(allocation?.usage_limit || 0) - (allocation?.used_count || 0)}
                                        </p>
                                    </div>
                                    <div className="h-12 w-px bg-white/30"></div>
                                    <div>
                                        <p className="opacity-75">Total Limit</p>
                                        <p className="text-2xl font-bold">{allocation?.usage_limit || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Portal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {allocation && (
                        <TDSPracticePortal
                            allocationId={allocation.id}
                            onSuccess={handleSuccess}
                        />
                    )}
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
