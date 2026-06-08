"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Trash2, Clock, User, Database, Search,
    Filter, Archive, AlertCircle, RefreshCcw,
    ChevronRight, Eye, ListFilter, X, Code,
    FileJson, ShieldCheck, History
} from "lucide-react";

export default function DeletedLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDeletedLogs = async () => {
        try {
            setLoading(true);
            const data = await platformService.getAuditLogs();
            // Filter both DELETE and SOFT_DELETE actions
            const deletedOnly = (data || []).filter((log: any) =>
                log.action === 'DELETE' || log.action === 'SOFT_DELETE'
            );
            setLogs(deletedOnly);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedLogs();
    }, []);

    const openEvidence = (log: any) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-bold">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center text-white shadow-2xl shadow-rose-100 ring-8 ring-rose-50">
                            <Archive className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">System Archives</h1>
                            <p className="text-slate-500 font-medium">Record of soft-deleted entities and inactivation protocols</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-xl font-bold">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                            <input
                                type="text"
                                placeholder="Search archives by entity, actor or reason..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={fetchDeletedLogs}
                            className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold border-separate border-spacing-0">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inactivation Time</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Archived Entity</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Actor</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Removal Rationale</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Data Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-900">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-64"></div></td>
                                            <td className="p-10 text-right"><div className="h-10 w-10 bg-slate-50 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-40 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <ListFilter className="w-16 h-16 opacity-10" />
                                                <p className="font-black text-xl uppercase tracking-widest text-slate-300">Archives are empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log: any) => (
                                        <tr key={log.id} className="group hover:bg-rose-50/20 transition-all duration-300 font-bold">
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 font-mono text-[11px] font-bold text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                                                    {new Date(log.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-1.5 font-bold">
                                                    <div className="flex items-center gap-2 font-black text-sm text-slate-900 uppercase tracking-tight">
                                                        <Database className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
                                                        {log.table_name || 'GENERIC'}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded w-fit">ID: {log.resource_id?.split('-')[0] || log.record_id?.split('-')[0]}...</span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 font-bold">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.user?.first_name || 'System'}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ADMINISTRATOR</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-2xl max-w-xs group-hover:bg-white transition-all font-bold">
                                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                                    <span className="text-[11px] font-bold text-rose-700 leading-tight italic">
                                                        {log.new_values?.delete_reason || log.new_values?.reason || 'Protocol Archival Requirement'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right">
                                                <button onClick={() => openEvidence(log)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm ml-auto">
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

            {/* Forensic Data Evidence Modal */}
            {isModalOpen && selectedLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="px-12 py-10 bg-slate-900 flex items-center justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center shadow-2xl ring-8 ring-rose-900/10">
                                    <FileJson className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2">Forensic Data Evidence</h2>
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">Immutable Snapshot of Archived Entity</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="p-12 bg-white max-h-[75vh] overflow-y-auto custom-scrollbar text-slate-900">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 font-bold">
                                {/* Last Known State */}
                                <div className="space-y-6 font-bold">
                                    <div className="flex items-center gap-3 mb-2">
                                        <History className="w-5 h-5 text-rose-500" />
                                        <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest">Final Operational State</h3>
                                    </div>
                                    <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden font-bold">
                                        <div className="p-6 bg-white/50 border-b border-slate-100 flex items-center justify-between font-bold">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schema Data</span>
                                            <Code className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {selectedLog?.old_values ? (
                                                <table className="w-full text-left">
                                                    <tbody className="divide-y divide-slate-100">
                                                        {Object.entries(selectedLog.old_values).map(([key, value]) => (
                                                            <tr key={key} className="group hover:bg-slate-100/50 transition-all">
                                                                <td className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider w-1/3">{key.replace(/_/g, ' ')}</td>
                                                                <td className="py-3 px-6 text-xs font-bold text-slate-700 font-mono break-all">
                                                                    {value === null ? <span className="text-slate-300 italic">null</span> :
                                                                        typeof value === 'boolean' ? (value ? 'True' : 'False') :
                                                                            String(value)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-8 text-center text-slate-400 text-xs italic">No previous data available</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Archival Metadata */}
                                <div className="space-y-6 font-bold">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Protocol Metadata</h3>
                                    </div>
                                    <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden font-bold">
                                        <div className="p-6 bg-white/50 border-b border-slate-100 flex items-center justify-between font-bold">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mutation Details</span>
                                            <ShieldCheck className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {selectedLog?.new_values ? (
                                                <table className="w-full text-left">
                                                    <tbody className="divide-y divide-slate-100">
                                                        {Object.entries(selectedLog.new_values).map(([key, value]) => (
                                                            <tr key={key} className="group hover:bg-indigo-50/30 transition-all">
                                                                <td className="py-3 px-6 text-[10px] font-black text-indigo-300 uppercase tracking-wider w-1/3">{key.replace(/_/g, ' ')}</td>
                                                                <td className="py-3 px-6 text-xs font-bold text-indigo-900 font-mono break-all">
                                                                    {value === null ? <span className="text-slate-300 italic">null</span> :
                                                                        typeof value === 'boolean' ? (value ? 'True' : 'False') :
                                                                            String(value)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-8 text-center text-slate-400 text-xs italic">No mutation data available</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-6 p-8 bg-rose-50 border border-rose-100 rounded-[2rem] font-bold">
                                        <div className="flex items-center gap-3 mb-4 font-bold">
                                            <AlertCircle className="w-5 h-5 text-rose-500" />
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Certified Archival Reason</span>
                                        </div>
                                        <p className="text-sm font-bold text-rose-900 leading-relaxed italic">
                                            "{selectedLog?.new_values?.delete_reason || selectedLog?.new_values?.reason || 'Institutional necessity and system-wide inactivation protocol.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap gap-8 items-center justify-between font-bold">
                                <div className="flex items-center gap-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Resource Identity</p>
                                        <p className="text-xs font-black text-slate-900 mono">#{selectedLog?.resource_id || selectedLog?.record_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Journal Entry</p>
                                        <p className="text-xs font-black text-slate-900 mono">REC-{selectedLog?.id || 'UNKNOWN'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-rose-600 transition-all active:scale-95 shadow-2xl uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss Forensic View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
