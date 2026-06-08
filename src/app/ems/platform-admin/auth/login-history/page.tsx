"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Clock, Smartphone, Monitor, Globe, Search,
    ShieldCheck, ShieldAlert, History, Mail,
    User, HardDrive, Key, LogIn, MapPin
} from "lucide-react";

export default function LoginHistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await platformService.getLoginHistory();
            setHistory(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
            case 'FAILED': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
            case 'LOCKED': return <Key className="w-5 h-5 text-amber-500" />;
            default: return <History className="w-5 h-5 text-slate-400" />;
        }
    };

    const getDeviceIcon = (device: string) => {
        if (!device) return <Monitor className="w-4 h-4" />;
        if (device.toLowerCase().includes('mobile')) return <Smartphone className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                            <LogIn className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Session Monitoring</h1>
                            <p className="text-slate-500 font-medium">Real-time authentication analytics and access forensics</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="relative flex-1 min-w-[350px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search sessions by email, IP or device..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Ingress</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Credential Profile</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entry Status</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hardware context</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin (IP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="p-10"><div className="h-6 bg-slate-100 rounded-full w-24"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                                        </tr>
                                    ))
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-40 text-center text-slate-300 font-black text-xl uppercase tracking-widest bg-slate-50/20">
                                            No session activity recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((session: any) => (
                                        <tr key={session.id} className="group hover:bg-slate-50/40 transition-all duration-300">
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 font-mono text-xs font-bold text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                    {new Date(session.logged_in_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{session.user?.first_name || 'Anonymous Agent'}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{session.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-all">
                                                        {getStatusIcon(session.login_status)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${session.login_status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'
                                                            }`}>
                                                            {session.login_status}
                                                        </span>
                                                        {session.failure_reason && (
                                                            <span className="text-[10px] text-slate-400 font-medium italic">Reason: {session.failure_reason}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        {getDeviceIcon(session.device_type)}
                                                        <span className="text-xs font-black uppercase tracking-tight">{session.device_type || 'WORKSTATION'}</span>
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 line-clamp-1 max-w-[150px] font-medium italic" title={session.user_agent}>
                                                        {session.user_agent}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                    </div>
                                                    <code className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 antialiased">
                                                        {session.ip_address}
                                                    </code>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
