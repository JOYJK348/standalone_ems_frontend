"use client";

import React, { useState } from "react";
import {
    ShieldCheck,
    Lock,
    UserCog,
    Users,
    Activity,
    MailCheck,
    FileText,
    Save,
    RefreshCcw,
    Zap,
    CheckCircle2,
    XCircle,
    Info,
    LayoutDashboard
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface RuleTemplate {
    id: string;
    label: string;
    description: string;
    defaultState: boolean;
    category: "OPERATIONAL" | "ADMINISTRATIVE" | "PORTAL";
}

export default function PlatformRoleRules() {
    const [activeRole, setActiveRole] = useState<"COMPANY_ADMIN" | "BRANCH_ADMIN" | "EMPLOYEE">("BRANCH_ADMIN");
    const [loading, setLoading] = useState(false);

    const [rules, setRules] = useState<Record<string, RuleTemplate[]>>({
        COMPANY_ADMIN: [
            { id: "ca-branches", label: "Branch Creation", description: "Allow creating and managing unlimited sub-branches.", defaultState: true, category: "ADMINISTRATIVE" },
            { id: "ca-access", label: "Access Governance", description: "Permission to override branch admin control settings.", defaultState: true, category: "ADMINISTRATIVE" },
            { id: "ca-onboarding", label: "Global Onboarding", description: "Directly register employees at any branch.", defaultState: true, category: "OPERATIONAL" },
        ],
        BRANCH_ADMIN: [
            { id: "ba-attendance", label: "Daily Attendance Control", description: "Power to mark, edit, and finalize branch attendance.", defaultState: true, category: "OPERATIONAL" },
            { id: "ba-leaves", label: "Leave Approval Chain", description: "Process and decide on staff leave requests.", defaultState: true, category: "OPERATIONAL" },
            { id: "ba-reports", label: "Branch Analytics", description: "Access local reports and download workforce logs.", defaultState: true, category: "PORTAL" },
        ],
        EMPLOYEE: [
            { id: "emp-leave", label: "Leave Application", description: "Access to the leave request portal.", defaultState: true, category: "PORTAL" },
            { id: "emp-attendance", label: "Personal Register", description: "View monthly attendance and work logs.", defaultState: true, category: "PORTAL" },
            { id: "emp-profile", label: "Personal Info Edit", description: "Modify primary contact information.", defaultState: false, category: "PORTAL" },
        ]
    });

    const toggleRule = (role: string, ruleId: string) => {
        setRules(prev => ({
            ...prev,
            [role]: prev[role].map(r => r.id === ruleId ? { ...r, defaultState: !r.defaultState } : r)
        }));
    };

    const saveSystemTemplate = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Global Role Templates updated", {
                description: "New organizations will inherit these default permission sets."
            });
        }, 1000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                Role Definition Engine
                                <Zap className="w-5 h-5 text-indigo-500" />
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">Standardize operational capabilities for all tenants system-wide</p>
                        </div>
                    </div>

                    <button
                        onClick={saveSystemTemplate}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sync Master Policy
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-6 flex items-start gap-4">
                    <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-900">System Blueprint Note</h4>
                        <p className="text-sm text-amber-700 font-medium mt-1 leading-relaxed">
                            These templates define the absolute functional limits for each role. Company Admins can further restrict these within their tenants, but they cannot exceed these master definitions.
                        </p>
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="flex bg-slate-100 p-2 rounded-[32px] w-fit">
                    {[
                        { id: "COMPANY_ADMIN", label: "Company Level (4)", icon: UserCog },
                        { id: "BRANCH_ADMIN", label: "Branch Level (3)", icon: LayoutDashboard },
                        { id: "EMPLOYEE", label: "Member Portal (1)", icon: Users }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveRole(tab.id as any)}
                            className={`px-8 py-4 rounded-[24px] flex items-center gap-3 text-xs font-black uppercase tracking-wider transition-all ${activeRole === tab.id
                                    ? "bg-white text-indigo-600 shadow-md"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Rules Control Grid */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rules[activeRole].map((rule) => (
                            <button
                                key={rule.id}
                                onClick={() => toggleRule(activeRole, rule.id)}
                                className={`flex flex-col text-left p-8 rounded-[40px] border-2 transition-all group relative overflow-hidden ${rule.defaultState
                                        ? "border-indigo-100 bg-indigo-50/10 shadow-lg shadow-indigo-100/10"
                                        : "border-slate-50 opacity-60"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-all ${rule.defaultState ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    }`}>
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-2">{rule.label}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">{rule.description}</p>

                                <div className="mt-auto flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${rule.defaultState ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        }`}>
                                        {rule.defaultState ? "ENABLED BY DEFAULT" : "RESTRICTED"}
                                    </div>
                                </div>

                                <div className={`absolute top-6 right-6 w-12 h-6 rounded-full flex items-center px-1 transition-colors ${rule.defaultState ? "bg-indigo-600" : "bg-slate-200"}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${rule.defaultState ? "translate-x-6" : "translate-x-0"}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[40px] p-8 text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Policy Integrity</p>
                            <p className="text-sm font-bold">Standard blueprints are active. All companies are Inheriting the base policy.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
