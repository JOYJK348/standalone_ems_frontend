"use client";

import React, { useEffect, useState } from "react";
import {
    Bell,
    ShieldAlert,
    Clock,
    ChevronRight,
    Send,
    Info,
    Zap,
    Building,
    MapPin,
    Users,
    Search,
    Filter,
    CheckCheck,
    Volume2,
    VolumeX,
    RefreshCcw,
    Megaphone,
    AlertTriangle,
    CheckCircle2,
    X,
    Loader2,
    Activity,
    User
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";
import NotificationComposer from "@/components/notifications/NotificationComposer";

export default function NotificationsView() {
    const { user } = useAuthStore();
    const { soundEnabled, toggleSound, playNotificationSound } = useNotificationStore();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showComposer, setShowComposer] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState(""); // Module
    const [filterType, setFilterType] = useState(""); // Action
    const [filterScope, setFilterScope] = useState(""); // target_type

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await platformService.getNotifications();
            const list = data || [];
            setNotifications(list);

            // Sync with global store for count accuracy
            useNotificationStore.getState().fetchNotifications();
        } catch (error: any) {
            console.error('[NotificationsView] Failed to load notifications:', error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        // 🚀 Optimistic Update: Change UI instantly
        const previousNotifications = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        try {
            await platformService.markNotificationsRead(undefined, true);
            toast.success("All notifications marked as read");
            // Sync global store count
            useNotificationStore.getState().fetchNotifications();
        } catch (error) {
            setNotifications(previousNotifications); // Rollback on error
            toast.error("Failed to update status");
        }
    };

    const handleMarkRead = async (id: string) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif || notif.is_read) return;

        // 🚀 Optimistic Update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );

        try {
            await platformService.markNotificationsRead([id]);
            // Sync global store count silently
            useNotificationStore.getState().fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
            // Optionally rollback here if needed
        }
    };

    const testSound = () => {
        playNotificationSound();
    };

    const getCategoryStyles = (type: string) => {
        switch (type) {
            case 'ALERT': return { icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", border: 'border-rose-200' };
            case 'SYSTEM': return { icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: 'border-blue-200' };
            case 'WARNING': return { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: 'border-orange-200' };
            case 'SUCCESS': return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: 'border-emerald-200' };
            default: return { icon: Info, color: "text-slate-600", bg: "bg-slate-50", border: 'border-slate-200' };
        }
    };

    const getTargetBadge = (type: string) => {
        switch (type) {
            case 'GLOBAL': return { label: 'Platform Wide', icon: Zap, color: 'bg-violet-50 text-violet-700 border-violet-200' };
            case 'COMPANY': return { label: 'Company', icon: Building, color: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'BRANCH': return { label: 'Branch', icon: MapPin, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            default: return { label: 'Personal', icon: Users, color: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (!n.title?.toLowerCase().includes(term) && !n.message?.toLowerCase().includes(term)) {
                return false;
            }
        }

        // Module filter (category maps to module in UI)
        if (filterCategory) {
            const module = n.metadata?.resource?.split('_')[0]?.toUpperCase() || 'SYSTEM';
            if (module !== filterCategory) return false;
        }

        // Action type filter (filterType)
        if (filterType) {
            const action = n.metadata?.action?.toUpperCase() || n.type?.toUpperCase();
            if (action !== filterType) return false;
        }

        // Scope filter (filterScope)
        if (filterScope && n.target_type !== filterScope) return false;

        return true;
    });

    // 📊 REAL-TIME CORE STATS
    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => n.is_read === false || n.is_read === null).length,
        alerts: notifications.filter(n => n.priority === 'HIGH' || n.category === 'ALERT').length,
        broadcasts: notifications.filter(n => n.target_type === 'GLOBAL').length,
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterCategory("");
        setFilterType("");
        setFilterScope("");
    };

    const hasActiveFilters = searchTerm || filterCategory || filterType || filterScope;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="animate-in fade-in slide-in-from-left duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Bell className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Identity & Notification Engine</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Security Notifications
                        </h1>
                        <p className={`text-sm md:text-base font-semibold transition-all duration-300 ${stats.unread > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {stats.unread > 0
                                ? `🛡️ You have ${stats.unread} unread security events`
                                : '✅ System is secure. All notifications reviewed.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Sound Toggle */}
                        <button
                            onClick={toggleSound}
                            className={`p-3 rounded-xl border transition-all ${soundEnabled
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                            title={soundEnabled ? 'Sound On' : 'Sound Off'}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>

                        {/* Test Sound */}
                        <button
                            onClick={testSound}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            title="Test Sound"
                        >
                            <Zap className="w-5 h-5" />
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={loadNotifications}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Broadcast (Admin only) */}
                        {user?.role?.level && user.role.level >= 4 && (
                            <button
                                onClick={() => setShowComposer(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 hover:scale-[1.02] transition-all"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Broadcast</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top duration-700 delay-100">
                    {[
                        { label: "Total", value: stats.total, icon: Bell, color: "bg-blue-50", iconColor: "text-blue-600" },
                        { label: "Unread", value: stats.unread, icon: Info, color: "bg-violet-50", iconColor: "text-violet-600" },
                        { label: "Alerts", value: stats.alerts, icon: ShieldAlert, color: "bg-rose-50", iconColor: "text-rose-600" },
                        { label: "Broadcast", value: stats.broadcasts, icon: Megaphone, color: "bg-amber-50", iconColor: "text-amber-600" }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Advanced Filters</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-[#0066FF] hover:text-[#0052CC] transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear All
                                </button>
                            )}
                            {stats.unread > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark All Read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                            />
                        </div>

                        {/* Module Filter */}
                        <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none z-10" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Modules</option>
                                <option value="HRMS">HR Module</option>
                                <option value="CRM">CRM Module</option>
                                <option value="FINANCE">Finance</option>
                                <option value="AUTH">Authentication</option>
                                <option value="CORE">System Core</option>
                            </select>
                        </div>

                        {/* Action Type Filter */}
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none z-10" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Creation</option>
                                <option value="UPDATE">Updates</option>
                                <option value="DELETE">Deletions</option>
                                <option value="LOGIN">Security</option>
                            </select>
                        </div>

                        {/* Target Scope Filter */}
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none z-10" />
                            <select
                                value={filterScope}
                                onChange={(e) => setFilterScope(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Scopes</option>
                                <option value="GLOBAL">Platform Wide</option>
                                <option value="COMPANY">Company Level</option>
                                <option value="BRANCH">Branch Level</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Synchronizing notification stream...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">No Notifications</h4>
                        <p className="text-sm text-slate-500">
                            {hasActiveFilters ? 'No activities match your current selection.' : 'You are completely caught up!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notif) => {
                            const styles = getCategoryStyles(notif.type);
                            const target = getTargetBadge(notif.target_type);
                            const Icon = styles.icon;
                            const TargetIcon = target.icon;

                            // Extract module from metadata or title
                            const module = notif.metadata?.resource?.split('_')[0]?.toUpperCase() || 'SYSTEM';

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleMarkRead(notif.id)}
                                    className={`bg-white rounded-2xl p-5 md:p-6 border shadow-sm transition-all hover:shadow-md cursor-pointer group animate-in fade-in slide-in-from-bottom-2 ${!notif.is_read ? 'border-l-4 border-l-[#0066FF] border-slate-100' : 'border-slate-100'
                                        }`}
                                >
                                    <div className="flex gap-4 md:gap-6">
                                        {/* Icon Container */}
                                        <div className={`w-12 h-12 md:w-16 md:h-16 ${styles.bg} ${styles.border} border rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                                            <Icon className={`w-6 h-6 md:w-8 md:h-8 ${styles.color}`} />
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 min-w-0">
                                            {/* Top Line: Badges & Info */}
                                            <div className="flex flex-wrap items-center justify-between gap-y-2 mb-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.color} ${styles.border}`}>
                                                        {notif.priority === 'HIGH' ? 'URGENT' : notif.type || 'INFO'}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${target.color} flex items-center gap-1.5`}>
                                                        <TargetIcon className="w-3 h-3" />
                                                        {target.label}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {module}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            {/* Title & Message */}
                                            <h4 className={`text-base md:text-lg font-bold mb-1 group-hover:text-[#0066FF] transition-colors ${!notif.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {notif.title}
                                            </h4>

                                            {/* Professional Narrative Message */}
                                            <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
                                                {notif.message}
                                            </p>

                                            {/* Action Bar */}
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500">
                                                        Tracked Action
                                                    </span>
                                                </div>

                                                {notif.action_url && (
                                                    <button className="text-xs font-black text-[#0066FF] flex items-center gap-1 group/btn">
                                                        View Details
                                                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Composer Modal */}
                {showComposer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowComposer(false)} />
                        <div className="relative w-full max-w-2xl">
                            <NotificationComposer
                                userLevel={user?.role?.level || 0}
                                onSuccess={() => loadNotifications()}
                                onClose={() => setShowComposer(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
}
