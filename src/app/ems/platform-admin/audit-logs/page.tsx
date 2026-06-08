"use client";

import React, { useState, useEffect } from "react";
import {
    History,
    Search,
    Download,
    Calendar,
    ShieldCheck,
    Building2,
    User,
    Lock,
    RefreshCcw,
    Loader2,
    Activity,
    Terminal,
    Smartphone,
    Globe,
    Monitor,
    Tablet,
    X,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Zap,
    Filter
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface LogEntry {
    id: string;
    created_at: string;
    user_email: string;
    action: string;
    resource_type: string;
    table_name: string;
    schema_name: string;
    ip_address: string;
    user_agent?: string;
    resource_id?: number | string;
    company_id?: string;
    status?: string;
}

import { useSearchParams } from "next/navigation";

export default function PlatformAuditLogs() {
    const searchParams = useSearchParams();
    const initialCompanyId = searchParams.get('companyId');

    const [searchTerm, setSearchTerm] = useState("");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    // Enhanced Filters
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [filterAction, setFilterAction] = useState("");
    const [filterDevice, setFilterDevice] = useState("");
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState(initialCompanyId || "");

    useEffect(() => {
        setMounted(true);
        loadData();

        let timeoutId: NodeJS.Timeout;
        const heartbeat = async () => {
            await syncLogsSilent();
            timeoutId = setTimeout(heartbeat, 5000);
        };

        timeoutId = setTimeout(heartbeat, 5000);
        return () => clearTimeout(timeoutId);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logsData, companiesData] = await Promise.all([
                platformService.getAuditLogs(selectedCompany || undefined).catch(e => {
                    console.error("Audit Logs API failed:", e);
                    throw e;
                }),
                platformService.getCompanies().catch(e => {
                    console.error("Companies API failed:", e);
                    throw e;
                })
            ]);
            setLogs(logsData || []);
            setCompanies(companiesData || []);
            setLastSync(new Date());
        } catch (error: any) {
            console.error("[AuditLogs] Feed Error:", error);
            const msg = error.response?.data?.error?.message || "Failed to load audit logs";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const syncLogsSilent = async () => {
        try {
            const response = await platformService.getAuditLogs(selectedCompany || undefined);
            if (response && response.length > 0) {
                setLogs(currentLogs => {
                    const currentLatestId = currentLogs.length > 0 ? String(currentLogs[0].id) : null;
                    const newLatestId = String(response[0].id);
                    if (newLatestId !== currentLatestId) {
                        if (currentLogs.length > 0) {
                            const newEvent = response[0];
                            const action = newEvent.action?.toUpperCase();
                            const actor = newEvent.user_email || 'System';
                            toast.info(`New event: ${action}`, {
                                description: `${actor} - ${new Date(newEvent.created_at).toLocaleTimeString()}`
                            });
                        }
                        return response;
                    }
                    return currentLogs;
                });
            }
            setLastSync(new Date());
        } catch (e) {
            // Silent
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setFilterPeriod("all");
        setFilterAction("");
        setFilterDevice("");
        setSelectedCompany("");
    };

    // Parse user agent to determine device type
    const getDeviceInfo = (userAgent: string) => {
        if (!userAgent) return { type: 'unknown', icon: Globe, label: 'Unknown' };

        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return { type: 'mobile', icon: Smartphone, label: 'Mobile' };
        }
        if (ua.includes('tablet') || ua.includes('ipad')) {
            return { type: 'tablet', icon: Tablet, label: 'Tablet' };
        }
        return { type: 'desktop', icon: Monitor, label: 'Desktop' };
    };

    // Get browser name from user agent
    const getBrowserName = (userAgent: string) => {
        if (!userAgent) return 'Unknown';
        const ua = userAgent.toLowerCase();
        if (ua.includes('chrome')) return 'Chrome';
        if (ua.includes('firefox')) return 'Firefox';
        if (ua.includes('safari')) return 'Safari';
        if (ua.includes('edge')) return 'Edge';
        if (ua.includes('opera')) return 'Opera';
        return 'Browser';
    };

    // Filter logs
    const getFilteredLogs = () => {
        let filtered = logs;

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(log =>
                (log.user_email || "").toLowerCase().includes(term) ||
                (log.action || "").toLowerCase().includes(term) ||
                (log.ip_address || "").toLowerCase().includes(term) ||
                (log.table_name || "").toLowerCase().includes(term)
            );
        }

        // Period filter
        if (filterPeriod !== "all") {
            const now = new Date();
            filtered = filtered.filter(log => {
                const logDate = new Date(log.created_at);
                const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);

                if (filterPeriod === "1h") return diffHours <= 1;
                if (filterPeriod === "24h") return diffHours <= 24;
                if (filterPeriod === "7d") return diffHours <= 168;
                if (filterPeriod === "30d") return diffHours <= 720;
                return true;
            });
        }

        // Action filter
        if (filterAction) {
            filtered = filtered.filter(log =>
                log.action?.toUpperCase() === filterAction.toUpperCase()
            );
        }

        // Device filter
        if (filterDevice) {
            filtered = filtered.filter(log => {
                const device = getDeviceInfo(log.user_agent || '');
                return device.type === filterDevice;
            });
        }

        // Company filter
        if (selectedCompany) {
            filtered = filtered.filter(log =>
                String(log.company_id) === selectedCompany
            );
        }

        return filtered;
    };

    const filteredLogs = getFilteredLogs();

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return {
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            date: d.toLocaleDateString([], { year: 'numeric', month: 'short', day: '2-digit' })
        };
    };

    // Calculate quick stats
    const stats = {
        total: filteredLogs.length,
        logins: filteredLogs.filter(l => ['LOGIN', 'LOGOUT'].includes(l.action?.toUpperCase())).length,
        mutations: filteredLogs.filter(l => ['CREATE', 'UPDATE', 'DELETE'].includes(l.action?.toUpperCase())).length,
        security: filteredLogs.filter(l => l.action?.toUpperCase().includes('FAIL') || l.status === 'FAILED').length,
        mobile: filteredLogs.filter(l => getDeviceInfo(l.user_agent || '').type === 'mobile').length,
        desktop: filteredLogs.filter(l => getDeviceInfo(l.user_agent || '').type === 'desktop').length
    };

    const getActionColor = (action: string) => {
        const a = action?.toUpperCase();
        if (a === 'DELETE') return 'bg-rose-50 text-rose-600 border-rose-200';
        if (['CREATE', 'ONBOARD_ENTERPRISE'].includes(a)) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (a === 'LOGIN') return 'bg-blue-50 text-blue-600 border-blue-200';
        if (a === 'LOGOUT') return 'bg-slate-50 text-slate-600 border-slate-200';
        if (a === 'UPDATE') return 'bg-amber-50 text-amber-600 border-amber-200';
        if (a?.includes('FAIL')) return 'bg-rose-50 text-rose-600 border-rose-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const hasActiveFilters = searchTerm || filterPeriod !== "all" || filterAction || filterDevice || selectedCompany;

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Activity className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Security Monitor</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Audit Logs
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Last synced: {mounted && lastSync ? lastSync.toLocaleTimeString() : '--:--:--'} • Real-time security monitoring
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            className="bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 transition-all shadow-sm"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="flex-1 md:flex-none bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: "Total Events", value: stats.total, icon: History, color: "bg-blue-50", iconColor: "text-blue-600" },
                        { label: "Auth Events", value: stats.logins, icon: Lock, color: "bg-emerald-50", iconColor: "text-emerald-600" },
                        { label: "Data Changes", value: stats.mutations, icon: Terminal, color: "bg-violet-50", iconColor: "text-violet-600" },
                        { label: "Security Alerts", value: stats.security, icon: AlertTriangle, color: "bg-rose-50", iconColor: "text-rose-600" },
                        { label: "Mobile", value: stats.mobile, icon: Smartphone, color: "bg-amber-50", iconColor: "text-amber-600" },
                        { label: "Desktop", value: stats.desktop, icon: Monitor, color: "bg-slate-50", iconColor: "text-slate-600" }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters</h3>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs font-bold text-[#0066FF] hover:text-[#0052CC] transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by user, action, IP address, or resource..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Company Filter */}
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none z-10" />
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Companies</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Time Period Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none z-10" />
                            <select
                                value={filterPeriod}
                                onChange={(e) => setFilterPeriod(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Time</option>
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </div>

                        {/* Action Filter */}
                        <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none z-10" />
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Actions</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                            </select>
                        </div>

                        {/* Device Filter */}
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none z-10" />
                            <select
                                value={filterDevice}
                                onChange={(e) => setFilterDevice(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Devices</option>
                                <option value="desktop">Desktop</option>
                                <option value="mobile">Mobile</option>
                                <option value="tablet">Tablet</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active:</span>
                            {selectedCompany && (
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg border border-blue-200">
                                    <Building2 className="w-3 h-3" />
                                    {companies.find(c => String(c.id) === selectedCompany)?.name}
                                </span>
                            )}
                            {filterPeriod !== "all" && (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200">
                                    <Calendar className="w-3 h-3" />
                                    {filterPeriod === "1h" ? "Last Hour" : filterPeriod === "24h" ? "Last 24h" : filterPeriod === "7d" ? "7 Days" : "30 Days"}
                                </span>
                            )}
                            {filterAction && (
                                <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-lg border border-violet-200">
                                    <Zap className="w-3 h-3" />
                                    {filterAction}
                                </span>
                            )}
                            {filterDevice && (
                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-lg border border-amber-200">
                                    <Smartphone className="w-3 h-3" />
                                    {filterDevice}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Log List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading audit trail...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Device & IP</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resource</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLogs.map((log) => {
                                            const { time, date } = formatDate(log.created_at);
                                            const device = getDeviceInfo(log.user_agent || '');
                                            const DeviceIcon = device.icon;

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900">{time}</span>
                                                            <span className="text-xs font-medium text-slate-400">{date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${!log.user_email ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                                {log.user_email ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{log.user_email || 'System'}</p>
                                                                <p className="text-xs text-slate-400">{log.user_email ? 'User' : 'Automated'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${device.type === 'mobile' ? 'bg-amber-50 text-amber-600' : device.type === 'tablet' ? 'bg-violet-50 text-violet-600' : 'bg-slate-50 text-slate-600'}`}>
                                                                    <DeviceIcon className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700">{device.label}</span>
                                                                <span className="text-xs text-slate-400">• {getBrowserName(log.user_agent || '')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 w-fit">
                                                                <MapPin className="w-3 h-3 text-rose-500" />
                                                                {log.ip_address || '0.0.0.0'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{log.table_name}</span>
                                                            <span className="text-xs text-slate-400">{log.schema_name}{log.resource_id ? ` • #${log.resource_id}` : ''}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-slate-400">
                                                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                                    <p className="font-semibold">No audit events found</p>
                                                    <p className="text-sm mt-1">Try adjusting your filters</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3">
                            {filteredLogs.map((log) => {
                                const { time, date } = formatDate(log.created_at);
                                const device = getDeviceInfo(log.user_agent || '');
                                const DeviceIcon = device.icon;

                                return (
                                    <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">{time}</span>
                                                <span className="text-xs text-slate-400">{date}</span>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!log.user_email ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {log.user_email ? <User className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{log.user_email || 'System'}</p>
                                                <p className="text-xs text-slate-400">{log.schema_name}.{log.table_name}{log.resource_id ? ` • #${log.resource_id}` : ''}</p>
                                            </div>
                                        </div>

                                        {/* Device & IP Row */}
                                        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${device.type === 'mobile' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    <DeviceIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">{device.label}</p>
                                                    <p className="text-[10px] text-slate-400">{getBrowserName(log.user_agent || '')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                <MapPin className="w-3 h-3 text-rose-500" />
                                                {log.ip_address || '0.0.0.0'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredLogs.length === 0 && (
                                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                    <p className="text-sm font-semibold text-slate-400">No events found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredLogs.length > 0 && (
                            <div className="flex items-center justify-center">
                                <button className="text-xs font-bold uppercase text-slate-400 tracking-wider hover:text-[#0066FF] transition-colors bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
                                    Load More Events
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
