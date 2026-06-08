"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Lock, Plus, Loader2, X, Search,
    ChevronRight, ShieldCheck, LayoutGrid, Key,
    UserCheck, Settings, Eye, Edit3, Trash2,
    ShieldAlert, Info
} from "lucide-react";

export default function MenuPermissionsPage() {
    const [mappings, setMappings] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        menu_id: '',
        permission_id: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mapData, menuData, permData] = await Promise.all([
                platformService.getMenuPermissions(),
                platformService.getMenuRegistry(),
                platformService.getPermissions()
            ]);
            setMappings((mapData || []).filter((m: any) => m.is_active !== false));
            setMenus((menuData || []).filter((m: any) => m.is_active !== false));
            setPermissions((permData || []).filter((p: any) => p.is_active !== false));
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
        setFormData({ menu_id: '', permission_id: '' });
        setSelectedMapping(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createMenuPermission(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to establish access rule');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMapping) return;
        try {
            setUpdating(true);
            await platformService.updateMenuPermission(selectedMapping.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert('Failed to recalibrate access rule');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMapping || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteMenuPermission(selectedMapping.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error: any) {
            alert('Failed to revoke access rule');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (mapping: any) => {
        setSelectedMapping(mapping);
        setFormData({
            menu_id: mapping.menu_id?.toString() || '',
            permission_id: mapping.permission_id?.toString() || ''
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (mapping: any) => {
        setSelectedMapping(mapping);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-bold">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 font-bold">
                        <div className="w-16 h-16 rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-purple-100 ring-8 ring-purple-50">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Navigation Guard</h1>
                            <p className="text-slate-500 font-medium">Control UI visibility based on systemic security protocols</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-purple-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Establish Access Rule</span>
                    </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="relative flex-1 min-w-[350px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search rules by menu, token or key..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold border-separate border-spacing-0">
                            <thead className="bg-slate-50/50 border-b border-slate-50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Interface Component</th>
                                    <th className="py-6 px-10 text-center"><div className="w-px h-6 bg-slate-200 mx-auto" /></th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Required Protocol Token</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold">
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
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                                        <LayoutGrid className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1.5">{item.menu?.display_name}</div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">{item.menu?.menu_key}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-center">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100 group-hover:rotate-90 transition-all duration-500">
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600" />
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 font-mono text-xs font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 w-fit uppercase tracking-tight shadow-sm">
                                                        <Key className="w-3.5 h-3.5" /> {item.permission?.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-1 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                                                        <Settings className="w-3 h-3" /> SCHEMA: {item.permission?.schema_name || 'AUTH'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => openEdit(item)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openDelete(item)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-rose-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Access Protocol Modal (Create/Edit) */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-14 py-12 bg-slate-900 flex items-center justify-between text-white relative">
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-2xl text-white">
                                    {isEditModalOpen ? <Edit3 className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2">
                                        {isEditModalOpen ? 'Recalibrate Guard' : 'Access Guard'}
                                    </h2>
                                    <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em]">
                                        {isEditModalOpen ? 'Re-Establishing Identity Protocol Binding' : 'Binding Interface to Security Protocol'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-14 space-y-10 bg-white text-slate-900 font-bold">
                            <div className="space-y-8 font-bold">
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em]">Target Interface Component (Menu)</label>
                                    <select required value={formData.menu_id} onChange={e => setFormData({ ...formData, menu_id: e.target.value })} className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 outline-none transition-all">
                                        <option value="">Select Menu Component</option>
                                        {menus.map(m => (
                                            <option key={m.id} value={m.id}>{m.display_name} ({m.menu_key})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em]">Required Security Token (Permission)</label>
                                    <select required value={formData.permission_id} onChange={e => setFormData({ ...formData, permission_id: e.target.value })} className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 font-mono outline-none transition-all">
                                        <option value="">Select Protocol Token</option>
                                        {permissions.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 text-slate-900">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all rounded-[2rem]">Cancel</button>
                                <button type="submit" disabled={saving || updating} className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-purple-600 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {(saving || updating) ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> {isEditModalOpen ? 'Commit Recalibration' : 'Commit Rule'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation (Delete) Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900 font-bold">
                    <div className="bg-white rounded-[4rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl ring-8 ring-rose-50 font-bold">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Revoke Access Rule?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-3 px-6 italic font-bold leading-relaxed">Binding between <span className="text-slate-900 font-black">"{selectedMapping?.menu?.display_name}"</span> and <span className="text-slate-900 font-black">"{selectedMapping?.permission?.name}"</span> will be severed. Users without explicit bypass will lose access to this interface immediately.</p>

                            <div className="mt-8 text-left space-y-2 font-bold">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Reason for revocation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none" placeholder="Security rationale for access revocation..." />
                            </div>

                            <div className="flex gap-4 mt-8 font-bold">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2rem] bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-all font-bold">Abort</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Revoke Rule</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
