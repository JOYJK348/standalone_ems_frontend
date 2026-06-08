"use client";

import React from "react";
import {
    CalendarCheck,
    ArrowLeft,
    Search,
    Filter,
    Download,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PlatformReportDetail() {
    const pathname = usePathname();
    const type = pathname.split('/').pop()?.toUpperCase() || "REPORT";

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Back link */}
                <Link href="/ems/platform-admin/reports" className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Back to Intelligence Center</span>
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white border-4 border-slate-50 text-indigo-600 rounded-[24px] flex items-center justify-center shadow-sm">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                {type} EXPLORER
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">Detailed granulary view and historical trends for {type} data</p>
                        </div>
                    </div>

                    <button className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-3xl flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95">
                        <Download className="w-4 h-4" />
                        Generate Snapshot
                    </button>
                </div>

                {/* Main Filter Bar */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${type.toLowerCase()} records...`}
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-4 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-6 py-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all flex items-center gap-2 text-xs font-black uppercase">
                            <Filter className="w-4 h-4" />
                            Cluster: Global
                        </button>
                    </div>
                </div>

                {/* Data Grid Placeholder */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-40 h-40 bg-indigo-50 rounded-[48px] flex items-center justify-center mb-8 relative">
                        <Loader2 className="w-16 h-16 text-indigo-200 animate-spin" />
                        <TrendingUp className="absolute w-8 h-8 text-indigo-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Streaming Telemetry Data</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">Aggregating real-time {type.toLowerCase()} signals from all regional endpoints. This explorer provides safe, read-only analytics of the global dataset.</p>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
                        {[
                            { l: "Global Avg", v: "92%" },
                            { l: "Trend", v: "UP 4%" },
                            { l: "Anomaly", v: "NONE" },
                        ].map(item => (
                            <div key={item.l} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.l}</p>
                                <p className="text-xl font-black text-slate-900 mt-1">{item.v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-8">
                    <p className="text-[10px] font-black text-rose-900 uppercase tracking-[0.2em] leading-relaxed text-center">
                        SECURE_ACCESS_LOGGED: All report explorations are recorded in the platform audit trail under CORE-SEC-01.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
