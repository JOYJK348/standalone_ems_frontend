"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    ShieldCheck, Plus, Loader2, X, Search,
    Link as LinkIcon, ShieldAlert, Trash2,
    Database, Settings, Fingerprint, Lock,
    CheckCircle2, ChevronRight, Activity, Clock
} from "lucide-react";

export default function RolePermissionsPage() {
    const [mappings, setMappings] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        role_id: '',
        permission_id: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mapData, roleData, permData] = await Promise.all([
                platformService.getRolePermissions(),
                platformService.getRoles(),
                platformService.getPermissions()
            ]);

            const activeRoles = (roleData || []).filter((r: any) => r.is_active !== false);
            const activePerms = (permData || []).filter((p: any) => p.is_active !== false);
            const roleMap = new Map(activeRoles.map((r: any) => [r.id, r]));
            const permMap = new Map(activePerms.map((p: any) => [p.id, p]));

            setMappings((mapData || [])
                .filter((m: any) => m.is_active !== false)
                .map((m: any) => ({
                    ...m,
                    role: roleMap.get(m.role_id),
                    permission: permMap.get(m.permission_id)
                }))
            );
            setRoles(activeRoles);
            setPermissions(activePerms);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({ role_id: '', permission_id: '' });
        setSelectedMapping(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createRolePermission(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to establish protocol mapping');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMapping || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteRolePermission(selectedMapping.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error: any) {
            alert('Failed to revoke protocol assignment');
        } finally {
            setDeleting(false);
        }
    };

    const openDelete = (mapping: any) => {
        setSelectedMapping(mapping);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-bold text-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50 font-bold">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Access Matrix</h1>
                            <p className="text-slate-500 font-medium">Bridges granular permissions to system-wide orchestration roles</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Map Protocol</span>
                    </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-6 font-bold">
                        <div className="relative flex-1 max-w-xl font-bold">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                            <input
                                type="text"
                                placeholder="Search matrix by role or permission token..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                            <Activity className="w-4 h-4" />
                            Active Mappings: {mappings.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto font-bold">
                        <table className="w-full text-left font-bold border-separate border-spacing-0">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Profile (Role)</th>
                                    <th className="py-6 px-10 text-center"><div className="w-px h-6 bg-slate-200 mx-auto" /></th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Token (Permission)</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-900">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="p-10 text-center"><div className="w-3 h-3 bg-slate-50 rounded-full mx-auto"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-64"></div></td>
                                            <td className="p-10 text-right"><div className="h-10 w-10 bg-slate-50 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    mappings.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                                            <td className="p-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg font-bold">
                                                        <Fingerprint className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1.5">{item.role?.display_name || item.role?.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">LVL: {item.role?.name?.includes('ADMIN') ? '5' : '1'} Orchestration</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-center">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100 group-hover:rotate-90 transition-all duration-500">
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 w-fit uppercase tracking-tight shadow-sm font-bold">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        {item.permission?.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-1 text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                                                        <Settings className="w-3 h-3" /> SCHEMA: {item.permission?.schema_name || 'AUTH'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Clock className="w-3 h-3 text-slate-300" />
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded w-fit">VERIFIED BINDING</span>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right">
                                                <button onClick={() => openDelete(item)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-rose-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm ml-auto font-bold">
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Matrix Mapping Modal (Create) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-14 py-12 bg-slate-900 flex items-center justify-between text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-2xl ring-8 ring-indigo-900/20 font-bold">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2 font-bold">Bridge Matrix</h2>
                                    <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] font-bold">Establishing Security Protocol Mappings</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-14 space-y-10 bg-white text-slate-900 font-bold font-bold">
                            <div className="space-y-8 font-bold font-bold">
                                <div className="space-y-3 font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Target Identity (Role)</label>
                                    <select
                                        required value={formData.role_id}
                                        onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none font-bold"
                                    >
                                        <option value="">Select Target Role</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.display_name || r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Required Security Token (Permission)</label>
                                    <select
                                        required value={formData.permission_id}
                                        onChange={e => setFormData({ ...formData, permission_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none font-mono font-bold"
                                    >
                                        <option value="">Select Protocol Token</option>
                                        {permissions.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 text-slate-900 font-bold">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                >
                                    Cancel Protocol
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Mapping</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation (Delete) Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900 font-bold font-bold">
                    <div className="bg-white rounded-[4rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 font-bold">
                        <div className="p-12 text-center text-slate-900 font-bold font-bold font-bold">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl ring-8 ring-rose-50 font-bold">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-bold">Revoke Permission?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-3 px-6 italic font-bold">Severing mapping between <span className="text-slate-900 font-black">"{selectedMapping?.role?.display_name || selectedMapping?.role?.name}"</span> and <span className="text-slate-900 font-black">"{selectedMapping?.permission?.name}"</span>. System-wide protocol access will be terminated immediately.</p>

                            <div className="mt-8 text-left space-y-2 font-bold font-bold">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase font-bold tracking-widest">Reason for mapping revocation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none font-bold" placeholder="Security rationale for access revocation..." />
                            </div>

                            <div className="flex gap-4 mt-8 font-bold">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2rem] bg-slate-100 text-slate-600 font-black">Abort</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Revoke Matrix</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
