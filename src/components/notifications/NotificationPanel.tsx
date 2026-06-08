"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle,
    X,
    CheckCheck,
    Volume2,
    VolumeX,
    ExternalLink,
    Zap,
    ShieldAlert,
    Megaphone,
    Activity,
    ArrowRight
} from "lucide-react";
import { useNotificationStore, NotificationType } from "@/store/useNotificationStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

const icons: Record<NotificationType, any> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
    system: Zap,
};

const colors: Record<NotificationType, { icon: string; bg: string; border: string }> = {
    success: { icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    error: { icon: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
    info: { icon: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    warning: { icon: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    system: { icon: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
};

const categoryIcons: Record<string, any> = {
    ALERT: ShieldAlert,
    ANNOUNCEMENT: Megaphone,
    REMINDER: Bell,
};

interface NotificationPanelProps {
    onClose: () => void;
    isMobile?: boolean;
}

export default function NotificationPanel({ onClose, isMobile = false }: NotificationPanelProps) {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        soundEnabled,
        toggleSound
    } = useNotificationStore();
    const router = useRouter();

    const handleNotificationClick = async (n: any) => {
        // 1. Mark as read
        if (!n.read) markAsRead(n.id);

        // 2. Redirect if URL exists
        if (n.actionUrl) {
            router.push(n.actionUrl);
            onClose(); // Close panel on navigation
        }
    };

    return (
        <div className={`
            ${isMobile
                ? 'fixed inset-y-0 right-0 w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col z-[100]'
                : 'absolute right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]'
            }
            transition-transform duration-300
        `}>
            {/* Header */}
            <div className={`${isMobile ? 'p-6 pb-4' : 'p-4'} border-b border-slate-100 bg-white flex-shrink-0`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0066FF] flex items-center justify-center shadow-lg shadow-[#0066FF]/25">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
                            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                <span className={`inline-block w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Sound Toggle */}
                        <button
                            onClick={toggleSound}
                            className={`p-2.5 rounded-xl transition-all ${soundEnabled
                                ? 'bg-blue-50 text-[#0066FF] hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                            title={soundEnabled ? 'Sound On' : 'Sound Off'}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group"
                        >
                            <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={markAllAsRead}
                            className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#0066FF] hover:text-[#0066FF] transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                        <Link
                            href="/ems/academic-manager/dashboard"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-[#0066FF] text-white rounded-xl text-xs font-bold hover:bg-[#0052CC] transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View All
                        </Link>
                    </div>
                )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1 bg-white">
                {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                            <Bell className="w-10 h-10 text-slate-200" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Clean Slate!</h4>
                        <p className="text-sm text-slate-500 max-w-[220px] leading-relaxed mx-auto font-medium">
                            Notifications about your account and activity will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.slice(0, 15).map((n) => {
                            const Icon = categoryIcons[n.category || ''] || icons[n.type] || Info;
                            const colorClass = colors[n.type] || colors.info;

                            return (
                                <div
                                    key={n.id}
                                    className={`relative p-5 transition-all cursor-pointer group ${!n.read
                                        ? 'bg-blue-50/50 hover:bg-blue-50'
                                        : 'bg-white hover:bg-slate-50'
                                        }`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    {!n.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0066FF] shadow-[2px_0_10px_rgba(0,102,255,0.4)]" />
                                    )}
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-2xl ${colorClass.bg} ${colorClass.border} border shrink-0 group-hover:scale-105 transition-transform`}>
                                            <Icon className={`w-5 h-5 ${colorClass.icon}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h4 className={`text-[14px] font-bold leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {n.title}
                                                </h4>
                                                {!n.read && (
                                                    <span className="w-2 h-2 bg-[#0066FF] rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(0,102,255,0.5)]" />
                                                )}
                                            </div>
                                            <p className={`text-[13px] leading-relaxed mb-3 ${!n.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {n.category && (
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${colorClass.bg} ${colorClass.icon} ${colorClass.border}`}>
                                                            {n.category}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tight">
                                                        <Activity className="w-3 h-3" strokeWidth={3} />
                                                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                {n.actionUrl && (
                                                    <span className="text-[10px] text-[#0066FF] font-black uppercase tracking-widest flex items-center gap-1 shrink-0 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100/50">
                                                        {n.metadata?.action_label || 'View'}
                                                        <ArrowRight className="w-3 h-3" strokeWidth={3} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                    <button
                        onClick={clearAll}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear All
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-white border border-slate-200 rounded-md">
                        {notifications.length} Total
                    </span>
                </div>
            )}
        </div>
    );
}
