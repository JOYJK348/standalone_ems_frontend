"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Activity, ShieldAlert, Clock, Mail, Globe,
    Monitor, Database, User, Search, Filter,
    Eye, ChevronDown, ListFilter, Shield
} from "lucide-react";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await platformService.getAuditLogs();
            setLogs(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'UPDATE': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center text-white shadow-2xl shadow-rose-100 ring-8 ring-rose-50">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Audit Trail</h1>
                            <p className="text-slate-500 font-medium">Immutable record of systemic mutations and administrative actions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="h-14 px-6 bg-white border border-slate-100 rounded-2xl text-slate-600 font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                            <ListFilter className="w-4 h-4" />
                            <span>Export Ledger</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="relative flex-1 min-w-[350px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search ledger by actor, resource or action..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-rose-100 transition-all outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['Platform', 'Company', 'System'].map(filter => (
                                <button key={filter} className="h-10 px-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Marker</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mutation Type</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Actor</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Resource</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10"><div className="h-6 bg-slate-100 rounded-full w-24"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10 text-right"><div className="h-10 w-10 bg-slate-50 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-40 text-center text-slate-300 font-black text-xl uppercase tracking-widest bg-slate-50/20">
                                            Audit ledger is currently pristine.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log: any) => (
                                        <tr key={log.id} className="group hover:bg-slate-50/40 transition-all duration-300">
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 font-mono text-xs font-bold text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-400 transition-colors" />
                                                    {new Date(log.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.user?.first_name || 'System Entity'}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.user_email || 'internal@durkkas.com'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 font-black text-xs text-slate-700 uppercase tracking-tight">
                                                        <Database className="w-3.5 h-3.5 text-slate-300" />
                                                        {log.table_name || 'GENERIC'}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded w-fit">ID: {log.resource_id}</span>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right">
                                                <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
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
