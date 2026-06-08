"use client";

import React from "react";
import {
    FileText,
    BarChart3,
    TrendingUp,
    Users,
    Building,
    CalendarCheck,
    MailCheck,
    ChevronRight,
    ArrowUpRight,
    Search,
    Download
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

export default function PlatformReports() {
    const reportCategories = [        { id: "usage", label: "Platform Utilization", count: "All Tenants Active", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", href: "/ems/platform-admin/reports/usage" },
        { id: "growth", label: "Scale & Expansion", count: "+5 Companies Q1", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", href: "/ems/platform-admin/reports/growth" },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200 border-4 border-white">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Intelligence Center
                            </h1>
                            <p className="text-sm text-slate-500 font-medium tracking-wide">EMS tenant, usage, growth and subscription analytics</p>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reportCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={cat.href}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <cat.icon className="w-24 h-24" />
                            </div>
                            <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-1">{cat.label}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.count}</p>

                            <div className="mt-8 flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Open Explorer <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Main Dashboard Widget */}
                <div className="bg-slate-900 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                    <BarChart3 className="w-20 h-20 text-indigo-400/20 mb-8 animate-pulse" />
                    <h2 className="text-3xl font-black mb-4">Select a Data Stream</h2>
                    <p className="text-slate-400 max-w-sm mx-auto text-center font-medium leading-relaxed mb-10">
                        Choose a category above to dive into detailed system metrics. All data is real-time and aggregated from all 150+ operational clusters.
                    </p>
                    <div className="flex gap-4">
                        <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">
                            Global PDF Export
                        </button>
                    </div>
                </div>

                {/* Warning / Audit Notice */}
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Confidential Data Flow</p>
                            <p className="text-[10px] text-slate-400 font-medium">Access to detailed PII in reports is logged per security protocol CORE-89. </p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline">Download Security Pack</button>
                </div>
            </div>
        </DashboardLayout>
    );
}
