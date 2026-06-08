"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Users, Plus, Loader2, Building, ShieldCheck,
    Link2, Calendar, UserCheck, X, Search,
    Briefcase, Fingerprint, Lock, CheckCircle2,
    Edit3, Trash2, ShieldAlert, Zap
} from "lucide-react";

export default function UserRolesPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        user_id: '',
        role_id: '',
        company_id: '',
        valid_from: '',
        valid_until: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [data, u, r, c] = await Promise.all([
                platformService.getUserRoles(),
                platformService.getUsers(),
                platformService.getRoles(),
                platformService.getCompanies()
            ]);
            setAssignments((data || []).filter((a: any) => a.is_active !== false));
            setUsers(u || []);
            setRoles(r || []);
            setCompanies(c || []);
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
        setFormData({
            user_id: '',
            role_id: '',
            company_id: '',
            valid_from: '',
            valid_until: ''
        });
        setSelectedAssignment(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const dataToSubmit = {
                ...formData,
                company_id: formData.company_id === 'NULL' ? null : formData.company_id
            };
            await platformService.createUserRole(dataToSubmit);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to assign role');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment) return;
        try {
            setSaving(true);
            const dataToSubmit = {
                ...formData,
                company_id: formData.company_id === 'NULL' ? null : formData.company_id
            };
            await platformService.updateUserRole(selectedAssignment.id, dataToSubmit);
            setIsEditModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert('Failed to recalibrate binding');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedAssignment || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteUserRole(selectedAssignment.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error: any) {
            alert('Failed to revoke security binding');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (assignment: any) => {
        setSelectedAssignment(assignment);
        setFormData({
            user_id: assignment.user_id,
            role_id: assignment.role_id,
            company_id: assignment.company_id || 'NULL',
            valid_from: assignment.valid_from ? new Date(assignment.valid_from).toISOString().split('T')[0] : '',
            valid_until: assignment.valid_until ? new Date(assignment.valid_until).toISOString().split('T')[0] : ''
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (assignment: any) => {
        setSelectedAssignment(assignment);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-bold">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                            <Fingerprint className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Security Bindings</h1>
                            <p className="text-slate-500 font-medium font-bold">Mapping systemic profiles to roles and tenant namespaces</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Establish Binding</span>
                    </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="relative flex-1 min-w-[350px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search bindings by identity, role or tenant..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold border-separate border-spacing-0">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Profile</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role Protocol</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tenant Scope</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-900">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48 mb-2"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10 text-right"><div className="h-8 w-8 bg-slate-100 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-40 text-center text-slate-300 font-black text-xl uppercase tracking-widest bg-slate-50/20">
                                            No security bindings detected.
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                                            <td className="p-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900">{item.user?.email}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: {item.user_id?.split('-')[0]}..</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm text-indigo-600">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    <span className="text-[11px] font-black uppercase tracking-tight">{item.role?.display_name || item.role?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${item.company_id ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                                        <Building className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{item.company?.name || 'Platform (Global)'}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Namespace Access</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-500 font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-3 h-3 text-amber-500" /> {item.is_active ? 'ACTIVE' : 'REVOKED'}
                                                    </div>
                                                    <div className="flex items-center gap-2 font-mono">
                                                        <Calendar className="w-3 h-3 text-slate-300" />
                                                        <span>{item.valid_from ? new Date(item.valid_from).toLocaleDateString() : '∞'} → {item.valid_until ? new Date(item.valid_until).toLocaleDateString() : '∞'}</span>
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

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="px-12 py-10 bg-slate-900 flex items-center justify-between text-white">
                            <div className="flex items-center gap-5 font-bold">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Briefcase className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight tracking-wider uppercase">{isEditModalOpen ? 'Recalibrate Binding' : 'Binding Protocol'}</h2>
                                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Establishing systemic identity mapping</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-12 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-900 font-bold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">System Identity (User)</label>
                                    <select
                                        required value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none"
                                    >
                                        <option value="">Select Identity</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.email} ({u.first_name})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Protocol Type (Role)</label>
                                    <select
                                        required value={formData.role_id}
                                        onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none font-mono"
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.display_name || r.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Namespace Scope (Tenant)</label>
                                    <select
                                        required value={formData.company_id}
                                        onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none"
                                    >
                                        <option value="">Select Namespace</option>
                                        <option value="NULL">Platform (Global Access)</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest font-bold">Valid From</label>
                                    <input type="date" value={formData.valid_from} onChange={e => setFormData({ ...formData, valid_from: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest font-bold">Valid Until</label>
                                    <input type="date" value={formData.valid_until} onChange={e => setFormData({ ...formData, valid_until: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black">Dismiss</button>
                                <button type="submit" disabled={saving} className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-indigo-600 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Binding</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation (Delete) Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900 font-bold">
                    <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-12 text-center text-slate-900 font-bold">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl ring-8 ring-rose-50 font-bold">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Revoke Binding?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-3 px-6 italic">Terminating access for <span className="text-slate-900 font-black">{selectedAssignment?.user?.email}</span> under the <span className="text-slate-900 font-black">{selectedAssignment?.role?.display_name || selectedAssignment?.role?.name}</span> protocol. This action is immutable in audit journals.</p>

                            <div className="mt-8 text-left space-y-2 font-bold">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Reason for revocation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none px-6 py-4" placeholder="Security rationale for access revocation..." />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2rem] bg-slate-100 text-slate-600 font-black">Abort</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Revoke Binding</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
