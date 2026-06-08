"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { platformService } from '@/services/platformService';
import {
    Award, Plus, Loader2, X,
    Briefcase, Hash, Shield, Search, Filter,
    Edit3, Trash2, ShieldAlert, CheckCircle2, MoreVertical,
    Trophy, ChevronRight
} from 'lucide-react';

export default function DesignationsPage() {
    const [designations, setDesignations] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedDesig, setSelectedDesig] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        code: '',
        level: 1,
        company_id: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [desigData, companiesData] = await Promise.all([
                platformService.getDesignations(),
                platformService.getCompanies()
            ]);
            setDesignations((desigData || []).filter((d: any) => d.is_active !== false));
            setCompanies(companiesData || []);
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
        setFormData({ title: '', code: '', level: 1, company_id: '' });
        setSelectedDesig(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createDesignation(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to establish professional title');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDesig) return;
        try {
            setSaving(true);
            await platformService.updateDesignation(selectedDesig.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to recalibrate title protocols');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDesig || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteDesignation(selectedDesig.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error) {
            alert('Failed to archive professional node');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (desig: any) => {
        setSelectedDesig(desig);
        setFormData({
            title: desig.title,
            code: desig.code,
            level: desig.level,
            company_id: desig.company_id
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (desig: any) => {
        setSelectedDesig(desig);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700 font-bold text-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2.5rem] bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-100 ring-8 ring-emerald-50 font-bold">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Professional Titles</h1>
                            <p className="text-slate-500 font-medium">Standardizing corporate hierarchy and functional role protocols</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Authorize Title</span>
                    </button>
                </div>

                {/* Search / Filter Section */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-wrap gap-6 shadow-sm items-center font-bold">
                    <div className="relative flex-1 min-w-[350px] font-bold">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                        <input
                            type="text"
                            placeholder="Find role by title, code or hierarchy level..."
                            className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-3 font-bold">
                        <button className="h-14 px-8 bg-slate-50 rounded-2xl text-slate-600 font-black flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm uppercase tracking-widest text-[10px]">
                            <Filter className="w-4 h-4" /> Advanced Filter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-bold">
                    {loading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : designations.length === 0 ? (
                        <div className="col-span-full py-40 text-center bg-white border-2 border-dashed border-slate-100 rounded-[4rem]">
                            <Award className="w-20 h-20 mx-auto text-slate-100 mb-6" />
                            <p className="font-black text-slate-300 text-2xl uppercase tracking-widest leading-none">Access void detected.</p>
                            <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-xs">No professional titles authorized in this namespace.</p>
                        </div>
                    ) : (
                        designations.map((desig: any) => (
                            <div key={desig.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-emerald-50/50 transition-all duration-500 border-t-8 border-t-emerald-600 relative overflow-hidden font-bold">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6 relative z-10 font-bold">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner font-bold">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(desig)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => openDelete(desig)} className="p-2 bg-slate-50 text-rose-300 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 leading-snug mb-1 uppercase tracking-tight relative z-10 font-bold">{desig.title}</h3>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 font-mono relative z-10 font-bold">{desig.code}</div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between relative z-10 font-bold">
                                    <div className="flex items-center gap-2 font-bold">
                                        <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{desig.companies?.name || 'Group Portfolio'}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">L{desig.level} RANK</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Creation / Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[4rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-12 py-10 bg-emerald-600 flex items-center justify-between text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-14 h-14 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 font-bold">
                                    <Shield className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase font-bold">{isEditModalOpen ? 'Update Title' : 'Title Auth'}</h2>
                                    <p className="text-emerald-100 text-[11px] font-black uppercase tracking-[0.2em] font-bold">Corporate Designation Management</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-emerald-100 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-12 space-y-8 bg-white text-slate-900 font-bold">
                            <div className="space-y-6">
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Institutional Mapping</label>
                                    <select
                                        required value={formData.company_id}
                                        onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-emerald-100 outline-none appearance-none font-bold"
                                        disabled={isEditModalOpen}
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">Professional Title</label>
                                    <input
                                        type="text" required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-emerald-100 outline-none font-bold"
                                        placeholder="e.g. Chief Innovation Officer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6 font-bold">
                                    <div className="space-y-3 font-bold">
                                        <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">System Code</label>
                                        <input
                                            type="text" required
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-mono font-black focus:ring-4 focus:ring-emerald-100 outline-none font-bold"
                                            placeholder="CIO-EXEC"
                                        />
                                    </div>
                                    <div className="space-y-3 font-bold">
                                        <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold">Rank Level</label>
                                        <input
                                            type="number" required min="1" max="10"
                                            value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                            className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-emerald-100 outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 font-bold">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-emerald-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <><CheckCircle2 className="w-5 h-5" /> Authorize Node</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Archival Confirmation (Delete) Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-900 font-bold font-bold">
                    <div className="bg-white rounded-[4rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 font-bold">
                        <div className="p-14 text-center text-slate-900 font-bold font-bold">
                            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl ring-8 ring-rose-50 font-bold">
                                <ShieldAlert className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-bold">Archive Title?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-4 px-6 italic font-bold leading-relaxed">Suspending the <span className="text-slate-900 font-black uppercase">"{selectedDesig?.title}"</span> professional designation. All personnel mapped to this title will require structural reassignment.</p>

                            <div className="mt-10 text-left space-y-3 font-bold">
                                <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest font-bold">Rational for professional inactivation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-[1.5rem] bg-slate-50 border-none p-8 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none font-bold" placeholder="Security rationale for title archival..." />
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
