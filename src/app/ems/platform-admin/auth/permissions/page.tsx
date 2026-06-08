"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Key, Plus, Loader2, X, Search,
    ShieldCheck, Activity, Database, Globe,
    Lock, Package, Eye, Edit3, Trash2,
    ShieldAlert, Info
} from "lucide-react";

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedPerm, setSelectedPerm] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        resource: '',
        action: 'READ',
        schema_name: 'public',
        permission_scope: 'COMPANY',
        description: ''
    });

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const data = await platformService.getPermissions();
            setPermissions((data || []).filter((p: any) => p.is_active !== false));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            await platformService.createPermission(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchPermissions();
        } catch (error: any) {
            alert('Failed to provision token');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPerm) return;
        try {
            setUpdating(true);
            await platformService.updatePermission(selectedPerm.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchPermissions();
        } catch (error: any) {
            alert('Failed to recalibrate protocol');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPerm || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deletePermission(selectedPerm.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchPermissions();
        } catch (error: any) {
            alert('Failed to archive token');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (perm: any) => {
        setSelectedPerm(perm);
        setFormData({ ...perm });
        setIsEditModalOpen(true);
    };

    const openDelete = (perm: any) => {
        setSelectedPerm(perm);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', resource: '', action: 'READ', schema_name: 'public', permission_scope: 'COMPANY', description: '' });
        setSelectedPerm(null);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-purple-600 flex items-center justify-center text-white shadow-2xl shadow-purple-100 ring-8 ring-purple-50">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Security Tokens</h1>
                            <p className="text-slate-500 font-medium">Granular protocols for systemic resources and functional operations</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-purple-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Provision Token</span>
                    </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="relative flex-1 min-w-[350px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tokens by name, scope or resource..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Permission Identifier</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource Mapping</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Functional Scope</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-64 mb-2"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                                            <td className="p-10 text-right"><div className="h-8 w-8 bg-slate-100 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    permissions.map((perm: any) => (
                                        <tr key={perm.id} className="group hover:bg-purple-50/30 transition-all duration-300">
                                            <td className="p-10">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="font-mono text-xs font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 w-fit uppercase tracking-tight">
                                                        {perm.name}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 font-bold line-clamp-1">{perm.description || 'System-wide functional permission token.'}</span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-purple-600 transition-all border border-transparent group-hover:border-purple-100 shadow-sm">
                                                        <Database className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{perm.resource}</div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{perm.schema_name} schema</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {perm.permission_scope === 'PLATFORM' ? <Globe className="w-3.5 h-3.5 text-indigo-400" /> : <Package className="w-3.5 h-3.5 text-blue-400" />}
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${perm.permission_scope === 'PLATFORM' ? 'text-indigo-600' : 'text-blue-600'}`}>{perm.permission_scope}</span>
                                                    </div>
                                                    <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest w-fit flex items-center gap-1.5">
                                                        <Activity className="w-2.5 h-2.5" /> {perm.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center justify-end gap-3 text-right">
                                                    <button onClick={() => openEdit(perm)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openDelete(perm)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-rose-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-12 py-10 bg-purple-600 flex items-center justify-between text-white">
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                    <Lock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight tracking-wider uppercase text-white">{isEditModalOpen ? 'Recalibrate Protocol' : 'Provision Token'}</h2>
                                    <p className="text-purple-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configuring granular access control tokens</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-3 hover:bg-white/10 rounded-full transition-all text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-12 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-900 font-bold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Token Identity (Name)</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-purple-100 font-mono" placeholder="e.g. USER_WRITE" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">System Resource</label>
                                    <input type="text" required value={formData.resource} onChange={e => setFormData({ ...formData, resource: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-purple-100" placeholder="e.g. users" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Functional Action</label>
                                    <select value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black">
                                        <option value="READ">READ</option>
                                        <option value="WRITE">WRITE</option>
                                        <option value="DELETE">DELETE</option>
                                        <option value="MANAGE">MANAGE</option>
                                        <option value="APPROVE">APPROVE</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Schema Mapping</label>
                                    <select value={formData.schema_name} onChange={e => setFormData({ ...formData, schema_name: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black">
                                        <option value="public">PUBLIC</option>
                                        <option value="auth">AUTH</option>
                                        <option value="core">CORE</option>
                                        
                                        <option value="ems">EMS</option>
                                        
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Identity Scope</label>
                                    <select value={formData.permission_scope} onChange={e => setFormData({ ...formData, permission_scope: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black">
                                        <option value="COMPANY">COMPANY</option>
                                        <option value="PLATFORM">PLATFORM</option>
                                        <option value="PRODUCT">PRODUCT</option>
                                        <option value="BRANCH">BRANCH</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Protocol Definition</label>
                                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-3xl bg-slate-50 border-none p-6 text-sm font-medium focus:ring-4 focus:ring-purple-100 outline-none resize-none" placeholder="Describe the functional scope of this security token..." />
                                </div>
                            </div>
                            <div className="pt-8 border-t border-slate-50 flex gap-4 text-slate-900">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black">Dismiss</button>
                                <button type="submit" disabled={creating || updating} className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-purple-600 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {creating || updating ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Commit Token</>}
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
                            <h2 className="text-2xl font-black text-slate-900 uppercase">Revoke Token?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-2 px-6 italic">Inactivating <span className="text-slate-900 font-black">"{selectedPerm?.name}"</span>. This will immediately terminate all resource access associated with this functional protocol across the entire grid.</p>

                            <div className="mt-8 text-left space-y-2">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Reason for revocation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none" placeholder="Security rationale for token revocation..." />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2rem] bg-slate-100 text-slate-600 font-black">Abort</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Revoke Token</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
