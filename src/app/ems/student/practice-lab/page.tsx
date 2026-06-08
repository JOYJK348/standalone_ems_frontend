"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Zap,
    ArrowRight,
    FileText,
    Calculator,
    IndianRupee,
    TrendingUp,
    Award,
    Clock,
    Target,
    Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';

export default function PracticeLabPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-purple-50"><Zap className="h-10 w-10 text-orange-500 animate-pulse" /></div>}>
            <PracticeLabContent />
        </Suspense>
    );
}

const MODULE_CONFIGS = {
    GST: {
        title: 'GST Practice Lab',
        subtitle: 'Master Goods & Services Tax Filing',
        description: 'Learn GSTR-1 filing with real-world scenarios. Practice invoice generation, tax calculation, and compliance.',
        icon: FileText,
        gradient: 'from-green-500 to-emerald-600',
        bgGradient: 'from-green-50 to-emerald-50',
        accentColor: 'green',
        features: ['GSTIN Validation', 'CGST/SGST/IGST Auto-calculation', 'Inter-state Detection', 'Invoice Management'],
        path: '/ems/student/practice-lab/gst'
    },
    TDS: {
        title: 'TDS Practice Lab',
        subtitle: 'Master Tax Deducted at Source',
        description: 'Practice Form 26Q filing with TRACES portal simulation. Learn TDS calculation, challan generation, and compliance.',
        icon: Calculator,
        gradient: 'from-orange-500 to-red-600',
        bgGradient: 'from-orange-50 to-red-50',
        accentColor: 'orange',
        features: ['TAN/PAN Validation', 'Auto TDS Calculation', 'Challan Verification', 'Section-wise Filing'],
        path: '/ems/student/practice-lab/tds'
    },
    INCOME_TAX: {
        title: 'Income Tax Practice Lab',
        subtitle: 'Master ITR Filing',
        description: 'Learn ITR-1 (Sahaj) filing with comprehensive income and deduction scenarios. Practice tax computation with latest slabs.',
        icon: IndianRupee,
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-50 to-indigo-50',
        accentColor: 'blue',
        features: ['PAN Validation', 'Tax Slab Calculation', 'Deduction Limits', '7-Step Wizard'],
        path: '/ems/student/practice-lab/income-tax'
    }
};

function PracticeLabContent() {
    const router = useRouter();
    const [allocations, setAllocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ems/practice/student/status');
            if (response.data.success) {
                setAllocations(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getModuleStats = (moduleType: string) => {
        const allocation = allocations.find(a => a.module_type === moduleType);
        return allocation || null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50">
                <TopNavbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Zap className="h-12 w-12 text-orange-500" />
                    </motion.div>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-purple-50">
            <TopNavbar />

            <div className="container mx-auto px-4 py-8 pb-24 max-w-7xl">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-2 rounded-full mb-4">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-bold">Professional Practice Environment</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 mb-4">
                            Finance Practice Lab
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Simulating real-world accounting scenarios with government portal interfaces
                        </p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Total Modules</p>
                                        <p className="text-3xl font-black">{allocations.length}</p>
                                    </div>
                                    <Target className="h-10 w-10 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Attempts Used</p>
                                        <p className="text-3xl font-black">
                                            {allocations.reduce((sum, a) => sum + (a.used_count || 0), 0)}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Remaining</p>
                                        <p className="text-3xl font-black">
                                            {allocations.reduce((sum, a) => sum + ((a.usage_limit || 0) - (a.used_count || 0)), 0)}
                                        </p>
                                    </div>
                                    <Award className="h-10 w-10 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Practice Modules */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full"></div>
                        Available Practice Modules
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {Object.entries(MODULE_CONFIGS).map(([key, config]) => {
                            const stats = getModuleStats(key);
                            const Icon = config.icon;
                            const isAvailable = stats !== null;
                            const usedCount = stats?.used_count || 0;
                            const totalLimit = stats?.usage_limit || 0;
                            const remaining = totalLimit - usedCount;
                            const progressPercent = totalLimit > 0 ? (usedCount / totalLimit) * 100 : 0;

                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    className="group"
                                >
                                    <Card className={`border-0 shadow-xl overflow-hidden h-full ${!isAvailable ? 'opacity-60' : ''}`}>
                                        {/* Header with Gradient */}
                                        <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <Icon className="h-32 w-32 transform rotate-12" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                                        <Icon className="h-8 w-8" />
                                                    </div>
                                                    {isAvailable && (
                                                        <Badge className="bg-white/20 text-white border-white/30">
                                                            {remaining} left
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-black mb-1">{config.title}</h3>
                                                <p className="text-sm opacity-90">{config.subtitle}</p>
                                            </div>
                                        </div>

                                        <CardContent className="p-6">
                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                {config.description}
                                            </p>

                                            {/* Features */}
                                            <div className="space-y-2 mb-6">
                                                {config.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                        <div className={`h-1.5 w-1.5 rounded-full bg-${config.accentColor}-500`}></div>
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Progress Bar */}
                                            {isAvailable && (
                                                <div className="mb-6">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                        <span>Progress</span>
                                                        <span>{usedCount} / {totalLimit} attempts</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progressPercent}%` }}
                                                            className={`h-full bg-gradient-to-r ${config.gradient}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <Button
                                                onClick={() => isAvailable && router.push(config.path)}
                                                disabled={!isAvailable || remaining <= 0}
                                                className={`w-full h-12 bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-bold rounded-xl shadow-lg group-hover:shadow-xl transition-all`}
                                            >
                                                {!isAvailable ? (
                                                    <>
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Not Available
                                                    </>
                                                ) : remaining <= 0 ? (
                                                    <>
                                                        <Award className="h-4 w-4 mr-2" />
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        Start Practice
                                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                >
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        Professional Practice Environment
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Each practice module simulates real government portals (GST Portal, TRACES, Income Tax e-Filing)
                                        with authentic workflows, validations, and calculations. Practice with confidence and master
                                        tax compliance procedures before handling real-world scenarios.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
