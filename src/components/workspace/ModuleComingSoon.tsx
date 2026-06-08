"use client";

import React from "react";
import {
    MonitorPlay,
    Sparkles,
    Construction,
    ArrowLeft,
    Clock,
    Zap
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

export default function ModuleComingSoon({
    moduleName = "LMS",
    description = "Next-generation Learning Management System is being orchestrated for your organization."
}) {
    return (
        <DashboardLayout>
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="max-w-3xl w-full bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200 p-12 md:p-20 relative overflow-hidden text-center space-y-10">
                    {/* Ambient Background Glows */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse" />

                    <div className="relative z-10 space-y-8">
                        {/* Icon Cluster */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-200">
                                    <Construction className="w-10 h-10 text-white" />
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center animate-bounce">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Development Phase</h2>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                {moduleName} Environment <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Under Construction</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                                {description} We are currently fine-tuning the analytics engine and user experience.
                            </p>
                        </div>

                        {/* Progress Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            {[
                                { icon: Clock, label: "T-Minus", val: "Q2 2026" },
                                { icon: Zap, label: "Efficiency", val: "99.9%" },
                                { icon: Sparkles, label: "Status", val: "Polishing" }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50">
                                    <item.icon className="w-5 h-5 text-blue-500 mx-auto mb-3" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-sm font-black text-slate-900">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/ems/tenant-admin/dashboard"
                                className="flex items-center gap-3 px-8 py-5 bg-slate-900 hover:bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to Command
                            </Link>
                            <button className="px-8 py-5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all">
                                Request Early Access
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
