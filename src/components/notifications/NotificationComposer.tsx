"use client";

import React, { useState, useEffect } from "react";
import {
    Send,
    Users,
    Building,
    MapPin,
    Bell,
    ShieldAlert,
    X,
    Info,
    AlertTriangle,
    Zap,
    User
} from "lucide-react";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface NotificationComposerProps {
    onSuccess?: () => void;
    onClose?: () => void;
    userLevel: number;
}

export default function NotificationComposer({ onSuccess, onClose, userLevel }: NotificationComposerProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState("INFORMATION");
    const [priority, setPriority] = useState("NORMAL");
    const [targetType, setTargetType] = useState("USER");
    const [targetRoleLevel, setTargetRoleLevel] = useState("");

    // Target selections
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    // Data for dropdowns
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        loadSelectionData();
    }, []);

    const loadSelectionData = async () => {
        try {
            if (userLevel >= 5) {
                const comps = await platformService.getCompanies();
                setCompanies(comps || []);
            }

            if (userLevel >= 4) {
                const brs = await platformService.getBranches();
                setBranches(brs || []);
            }

            const emps = await platformService.getEmployees();
            setEmployees(emps || []);
        } catch (error) {
            console.error("Failed to load selection data", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                message,
                category,
                priority,
                target_type: targetType,
                target_role_level: targetType === 'ROLE' ? Number(targetRoleLevel) : null,
                company_id: selectedCompanyId || null,
                branch_id: selectedBranchId || null,
                target_id: selectedUserId || null
            };

            await platformService.sendNotification(payload);
            toast.success("Notification broadcast successfully");
            if (onSuccess) onSuccess();
            if (onClose) onClose();

            // Reset form
            setTitle("");
            setMessage("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    // Determine available target types based on user level
    const getAvailableTargetTypes = () => {
        if (userLevel >= 5) {
            return [
                { id: "GLOBAL", label: "System Wide", icon: Zap },
                { id: "COMPANY", label: "By Company", icon: Building },
                { id: "ROLE", label: "By Position", icon: ShieldAlert },
                { id: "USER", label: "Individual", icon: User }
            ];
        }
        if (userLevel === 4) {
            return [
                { id: "COMPANY", label: "Entire Company", icon: Building },
                { id: "ROLE", label: "By Position", icon: ShieldAlert },
                { id: "BRANCH", label: "Specific Branch", icon: MapPin },
                { id: "USER", label: "Individual", icon: User }
            ];
        }
        if (userLevel === 1) {
            return [
                { id: "BRANCH", label: "Entire Branch", icon: MapPin },
                { id: "USER", label: "Specific Staff", icon: User }
            ];
        }
        return [];
    };

    const targetRoles = [
        { level: "4", label: "Company Administrators" },
        { level: "1", label: "Branch Administrators" },
        { level: "0", label: "Employees / Users" }
    ].filter(r => Number(r.level) < userLevel || userLevel === 5); // Cannot target above self

    const categories = [
        { id: "ANNOUNCEMENT", label: "Announcement", icon: Bell, color: "text-blue-600" },
        { id: "ALERT", label: "Alert / Warning", icon: ShieldAlert, color: "text-rose-600" },
        { id: "REMINDER", label: "Reminder", icon: Zap, color: "text-amber-600" },
        { id: "INFORMATION", label: "General Info", icon: Info, color: "text-emerald-600" }
    ];

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight">Broadcast Center</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hierarchical Dispatcher</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* 1. Targeting Level */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Scope</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {getAvailableTargetTypes().map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setTargetType(type.id)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${targetType === type.id
                                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                                    : "border-slate-50 bg-slate-50/30 text-slate-500 hover:border-slate-200"
                                    }`}
                            >
                                <type.icon className={`w-5 h-5 ${targetType === type.id ? "text-indigo-600" : "text-slate-400"}`} />
                                <span className="text-[10px] font-black uppercase tracking-tight">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Target Details (Dynamic based on Selection) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {targetType === 'ROLE' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Position</label>
                            <select
                                value={targetRoleLevel}
                                onChange={(e) => setTargetRoleLevel(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
                                <option value="">Select Level</option>
                                {targetRoles.map(r => <option key={r.level} value={r.level}>{r.label}</option>)}
                            </select>
                        </div>
                    )}
                    {targetType === 'COMPANY' && userLevel >= 5 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Company</label>
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
                                <option value="">Select Company</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {targetType === 'BRANCH' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Branch</label>
                            <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}

                    {targetType === 'USER' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Individual</label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
                                <option value="">Select Employee</option>
                                {employees.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.first_name} {e.last_name} ({e.employee_code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Type</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        >
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3. Title & Content */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                        <input
                            type="text"
                            placeholder="Enter a descriptive headline..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                        <textarea
                            rows={4}
                            placeholder="Type your official communication here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-[24px] px-5 py-4 text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="priority"
                                checked={priority === 'HIGH'}
                                onChange={(e) => setPriority(e.target.checked ? 'HIGH' : 'NORMAL')}
                                className="rounded text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="priority" className="text-[10px] font-black text-slate-400 uppercase">High Priority</label>
                        </div>
                    </div>
                    <button
                        disabled={loading}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] hover:bg-slate-900 active:scale-95 flex items-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Broadcast Message</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
