'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/services/platformService';
import { toast } from 'sonner';
import {
    RotateCcw,
    Trash2,
    User,
    Briefcase,
    Building2,
    Search,
    Loader2,
    Calendar,
    UserX,
    Archive
} from 'lucide-react';
import { format } from 'date-fns';

export default function ArchivesTab() {
    const [activeTab, setActiveTab] = useState<'users' | 'employees' | 'companies'>('users');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ users: [], employees: [], companies: [] });
    const [restoring, setRestoring] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadArchives();
    }, []);

    const loadArchives = async () => {
        try {
            setLoading(true);
            const result = await platformService.getArchives();
            setData(result);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load archives');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: string, type: 'users' | 'employees' | 'companies') => {
        try {
            setRestoring(id);
            await platformService.restoreItem(type, id);
            toast.success('Item restored successfully');
            await loadArchives(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || 'Failed to restore item');
        } finally {
            setRestoring(null);
        }
    };

    const getFilteredData = (type: 'users' | 'employees' | 'companies') => {
        const list = data[type] || [];
        if (!searchTerm) return list;
        const lower = searchTerm.toLowerCase();
        return list.filter((item: any) =>
            (item.display_name?.toLowerCase().includes(lower)) ||
            (item.first_name?.toLowerCase().includes(lower)) ||
            (item.email?.toLowerCase().includes(lower)) ||
            (item.name?.toLowerCase().includes(lower)) ||
            (item.delete_reason?.toLowerCase().includes(lower))
        );
    };

    const tabs = [
        { id: 'users', label: 'Users', icon: User },
        { id: 'employees', label: 'Employees', icon: Briefcase },
        { id: 'companies', label: 'Companies', icon: Building2 },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Archive className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Recovery Archives</h3>
                            <p className="text-sm text-slate-500 font-medium">Restore soft-deleted records and manage data recovery</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search archives..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const count = getFilteredData(tab.id).length;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5 md:w-4 h-4" />
                            {tab.label}
                            <span className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {loading ? '...' : (data[tab.id]?.length || 0)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF] mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Loading archives...</p>
                    </div>
                ) : getFilteredData(activeTab).length === 0 ? (
                    <div className="p-12 text-center">
                        <Trash2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No archives found</h3>
                        <p className="text-sm text-slate-500">
                            No deleted {activeTab} match your search.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Record</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Deleted Info</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {getFilteredData(activeTab).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                    {activeTab === 'users' ? <User className="w-5 h-5" /> :
                                                        activeTab === 'employees' ? <Briefcase className="w-5 h-5" /> :
                                                            <Building2 className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {item.display_name || item.name || (item.first_name + ' ' + item.last_name)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        {item.email || item.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-600 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.deleted_at ? format(new Date(item.deleted_at), 'PPP p') : 'Unknown'}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                                    <UserX className="w-3.5 h-3.5" />
                                                    Deleted by: {item.deleted_by || 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs truncate text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 italic">
                                                {item.delete_reason || 'No reason provided'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRestore(item.id, activeTab)}
                                                disabled={restoring === item.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                            >
                                                {restoring === item.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                )}
                                                Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
