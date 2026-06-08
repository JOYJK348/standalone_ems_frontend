"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    ShieldCheck, Plus, Loader2, X, Search,
    Filter, MoreVertical, ShieldAlert,
    Fingerprint, HardDrive, Cpu, Zap,
    Edit3, Trash2, Shield
} from "lucide-react";

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        display_name: '',
        description: '',
        level: 0,
        role_type: 'CUSTOM',
        product: ''
    });

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await platformService.getRoles();
            setRoles((data || []).filter((r: any) => r.is_active !== false));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            await platformService.createRole(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchRoles();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to define role');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        try {
            setUpdating(true);
            await platformService.updateRole(selectedRole.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchRoles();
        } catch (error: any) {
            alert('Failed to recalibrate protocol');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteRole(selectedRole.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchRoles();
        } catch (error: any) {
            alert('Failed to archive protocol');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (role: any) => {
        setSelectedRole(role);
        setFormData({ ...role });
        setIsEditModalOpen(true);
    };

    const openDelete = (role: any) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', display_name: '', description: '', level: 0, role_type: 'CUSTOM', product: '' });
        setSelectedRole(null);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-100 ring-8 ring-emerald-50">
                            <Fingerprint className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Access Matrix</h1>
                            <p className="text-slate-500 font-medium">Definition of systemic roles and authorization protocols</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Define Protocol</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 rounded-[2.5rem] bg-slate-50 animate-pulse border border-slate-100" />
                        ))
                    ) : roles.length === 0 ? (
                        <div className="col-span-full py-32 text-center text-slate-300 font-black text-xl uppercase tracking-widest bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            No access protocols established
                        </div>
                    ) : (
                        roles.map((role: any) => (
                            <div key={role.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 overflow-hidden text-slate-900 font-bold">
                                <div className="absolute top-0 right-0 p-4 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center opacity-40">
                                        <Zap className="w-8 h-8 text-emerald-600" />
                                    </div>
                                </div>

                                <div className="flex flex-col h-full space-y-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${role.is_system_role ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {role.is_system_role ? 'System Module' : 'Custom Policy'}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                                            <HardDrive className="w-3.5 h-3.5" /> L{role.level}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-1">{role.display_name || role.name}</h3>
                                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{role.description || 'No systemic definition provided for this protocol.'}</p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol Type</span>
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{role.role_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(role)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openDelete(role)} className="w-10 h-10 rounded-xl bg-slate-50 text-rose-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-12 py-10 bg-emerald-600 flex items-center justify-between text-white">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                    <Cpu className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight tracking-wider uppercase text-white">{isEditModalOpen ? 'Recalibrate Protocol' : 'Protocol Registry'}</h2>
                                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Establishing systemic access hierarchy</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-3 hover:bg-white/10 rounded-full transition-all text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-12 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-900 font-bold">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Protocol Code Name</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-mono font-bold focus:ring-4 focus:ring-emerald-100 outline-none"
                                        placeholder="e.g. CORE_MANAGER"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Display Designation</label>
                                    <input
                                        type="text" required
                                        value={formData.display_name}
                                        onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-100 outline-none"
                                        placeholder="e.g. Core Operations Manager"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Clearance Level (0-9)</label>
                                        <input
                                            type="number" required min="0" max="9"
                                            value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-100 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Architecture Tier</label>
                                        <select
                                            required value={formData.role_type}
                                            onChange={e => setFormData({ ...formData, role_type: e.target.value })}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-emerald-100 outline-none appearance-none"
                                        >
                                            <option value="CUSTOM">CUSTOM</option>
                                            <option value="PLATFORM">PLATFORM</option>
                                            <option value="COMPANY">COMPANY</option>
                                            <option value="PRODUCT">PRODUCT</option>
                                            <option value="BRANCH">BRANCH</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Functional Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-3xl bg-slate-50 border-none p-6 text-sm font-medium focus:ring-4 focus:ring-emerald-100 outline-none resize-none"
                                        placeholder="Define the scope and responsibilities of this protocol..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || updating}
                                    className="flex-[2] h-16 rounded-[2rem] bg-emerald-600 text-white font-black hover:bg-slate-900 shadow-2xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {creating || updating ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Commit Protocol</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Archive Confirmation (Delete) Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900 font-bold">
                    <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-8 ring-rose-50">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase">Archive Protocol?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-2 px-6 italic">Inactivating <span className="text-slate-900 font-black">"{selectedRole?.display_name || selectedRole?.name}"</span>. This will immediately revoke processing rights for all identities bound to this protocol.</p>

                            <div className="mt-8 text-left space-y-2">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Reason for protocol archival</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none" placeholder="Administrative rationale for protocol suspension..." />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2rem] bg-slate-100 text-slate-600 font-black">Abort Archival</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Archive Protocol</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
