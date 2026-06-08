"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { platformService } from '@/services/platformService';
import {
    Building2, Plus, Loader2, X,
    Layers, Hash, FileText, GitBranch, Search, Filter,
    Edit3, Trash2, ShieldAlert, CheckCircle2, MoreVertical
} from 'lucide-react';

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        company_id: '',
        branch_id: '',
        parent_department_id: null
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptsData, companiesData, branchesData] = await Promise.all([
                platformService.getDepartments(),
                platformService.getCompanies(),
                platformService.getBranches()
            ]);
            setDepartments((deptsData || []).filter((d: any) => d.is_active !== false));
            setCompanies(companiesData || []);
            setBranches(branchesData || []);
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
        setFormData({ name: '', code: '', description: '', company_id: '', branch_id: '', parent_department_id: null });
        setSelectedDept(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createDepartment(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to establish department structure');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDept) return;
        try {
            setSaving(true);
            await platformService.updateDepartment(selectedDept.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to recalibrate department');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDept || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteDepartment(selectedDept.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error) {
            alert('Failed to archive business unit');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (dept: any) => {
        setSelectedDept(dept);
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            company_id: dept.company_id,
            branch_id: dept.branch_id || '',
            parent_department_id: dept.parent_department_id
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (dept: any) => {
        setSelectedDept(dept);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700 font-bold">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Operational Units</h1>
                            <p className="text-slate-500 font-medium">Bridges organizational strategy to functional business departments</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Unit</span>
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 flex flex-wrap gap-6 shadow-sm items-center font-bold">
                    <div className="relative flex-1 min-w-[350px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                        <input
                            type="text"
                            placeholder="Find department by name, code or primary group..."
                            className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-14 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>
                    <button className="px-8 h-14 bg-white border border-slate-100 rounded-2xl text-slate-600 font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Filter className="w-4 h-4" /> Advanced Filter
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-white border border-slate-100 rounded-[3rem] animate-pulse" />
                        ))
                    ) : departments.length === 0 ? (
                        <div className="col-span-full py-40 text-center bg-white border-2 border-dashed border-slate-100 rounded-[4rem]">
                            <Layers className="w-20 h-20 mx-auto text-slate-100 mb-6" />
                            <p className="font-black text-slate-300 text-2xl uppercase tracking-widest leading-none">Structural void detected.</p>
                            <p className="text-slate-400 mt-4 font-bold">No organizational units registered in this namespace.</p>
                        </div>
                    ) : (
                        departments.map((dept: any) => (
                            <div key={dept.id} className="group bg-white border border-slate-100 rounded-[3rem] p-10 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 border-l-8 border-l-indigo-600 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-8 relative z-10 font-bold">
                                    <div className="flex flex-col gap-1.5 font-bold">
                                        <div className="text-[10px] font-black text-indigo-600 tracking-[0.25em] uppercase font-mono">{dept.code}</div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{dept.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(dept)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => openDelete(dept)} className="p-2.5 bg-slate-50 text-rose-300 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm font-bold line-clamp-2 mb-10 leading-relaxed italic relative z-10 font-bold">
                                    {dept.description || 'Institutional business unit operating under global governance protocols.'}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-50 relative z-10 font-bold">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col font-bold">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{dept.companies?.name || 'Group Entity'}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{dept.branches?.name || 'GLOBAL CORE'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Creation / Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-14 py-12 bg-indigo-600 flex items-center justify-between text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-16 h-16 rounded-[2.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 font-bold">
                                    <Layers className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2 font-bold">{isEditModalOpen ? 'Recalibrate Unit' : 'Unit Protocol'}</h2>
                                    <p className="text-indigo-100 text-[11px] font-black uppercase tracking-[0.3em] font-bold">Configuring institutional business structure</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-indigo-100 hover:text-white">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-14 space-y-10 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-900 font-bold font-bold font-bold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold font-bold">
                                <div className="space-y-3 md:col-span-2 font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Institutional Tenant Mapping</label>
                                    <select
                                        required value={formData.company_id}
                                        onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none font-bold"
                                        disabled={isEditModalOpen}
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">Branch Namespace</label>
                                    <select
                                        value={formData.branch_id}
                                        onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none font-bold"
                                    >
                                        <option value="">Universal Mapping</option>
                                        {branches.filter(b => b.company_id == formData.company_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">Structural Code</label>
                                    <input
                                        type="text" required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-mono font-black focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                                        placeholder="e.g. FIN-GL"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">Unit Identifier (Name)</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                                        placeholder="e.g. Finance & Treasury Operations"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">Mission Scope (Description)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-[2rem] bg-slate-50 border-none px-8 py-6 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none resize-none font-bold"
                                        placeholder="Describe the department's functional mandate..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50 font-bold">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 h-16 rounded-[2.5rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss Protocol
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] h-16 rounded-[2.5rem] bg-slate-900 text-white font-black hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Structure</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Archival Confirmation (Delete) Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900 font-bold font-bold font-bold">
                    <div className="bg-white rounded-[4rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 font-bold">
                        <div className="p-14 text-center text-slate-900 font-bold font-bold font-bold">
                            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl ring-8 ring-rose-50 font-bold">
                                <ShieldAlert className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-bold">Archive Unit?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-4 px-6 italic font-bold leading-relaxed">Suspending the <span className="text-slate-900 font-black uppercase">"{selectedDept?.name}"</span> business unit. All child hierarchies and operational mapping will be archived in the forensic audit trail.</p>

                            <div className="mt-10 text-left space-y-3 font-bold">
                                <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest font-bold">Rational for structural inactivation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-[1.5rem] bg-slate-50 border-none p-8 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none font-bold" placeholder="Security rationale for unit archival..." />
                            </div>

                            <div className="flex gap-4 mt-10 font-bold">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2.5rem] bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]">Abort</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2.5rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Archive Node</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
