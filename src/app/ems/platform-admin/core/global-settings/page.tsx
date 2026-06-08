"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { platformService } from '@/services/platformService';
import {
    Settings, Plus, Loader2, Save, X,
    ShieldCheck, Database, Layout, Key, Info, Zap
} from 'lucide-react';

export default function GlobalSettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newSetting, setNewSetting] = useState({
        group: 'GENERAL',
        key: '',
        value: '',
        description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await platformService.getGlobalSettings();
            setSettings(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            await platformService.createGlobalSetting(newSetting);
            setIsCreateModalOpen(false);
            setNewSetting({ group: 'GENERAL', key: '', value: '', description: '' });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create setting. Need Platform Admin role.');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (id: number, value: string) => {
        // Implementation for update would go here
        alert('Update functionality coming soon for ' + id);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                            <Settings className="w-8 h-8 animate-spin-slow" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Core</h1>
                            <p className="text-slate-500 font-medium">Platform-wide environment parameters & behavioral flags</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Param</span>
                    </button>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : settings.length === 0 ? (
                        <div className="col-span-full py-40 text-center bg-white border border-dashed border-slate-100 rounded-[3rem]">
                            <Database className="w-16 h-16 mx-auto text-slate-100 mb-4" />
                            <p className="font-black text-slate-300 text-xl">The system core is running on defaults.</p>
                        </div>
                    ) : (
                        settings.map((setting: any) => (
                            <div key={setting.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{setting.group}</span>
                                            <h3 className="text-base font-black text-slate-900">{setting.key}</h3>
                                        </div>
                                    </div>
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed line-clamp-2">
                                    {setting.description || 'Global configuration parameter that influences system-wide logic and runtime stability.'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-mono font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            defaultValue={setting.value}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUpdate(setting.id, setting.value)}
                                        className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Creation Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-12 py-10 bg-slate-900 flex items-center justify-between text-white">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Key className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Core Inbound</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Injecting system variable</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-12 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Parameter Group</label>
                                    <select
                                        required value={newSetting.group}
                                        onChange={e => setNewSetting({ ...newSetting, group: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                                    >
                                        <option value="GENERAL">GENERAL SYSTEM</option>
                                        <option value="NETWORK">NETWORK & PROXY</option>
                                        <option value="SECURITY">IDENTITY & SECURITY</option>
                                        <option value="UI">AESTHETICS & BRANDING</option>
                                        <option value="EMAIL">COMMUNICATIONS</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Configuration Key</label>
                                    <input
                                        type="text" required
                                        value={newSetting.key}
                                        onChange={e => setNewSetting({ ...newSetting, key: e.target.value.toUpperCase() })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-mono font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                                        placeholder="SYSTEM_TIMEOUT"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Variable Value</label>
                                    <input
                                        type="text" required
                                        value={newSetting.value}
                                        onChange={e => setNewSetting({ ...newSetting, value: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                                        placeholder="Enter value..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Specification / Rationale</label>
                                    <textarea
                                        rows={3}
                                        value={newSetting.description}
                                        onChange={e => setNewSetting({ ...newSetting, description: e.target.value })}
                                        className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
                                        placeholder="Define the purpose of this parameter..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 h-16 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] h-16 rounded-[2rem] bg-indigo-600 text-white font-black hover:bg-slate-900 disabled:opacity-50 shadow-2xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Payload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
