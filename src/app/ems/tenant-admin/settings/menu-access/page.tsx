
"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Lock, Save, LayoutDashboard, Building2, Users, CreditCard, ShieldCheck, Briefcase, FileText, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const AVAILABLE_MENUS = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "reports", label: "Reports & Analytics", icon: FileText },
    { key: "employees", label: "Employee Management", icon: Users },
    { key: "attendance", label: "Attendance", icon: Users },
    { key: "settings", label: "Settings", icon: Settings },
];

const TARGET_ROLES = [
    { key: "BRANCH_ADMIN", label: "Branch Admin" },
    { key: "EMPLOYEE", label: "Employee" }
];

export default function MenuAccessPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<Record<string, Record<string, boolean>>>({
        BRANCH_ADMIN: {},
        EMPLOYEE: {}
    });

    useEffect(() => {
        fetchConfig();
    }, []);



    const fetchConfig = async () => {
        try {
            // Use api instance to hit backend correctly
            const res = await api.get('/auth/company-menus');
            const data = res.data;
            if (data.data) {
                // Merge with default structure to avoid undefined
                setConfig(prev => ({ ...prev, ...data.data }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load permissions");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (roleKey: string, menuKey: string) => {
        setConfig(prev => ({
            ...prev,
            [roleKey]: {
                ...prev[roleKey],
                [menuKey]: !prev[roleKey]?.[menuKey]
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/auth/company-menus', { config });

            toast.success("Permissions updated successfully", {
                description: "Menu access rules have been applied."
            });
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Menu Access Control</h1>
                        <p className="text-slate-500 text-sm mt-1">Configure what Branch Admins and Employees can see.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save Changes</span>
                    </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 w-1/3">Menu Item</th>
                                {TARGET_ROLES.map(role => (
                                    <th key={role.key} className="px-6 py-4 text-center">{role.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {AVAILABLE_MENUS.map((menu) => (
                                <tr key={menu.key} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <menu.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700 text-sm block">{menu.label}</span>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                                    ID: {menu.key}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    {TARGET_ROLES.map(role => {
                                        const isChecked = config[role.key]?.[menu.key] !== false; // Default true if undefined? Or default false?
                                        // Let's assume default is FALSE for safety, or TRUE for convenience.
                                        // User requirement: "Branch Admin can see Reports NO". Implies default might be Yes?
                                        // Let's rely on state. If undefined, treat as FALSE for strictness.
                                        const checked = config[role.key]?.[menu.key] === true;

                                        return (
                                            <td key={role.key} className="px-6 py-4 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={checked}
                                                        onChange={() => handleToggle(role.key, menu.key)}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Access Control Policy</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            Changes made here apply immediately to all users with the selected roles within your company.
                            Platform Admins retain view-only access to all menus regardless of these settings.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
