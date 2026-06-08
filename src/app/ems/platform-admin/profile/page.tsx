"use client";

import React, { useState, useEffect } from "react";
import {
    UserCircle,
    ShieldCheck,
    Key,
    History,
    Lock,
    Mail,
    Phone,
    Edit3,
    Save,
    X,
    Activity,
    Globe,
    Crown,
    Loader2,
    Camera,
    Building2,
    Users,
    Zap,
    Monitor,
    Smartphone,
    MapPin,
    Calendar,
    Settings,
    ChevronRight,
    Bell,
    Fingerprint,
    Cloud
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { platformService } from "@/services/platformService";
import api from "@/lib/api";

interface ProfileFormData {
    display_name: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    timezone: string;
}

export default function PlatformProfile() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [stats, setStats] = useState({
        companies: 0,
        users: 0,
        logs: 0,
        uptime: "99.98%"
    });

    const [formData, setFormData] = useState<ProfileFormData>({
        display_name: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        timezone: "Asia/Kolkata"
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const [userData, companies, users, logs] = await Promise.all([
                platformService.getMe(),
                platformService.getCompanies(),
                platformService.getUsers(),
                platformService.getAuditLogs()
            ]);

            setProfileData(userData);
            setStats({
                companies: companies?.length || 0,
                users: users?.length || 0,
                logs: logs?.length || 0,
                uptime: "99.99%"
            });

            // Initialize form data
            if (userData?.user) {
                setFormData({
                    display_name: userData.user.display_name || "",
                    first_name: userData.user.first_name || "",
                    last_name: userData.user.last_name || "",
                    phone_number: userData.user.phone || "",
                    timezone: userData.user.timezone || "Asia/Kolkata"
                });

                // Fetch registered sessions for HUD
                try {
                    const res = await api.get(`/auth/debug?userId=${userData.user.id}`);
                    if (res.data.success) {
                        setProfileData((prev: any) => ({ ...prev, activeSessions: res.data.data.sessions }));
                    }
                } catch (e) { }
            }

            // Filter logic for current user logs
            const userLogs = (logs || [])
                .filter((l: any) => l.user_email === userData?.user?.email || l.user_id === userData?.user?.id)
                .slice(0, 6);

            setRecentActivity(userLogs.map((log: any) => ({
                id: log.id,
                action: log.action,
                resource: log.resource_type || log.table_name || 'System',
                time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                ip: log.ip_address || "0.0.0.0",
                type: log.action.toUpperCase()
            })));

        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const updatedUser = await platformService.updateProfile(formData);

            if (updatedUser) {
                setProfileData((prev: any) => ({
                    ...prev,
                    user: { ...prev?.user, ...updatedUser }
                }));

                if (user) {
                    setUser({
                        ...user,
                        display_name: updatedUser.display_name,
                        first_name: updatedUser.first_name,
                        last_name: updatedUser.last_name
                    });
                }
            }

            toast.success("Identity updated successfully", {
                description: "Your platform profile has been re-synchronized."
            });
            setEditing(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const getRoleInfo = () => {
        const level = user?.role?.level || profileData?.user?.user_roles?.[0]?.roles?.level || 5;
        if (level >= 5) return { name: "Platform Admin", label: "Root Access", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: Crown };
        return { name: "Operator", label: "Limited Access", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: Activity };
    };

    const roleInfo = getRoleInfo();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-[#0066FF]/10 border-t-[#0066FF] rounded-full animate-spin" />
                        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#0066FF]" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronizing Identity...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                {/* 🌌 Premium Glassmorphic Header */}
                <div className="relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                    {/* Animated Cover Backdrop */}
                    <div className="relative h-48 md:h-64 bg-[#0F172A]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/40 via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                        {/* Status Badges */}
                        <div className="absolute right-6 top-6 flex gap-3 z-20">
                            <div className="hidden md:flex flex-col items-end">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live System Node</span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-lg border ${roleInfo.border}`}>
                                <roleInfo.icon className={`w-4 h-4 ${roleInfo.color}`} />
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-extrabold ${roleInfo.color} uppercase leading-none`}>{roleInfo.name}</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{roleInfo.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Interaction Zone */}
                    <div className="px-6 md:px-10 pb-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20">
                            {/* Avatar & Identity Pulse */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                                <div className="relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-50 border-[6px] border-white shadow-2xl flex items-center justify-center overflow-hidden group">
                                        <div className="w-full h-full bg-gradient-to-tr from-[#0066FF] to-[#00A3FF] flex items-center justify-center text-white text-4xl md:text-5xl font-black">
                                            {formData.display_name?.charAt(0) || "P"}
                                        </div>
                                        {editing && (
                                            <button className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                <Camera className="w-8 h-8 text-white" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center p-1">
                                        <div className="w-full h-full rounded-xl bg-[#0066FF] flex items-center justify-center">
                                            <Fingerprint className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pb-2 space-y-1">
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                        {formData.display_name || "Platform Root"}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                            <Mail className="w-3.5 h-3.5" />
                                            {user?.email}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Verified Account
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Controls */}
                            <div className="flex items-center gap-3">
                                {!editing ? (
                                    <>
                                        <button className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                                            <Settings className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="group flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                        >
                                            <Edit3 className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                                            Modify Identity
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setEditing(false)}
                                            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="flex items-center gap-2.5 px-8 py-3.5 bg-[#0066FF] text-white rounded-2xl font-bold text-sm hover:bg-[#0052CC] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Commit Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🏢 Global Infrastructure Overview (Level 5 HUD) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Managed Companies", value: stats.companies, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", trend: "Active assets" },
                        { label: "Global Workforce", value: stats.users, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", trend: "User nodes" },
                        { label: "Security Events", value: stats.logs, icon: Activity, color: "text-amber-600", bg: "bg-amber-50", trend: "Registry hits" },
                        { label: "Platform Uptime", value: stats.uptime, icon: Cloud, color: "text-violet-600", bg: "bg-violet-50", trend: "Service stability" }
                    ].map((idx_stat, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${idx_stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <idx_stat.icon className={`w-6 h-6 ${idx_stat.color}`} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-50 px-2 py-1 rounded">Metrics</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{idx_stat.value}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{idx_stat.label}</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-slate-300" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{idx_stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Control Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Intelligence: Profile & Security */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Identity Parameters */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] group" />

                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-[#0066FF]/10 flex items-center justify-center">
                                    <UserCircle className="w-6 h-6 text-[#0066FF]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Parameters</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure your platform signature</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: "Public Display Name", key: "display_name", type: "text", icon: UserCircle },
                                    { label: "Administrative Email", key: "email", type: "email", icon: Mail, disabled: true, value: user?.email },
                                    { label: "Legal Given Name", key: "first_name", type: "text", icon: UserCircle },
                                    { label: "Legal Surname", key: "last_name", type: "text", icon: UserCircle },
                                    { label: "Secure Communication Line", key: "phone_number", type: "tel", icon: Phone, placeholder: "+91 91234 56789" },
                                    { label: "Operational Timezone", key: "timezone", type: "select", icon: Globe }
                                ].map((field: any) => (
                                    <div key={field.key} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <field.icon className="w-3.5 h-3.5 text-slate-400" />
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">{field.label}</label>
                                        </div>
                                        {field.type === "select" ? (
                                            <div className="relative group">
                                                <select
                                                    disabled={!editing}
                                                    value={formData.timezone}
                                                    onChange={(e) => handleInputChange("timezone", e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] py-4 px-5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 appearance-none transition-all"
                                                >
                                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                    <option value="America/New_York">America/New York (EST)</option>
                                                    <option value="Europe/London">Europe/London (GMT)</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                disabled={field.disabled || !editing}
                                                value={field.value || (formData as any)[field.key]}
                                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] py-4 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0066FF]/20 disabled:opacity-60 transition-all placeholder:text-slate-300"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Forensic Debug - Token Sid Verification */}
                            <div className="mt-10 pt-10 border-t border-slate-50">
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-amber-600" />
                                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Active Security Token Sid</span>
                                    </div>
                                    <code className="text-[10px] font-mono font-bold text-amber-900 break-all bg-white/50 p-2 rounded block">
                                        {typeof window !== 'undefined' ? (
                                            (() => {
                                                const token = require('js-cookie').get('access_token');
                                                if (!token) return 'NO_TOKEN_FOUND';
                                                try {
                                                    const base64Url = token.split('.')[1];
                                                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                                                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                                    }).join(''));
                                                    const payload = JSON.parse(jsonPayload);
                                                    return payload.sid || 'SID_MISSING_IN_TOKEN';
                                                } catch (e) {
                                                    return 'DECODE_ERROR';
                                                }
                                            })()
                                        ) : 'SSR_MODE'}
                                    </code>
                                </div>
                            </div>
                        </div>
                        {/* Recent Governance Activity (Audit Strip) */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
                                        <History className="w-6 h-6 text-violet-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Governance</h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Oversight Registry</p>
                                    </div>
                                </div>
                                <button className="text-[10px] font-black text-[#0066FF] uppercase tracking-widest hover:underline">View Ledger</button>
                            </div>

                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="group flex items-center gap-4 p-5 rounded-3xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                                            <Activity className="w-5 h-5 text-slate-400 group-hover:text-[#0066FF] transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{activity.action}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">•</span>
                                                <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase bg-slate-200/50 px-2 py-0.5 rounded leading-none">{activity.resource}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{activity.date}</span>
                                                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{activity.time}</span>
                                                <span className="flex items-center gap-1 font-mono">{activity.ip}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Intelligence: Security & System Profile */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Forensic Verification Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/40">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0066FF] mb-6">Access Forensics</h3>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Operational IP</p>
                                    <p className="text-xl font-black font-mono tracking-tighter">{recentActivity[0]?.ip || "127.0.0.1"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">MFA Status</p>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                                            Encrypted
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Encryption</p>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/20 text-[#00A3FF] border border-[#0066FF]/30 text-[10px] font-black uppercase tracking-widest">
                                            AES-256
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Sub-Matrix */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Control</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credential Management</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: "Authentication Shield", desc: "Update root password", icon: Key, color: "text-amber-500", bg: "bg-amber-50" },
                                    { title: "Active Sessions", desc: "Manage authorized hardware", icon: Monitor, color: "text-blue-500", bg: "bg-blue-50" },
                                    { title: "Notification Feeds", desc: "Alert priority routing", icon: Bell, color: "text-rose-500", bg: "bg-rose-50" }
                                ].map((item, i) => (
                                    <button key={i} className="group w-full flex items-center gap-4 p-5 rounded-3xl bg-slate-50 hover:bg-slate-900 transition-all duration-300">
                                        <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-90 transition-transform`}>
                                            <item.icon className={`w-6 h-6 ${item.color} group-hover:text-slate-900 transition-colors`} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover:text-white transition-colors">{item.title}</p>
                                            <p className="text-xs text-slate-400 font-bold group-hover:text-slate-500 transition-colors">{item.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Platform Intelligence Feed */}
                        <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-[2rem] p-8 text-white relative shadow-xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] rounded-full -mr-20 -mt-20" />
                            <div className="relative z-10 flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none">Registered Nodes</h3>
                                <Monitor className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="space-y-3 relative z-10">
                                {(profileData?.activeSessions || []).map((s: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 p-2 rounded-xl border border-white/10">
                                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                        <span className="text-[9px] font-mono opacity-80 truncate">{s}</span>
                                    </div>
                                ))}
                                {(!profileData?.activeSessions || profileData.activeSessions.length === 0) && (
                                    <p className="text-[10px] uppercase font-bold opacity-40 text-center py-2">No active Registry entries</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
