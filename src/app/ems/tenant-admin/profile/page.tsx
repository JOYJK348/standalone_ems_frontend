"use client";

import React from "react";
import {
    UserCircle,
    ShieldCheck,
    Key,
    Smartphone,
    History,
    Lock,
    LogOut,
    CheckCircle2,
    Briefcase,
    Building2,
    Mail,
    Phone
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function WorkspaceProfile() {
    const { user } = useAuthStore();

    const handleChangePassword = () => {
        toast.info("Password security flow initiated", {
            description: "Verification link sent to your registered email."
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header / Identity */}
                <div className="relative h-48 bg-slate-900 rounded-[40px] overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000" />

                    <div className="absolute -bottom-16 left-12">
                        <div className="w-32 h-32 bg-white rounded-[40px] border-8 border-white shadow-xl flex items-center justify-center font-black text-4xl text-slate-900 relative">
                            {user?.display_name?.charAt(0) || "A"}
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-20 px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.display_name || "Company Admin"}</h1>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
                            <Briefcase className="w-4 h-4 text-indigo-600" />
                            Level 4 • Organizational Authority
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
                    <div className="md:col-span-2 space-y-8">
                        {/* Account Details */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl"><UserCircle className="w-5 h-5" /></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account Profile</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 border border-transparent">
                                        {user?.display_name}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Authority</label>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-400 border border-transparent flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {user?.email || "admin@durkkas.com"}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100 flex items-start gap-4">
                                <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-indigo-900">Enterprise Access</h4>
                                    <p className="text-xs text-indigo-700/80 font-medium mt-1 leading-relaxed">
                                        You have root access to system-wide reports and branch governance. Personal data modifications must be verified by the platform owner.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl"><History className="w-5 h-5" /></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Login History</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { msg: "Logged in from Chrome (Windows)", time: "10 mins ago", ip: "192.168.1.45" },
                                    { msg: "Password update success", time: "2 days ago", ip: "192.168.1.45" },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{log.msg}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{log.ip}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Security Card */}
                        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <Lock className="w-12 h-12 text-indigo-400/30 mb-8" />
                            <h3 className="text-xl font-bold mb-2">Security Vault</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">Protect your administrative credentials with advanced 2FA and frequent key rotations.</p>

                            <div className="space-y-4">
                                <button onClick={handleChangePassword} className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                    <Key className="w-4 h-4" /> Change Key
                                </button>
                                <button className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                    <Smartphone className="w-4 h-4" /> Hardware MFA
                                </button>
                            </div>
                        </div>

                        {/* Logout Action */}
                        <div className="p-2 border-2 border-slate-50 rounded-[32px]">
                            <button className="w-full py-6 bg-rose-50 text-rose-600 rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-3 border border-rose-100">
                                <LogOut className="w-5 h-5" /> Terminate All Sessions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
