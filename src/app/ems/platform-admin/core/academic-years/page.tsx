"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { platformService } from '@/services/platformService';
import {
    Calendar, Plus, Loader2, Building2, X,
    CalendarDays, Hash, Info, Edit3, Trash2,
    ShieldAlert, CheckCircle2, Search, AlertCircle,
    Activity, ArrowRight, Layers
} from 'lucide-react';

export default function AcademicYearsPage() {
    const [years, setYears] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        company_id: '',
        start_date: '',
        end_date: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [yearData, companyData] = await Promise.all([
                platformService.getAcademicYears(),
                platformService.getCompanies()
            ]);
            setYears((yearData || []).filter((y: any) => y.is_active !== false));
            setCompanies((companyData || []).filter((c: any) => c.is_active !== false));
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
        setFormData({ name: '', company_id: '', start_date: '', end_date: '' });
        setSelectedYear(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createAcademicYear(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to establish temporal cycle');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedYear) return;
        try {
            setSaving(true);
            await platformService.updateAcademicYear(selectedYear.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to recalibrate temporal cycle');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedYear || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteAcademicYear(selectedYear.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error) {
            alert('Failed to archive temporal node');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (year: any) => {
        setSelectedYear(year);
        setFormData({
            name: year.name,
            company_id: year.company_id?.toString() || '',
            start_date: year.start_date ? new Date(year.start_date).toISOString().split('T')[0] : '',
            end_date: year.end_date ? new Date(year.end_date).toISOString().split('T')[0] : '',
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (year: any) => {
        setSelectedYear(year);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700 font-bold text-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50 font-bold">
                            <CalendarDays className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Temporal Cycles</h1>
                            <p className="text-slate-500 font-medium">Standardizing academic sessions and operational year boundaries</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Establish Cycle</span>
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between font-bold">
                        <div className="relative flex-1 min-w-[350px] font-bold">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                            <input
                                type="text"
                                placeholder="Search by cycle name, year or tenant scope..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 font-bold">
                            <Activity className="w-4 h-4" />
                            Active Cycles: {years.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto font-bold">
                        <table className="w-full text-left font-bold border-separate border-spacing-0">
                            <thead className="bg-slate-50/50 uppercase">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Cycle Designation</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Tenant Scope</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Temporal Range</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Protocol Status</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-900">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48 mb-2"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="p-10 text-right"><div className="h-10 w-10 bg-slate-50 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    years.map((year: any) => (
                                        <tr key={year.id} className="group hover:bg-indigo-50/30 transition-all duration-300 font-bold">
                                            <td className="p-10 text-slate-900 font-bold">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all font-bold">
                                                        <Calendar className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5 font-bold font-bold">{year.name}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">CHRONOS NODE</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-slate-900 font-bold">
                                                <div className="flex items-center gap-3 font-bold font-bold">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 uppercase tracking-tight font-bold font-bold">{year.companies?.name || 'Group Entity'}</span>
                                                </div>
                                            </td>
                                            <td className="p-10 text-slate-900 font-bold">
                                                <div className="flex flex-col gap-1.5 font-bold font-bold">
                                                    <div className="flex items-center gap-2 text-sm font-black text-slate-900 font-mono">
                                                        {new Date(year.start_date).toLocaleDateString()}
                                                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                                                        {new Date(year.end_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic font-bold">Operational Lifecycle</div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-slate-900 font-bold">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 font-bold w-fit">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 font-bold" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-bold font-bold">Active Cycle</span>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right text-slate-900 font-bold">
                                                <div className="flex items-center justify-end gap-3 font-bold">
                                                    <button onClick={() => openEdit(year)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openDelete(year)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-rose-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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

            {/* Creation / Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all font-bold">
                    <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 font-bold">
                        <div className="px-14 py-12 bg-indigo-600 flex items-center justify-between text-white relative font-bold">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-16 h-16 rounded-[2.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 font-bold">
                                    <CalendarDays className="w-8 h-8 font-bold" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2 font-bold font-bold">{isEditModalOpen ? 'Recalibrate Cycle' : 'Temporal Auth'}</h2>
                                    <p className="text-indigo-100 text-[11px] font-black uppercase tracking-[0.3em] font-bold">Configuring Institutional Operational Boundaries</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-indigo-100 hover:text-white font-bold font-bold">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-14 space-y-10 bg-white text-slate-900 font-bold font-bold font-bold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                                <div className="md:col-span-2 space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Temporal Designation (Cycle Name)</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                                        placeholder="e.g. 2026-27 Academic Fiscal Session"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Institutional Tenant Scope</label>
                                    <select
                                        required value={formData.company_id}
                                        onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none font-bold"
                                        disabled={isEditModalOpen}
                                    >
                                        <option value="">Select Target Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Commencement Protocol (Start Date)</label>
                                    <input
                                        type="date" required
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                                    />
                                </div>
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold">Termination Protocol (End Date)</label>
                                    <input
                                        type="date" required
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none font-bold font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50 font-bold font-bold">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 h-16 rounded-[2.5rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest text-[10px] font-bold"
                                >
                                    Dismiss Auth
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] h-16 rounded-[2.5rem] bg-slate-900 text-white font-black hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-bold font-bold"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Cycle</>}
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
                        <div className="p-14 text-center text-slate-900 font-bold font-bold">
                            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl ring-8 ring-rose-50 font-bold">
                                <ShieldAlert className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-bold font-bold">Archive Cycle?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-4 px-6 italic font-bold leading-relaxed font-bold">Deactivating temporal boundary <span className="text-slate-900 font-black uppercase">"{selectedYear?.name}"</span>. This will prevent any logical associations or operational registries linked to this period.</p>

                            <div className="mt-10 text-left space-y-3 font-bold font-bold font-bold">
                                <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest font-bold font-bold">Rational for cycle inactivation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-[1.5rem] bg-slate-50 border-none p-8 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none font-bold" placeholder="Security rationale for temporal archival..." />
                            </div>

                            <div className="flex gap-4 mt-10 font-bold font-bold">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2.5rem] bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px] font-bold">Hold Off</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2.5rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] font-bold">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin font-bold" /> : <><Trash2 className="w-5 h-5" /> Archive Node</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
