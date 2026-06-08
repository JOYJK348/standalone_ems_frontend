"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { platformService } from '@/services/platformService';
import {
    MapPin, Plus, Loader2, X,
    Building2, Globe, Navigation, Search, Filter,
    MoreVertical, ArrowUpRight, Compass, Edit3, Trash2,
    ShieldAlert, CheckCircle2, Map as MapIcon
} from 'lucide-react';

export default function LocationsPage() {
    const [locations, setLocations] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        type: 'OFFICE',
        address_line1: '',
        city_id: '',
        company_id: '',
        branch_id: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [locsData, companiesData, branchesData, citiesData] = await Promise.all([
                platformService.getLocations(),
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getCities()
            ]);
            setLocations((locsData || []).filter((l: any) => l.is_active !== false));
            setCompanies(companiesData || []);
            setBranches(branchesData || []);
            setCities(citiesData || []);
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
        setFormData({ name: '', type: 'OFFICE', address_line1: '', city_id: '', company_id: '', branch_id: '' });
        setSelectedLoc(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createLocation(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to establish physical node');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoc) return;
        try {
            setSaving(true);
            await platformService.updateLocation(selectedLoc.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to recalibrate geo node');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLoc || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteLocation(selectedLoc.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchData();
        } catch (error) {
            alert('Failed to archive physical node');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (loc: any) => {
        setSelectedLoc(loc);
        setFormData({
            name: loc.name,
            type: loc.type,
            address_line1: loc.address_line1,
            city_id: loc.city_id,
            company_id: loc.company_id,
            branch_id: loc.branch_id || ''
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (loc: any) => {
        setSelectedLoc(loc);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700 font-bold text-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 font-bold">
                        <div className="w-16 h-16 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-100 ring-8 ring-blue-50 font-bold">
                            <Navigation className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Geo Infrastructure</h1>
                            <p className="text-slate-500 font-medium">Bridges physical geography to corporate operational footprints</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Deploy Node</span>
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-bold">
                    <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm font-bold">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                <MapIcon className="w-7 h-7" />
                            </div>
                            <div className="font-bold">
                                <div className="text-3xl font-black text-slate-900 leading-none mb-1">{locations.length}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Nodes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table container */}
                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between font-bold">
                        <div className="relative flex-1 min-w-[350px] font-bold">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                            <input
                                type="text"
                                placeholder="Search by name, city or site protocol type..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <button className="h-14 px-8 bg-slate-50 rounded-2xl text-slate-600 font-black flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm uppercase tracking-widest text-[10px]">
                            <Filter className="w-4 h-4" /> Filter Workspace
                        </button>
                    </div>

                    <div className="overflow-x-auto font-bold">
                        <table className="w-full text-left font-bold border-separate border-spacing-0">
                            <thead className="bg-slate-50/50 uppercase">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Deployment Identity</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Corporate Mapping</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Geography</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Protocol</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-900">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48 mb-2"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="p-10 text-right"><div className="h-10 w-10 bg-slate-50 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    locations.map((loc: any) => (
                                        <tr key={loc.id} className="group hover:bg-blue-50/30 transition-all duration-300 font-bold">
                                            <td className="p-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all font-bold">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{loc.name}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">{loc.type} NODE</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 font-bold">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col font-bold">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{loc.companies?.name || 'Group Entity'}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{loc.branches?.name || 'Universal Access'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3 font-bold">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner font-bold">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{loc.city?.name || 'Unspecified Domain'}</span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 font-bold w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse font-bold" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Node</span>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right">
                                                <div className="flex items-center justify-end gap-3 font-bold">
                                                    <button onClick={() => openEdit(loc)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openDelete(loc)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-rose-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-14 py-12 bg-slate-900 flex items-center justify-between text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-6 relative z-10 font-bold">
                                <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 font-bold">
                                    <Navigation className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2 font-bold">{isEditModalOpen ? 'Recalibrate Node' : 'Deploy Node'}</h2>
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] font-bold">Establishing Physical Presence & Logistics Protocols</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="relative z-10 p-4 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white font-bold">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-14 space-y-10 bg-white max-h-[75vh] overflow-y-auto custom-scrollbar text-slate-900 font-bold font-bold font-bold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold font-bold font-bold">
                                <div className="md:col-span-2 space-y-3 font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold font-bold">Institutional Tenant Assignment</label>
                                    <select
                                        required value={formData.company_id}
                                        onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold font-bold"
                                        disabled={isEditModalOpen}
                                    >
                                        <option value="">Select Target Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold font-bold">Branch Sovereignty</label>
                                    <select
                                        value={formData.branch_id}
                                        onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold font-bold"
                                    >
                                        <option value="">Global Coverage</option>
                                        {branches.filter(b => b.company_id == formData.company_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3 font-bold font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold font-bold font-bold">Functional Protocol Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold font-bold"
                                    >
                                        <option value="OFFICE">Corporate Office</option>
                                        <option value="WAREHOUSE">Logistic Warehouse</option>
                                        <option value="SITE">Production Site</option>
                                        <option value="BRANCH">Retail Branch</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-3 font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold font-bold font-bold">Node Nomenclature (Name)</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none font-bold font-bold font-bold"
                                        placeholder="e.g. Continental Distribution Hub Alpha"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3 font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold font-bold font-bold">Primary Address Key</label>
                                    <input
                                        type="text" required
                                        value={formData.address_line1}
                                        onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none font-bold font-bold"
                                        placeholder="Institutional street coordinates..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3 font-bold font-bold">
                                    <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] font-bold font-bold font-bold">City Jurisdiction</label>
                                    <select
                                        required value={formData.city_id}
                                        onChange={e => setFormData({ ...formData, city_id: e.target.value })}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none px-8 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold font-bold"
                                    >
                                        <option value="">Select Target City</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.state?.name})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10 border-t border-slate-50 font-bold">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 h-16 rounded-[2.5rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss Deployment
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] h-16 rounded-[2.5rem] bg-slate-900 text-white font-black hover:bg-blue-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Node</>}
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
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-bold">Archive Node?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-4 px-6 italic font-bold leading-relaxed">Terminating physical presence at <span className="text-slate-900 font-black uppercase">"{selectedLoc?.name}"</span>. All logical mappings to this geo-node will be archived in the security ledger.</p>

                            <div className="mt-10 text-left space-y-3 font-bold font-bold">
                                <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest font-bold">Rational for geo-inactivation</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-[1.5rem] bg-slate-50 border-none p-8 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none font-bold" placeholder="Security rationale for node archival..." />
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
