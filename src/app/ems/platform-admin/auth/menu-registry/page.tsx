"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Menu as MenuIcon, Plus, Loader2, X, Search,
    Navigation, LayoutGrid, Layers, ExternalLink,
    Settings, Globe, Smartphone, Monitor, Zap,
    ShieldCheck, Cpu, ChevronRight, Edit3, Trash2,
    ShieldAlert, Info
} from "lucide-react";

export default function MenuRegistryPage() {
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        menu_name: '',
        menu_key: '',
        display_name: '',
        route: '',
        parent_id: '',
        icon: 'LayoutGrid',
        sort_order: 0,
        is_visible: true,
        product: '',
        schema_name: 'core'
    });

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await platformService.getMenuRegistry();
            setMenus((data || []).filter((m: any) => m.is_active !== false));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const resetForm = () => {
        setFormData({
            menu_name: '', menu_key: '', display_name: '', route: '',
            parent_id: '', icon: 'LayoutGrid', sort_order: 0,
            is_visible: true, product: '', schema_name: 'core'
        });
        setSelectedMenu(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await platformService.createMenuEntry(formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchMenus();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to register menu entry');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMenu) return;
        try {
            setSaving(true);
            await platformService.updateMenuEntry(selectedMenu.id, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchMenus();
        } catch (error: any) {
            alert('Failed to recalibrate architecture');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMenu || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteMenuEntry(selectedMenu.id, deleteReason);
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            fetchMenus();
        } catch (error: any) {
            alert('Failed to archive registry entry');
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (menu: any) => {
        setSelectedMenu(menu);
        setFormData({
            ...menu,
            parent_id: menu.parent_id?.toString() || ''
        });
        setIsEditModalOpen(true);
    };

    const openDelete = (menu: any) => {
        setSelectedMenu(menu);
        setIsDeleteModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                            <Navigation className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Navigation Schema</h1>
                            <p className="text-slate-500 font-medium">Registry for systemic sidebar architecture and frontend routing</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Registry Entry</span>
                    </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden text-slate-900 font-bold">
                    <div className="p-8 border-b border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="relative flex-1 min-w-[350px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search registry by name, route or key..."
                                className="w-full h-14 bg-slate-50 border-none rounded-[1.5rem] pl-14 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nav Identity</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Frontend Route</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mapping</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-64 mb-2"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="p-10"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="p-10"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                                            <td className="p-10 text-right"><div className="h-8 w-8 bg-slate-100 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    menus.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                                            <td className="p-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                        <LayoutGrid className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1.5">{item.display_name}</div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">{item.menu_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 group/link cursor-pointer">
                                                        <span className="text-sm font-bold text-indigo-600 border-b border-indigo-100 group-hover/link:border-indigo-600 transition-all font-mono italic">
                                                            {item.route}
                                                        </span>
                                                        <ExternalLink className="w-3 h-3 text-indigo-300 group-hover/link:text-indigo-600" />
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">KEY: {item.menu_key}</span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg w-fit text-slate-600">
                                                        <Layers className="w-3.5 h-3.5 text-slate-400" /> {item.product || 'GLOBAL'}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{item.schema_name || 'public'}.schema</span>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${item.is_visible ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                        <Monitor className="w-3 h-3" /> {item.is_visible ? 'VISIBLE' : 'HIDDEN'}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${item.is_active ? 'text-amber-600' : 'text-slate-300'}`}>
                                                        <Zap className="w-3 h-3" /> {item.is_active ? 'ACTIVE' : 'INERT'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center justify-end gap-3 text-right">
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

            {/* Registry Entry Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-12 py-10 bg-indigo-600 flex items-center justify-between text-white">
                            <div className="flex items-center gap-5 relative z-10 font-bold">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Cpu className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight tracking-wider uppercase">{isEditModalOpen ? 'Recalibrate Entry' : 'Registry Entry'}</h2>
                                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Establishing navigation architecture</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-3 hover:bg-white/10 rounded-full transition-all text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-12 space-y-6 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-900 font-bold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Logical Menu Name</label>
                                    <input type="text" required value={formData.menu_name} onChange={e => setFormData({ ...formData, menu_name: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase text-slate-900">Frontend Menu Key</label>
                                    <input type="text" required value={formData.menu_key} onChange={e => setFormData({ ...formData, menu_key: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-mono font-bold focus:ring-4 focus:ring-indigo-100" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Display Identity (Label)</label>
                                    <input type="text" required value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black focus:ring-4 focus:ring-indigo-100" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Routing Path (URL)</label>
                                    <input type="text" required value={formData.route} onChange={e => setFormData({ ...formData, route: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-mono font-bold focus:ring-4 focus:ring-indigo-100 text-indigo-600" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Parent Mapping</label>
                                    <select value={formData.parent_id} onChange={e => setFormData({ ...formData, parent_id: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-black">
                                        <option value="">Top Level Menu</option>
                                        {menus.filter(m => !m.parent_id && m.id !== selectedMenu?.id).map(m => (
                                            <option key={m.id} value={m.id}>{m.display_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Display Order</label>
                                    <input type="number" required value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-100" />
                                </div>
                            </div>
                            <div className="pt-8 border-t border-slate-50 flex gap-4 text-slate-900">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black">Dismiss</button>
                                <button type="submit" disabled={saving} className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-indigo-600 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Commit Entry</>}
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
                            <h2 className="text-2xl font-black text-slate-900 uppercase">Archive Entry?</h2>
                            <p className="text-slate-500 text-sm font-medium mt-2 px-6 italic">Inactivating <span className="text-slate-900 font-black">"{selectedMenu?.display_name}"</span>. This will immediately remove this entry from the navigation sidebar and revoke linked interface access across the grid.</p>

                            <div className="mt-8 text-left space-y-2 font-bold">
                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Reason for entry archival</label>
                                <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-32 rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none" placeholder="Rationale for registry removal..." />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-16 rounded-[2rem] bg-slate-100 text-slate-600 font-black">Abort</button>
                                <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-2xl transition-all flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Archive Entry</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
