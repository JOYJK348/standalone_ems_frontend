"use client";

import React, { useState, useEffect } from "react";
import {
    Monitor,
    Lock,
    Clock,
    Smartphone,
    ShieldAlert,
    Save,
    ChevronRight,
    Info,
    LayoutDashboard,
    Globe,
    Loader2,
    ShieldCheck,
    Database,
    Zap,
    Settings,
    Activity,
    CreditCard,
    Key,
    UserCircle,
    Server,
    Fingerprint,
    Map,
    Navigation,
    Plus,
    Search,
    Edit3,
    Trash2,
    Flag,
    ActivitySquare,
    AlertTriangle,
    CheckCircle2,
    X,
    ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import ArchivesTab from "@/components/platform/ArchivesTab";

type MasterType = 'COUNTRIES' | 'STATES' | 'CITIES';

interface UsageStat {
    id: number;
    name: string;
    code: string;
    usersUsed: number;
    usersMax: number;
    branchesUsed: number;
    branchesMax: number;
    storageUsed: string;
    storageMax: string;
}

export default function PlatformSystemSettings() {
    const [activeTab, setActiveTab] = useState<"AUTH" | "PROTOCOLS" | "SECURITY" | "UTILIZATION" | "REGISTRY" | "RECOVERY">("AUTH");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<Record<string, any>>({
        "auth.min_password_length": 8,
        "auth.password_expiry_days": 90,
        "auth.session_timeout_hrs": 12,
        "auth.max_concurrent_sessions": 3,
        "limits.max_branches_base": 2,
        "limits.max_staff_per_branch": 50,
        "security.ip_restriction": true,
        "security.device_fingerprinting": true,
        "security.2fa_mandatory": true,
        "security.audit_verbosity": false,
    });

    // Master Registry States
    const [masterTab, setMasterTab] = useState<MasterType>('COUNTRIES');
    const [masterData, setMasterData] = useState<any[]>([]);
    const [masterLoading, setMasterLoading] = useState(false);
    const [masterSearchTerm, setMasterSearchTerm] = useState("");
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [editingMasterItem, setEditingMasterItem] = useState<any>(null);
    const [masterFormData, setMasterFormData] = useState<any>({});

    // Utilization Stats
    const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
    const [usageLoading, setUsageLoading] = useState(false);
    const [usageSearchTerm, setUsageSearchTerm] = useState("");

    // Validation States
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Group Editor State
    const [activeEditGroup, setActiveEditGroup] = useState<string | null>(null);
    const [tempSettings, setTempSettings] = useState<Record<string, any>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'REGISTRY') {
            loadMasterData();
        }
        if (activeTab === 'UTILIZATION') {
            loadUsageData();
        }
    }, [activeTab, masterTab]);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await platformService.getGlobalSettings();
            if (data && data.length > 0) {
                const mapped: Record<string, any> = { ...settings };
                data.forEach((s: any) => {
                    let val: any = s.value;
                    if (val === 'true') val = true;
                    else if (val === 'false') val = false;
                    else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
                    mapped[s.key] = val;
                });
                setSettings(mapped);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            toast.error("Failed to load system settings");
        } finally {
            setIsLoading(false);
            setHasUnsavedChanges(false);
        }
    };

    const loadUsageData = async () => {
        try {
            setUsageLoading(true);
            const [companies, branches, employees] = await Promise.all([
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getEmployees()
            ]);

            const mapped = companies.map((c: any) => {
                const companyEmployees = (employees || []).filter((e: any) => e.company_id === c.id).length;
                const companyBranches = (branches || []).filter((b: any) => b.company_id === c.id).length;

                return {
                    id: c.id,
                    name: c.name,
                    code: c.company_code || c.code,
                    usersUsed: companyEmployees,
                    usersMax: c.max_users || 10,
                    branchesUsed: companyBranches,
                    branchesMax: c.max_branches || 2,
                    storageUsed: "2.4 GB",
                    storageMax: "10 GB"
                };
            });
            setUsageStats(mapped);
        } catch (error) {
            toast.error("Failed to load usage data");
        } finally {
            setUsageLoading(false);
        }
    };

    const [allCountries, setAllCountries] = useState<any[]>([]);
    const [allStates, setAllStates] = useState<any[]>([]);

    const loadMasterData = async () => {
        try {
            setMasterLoading(true);
            let result = [];
            if (masterTab === 'COUNTRIES') {
                result = await platformService.getCountries();
                setAllCountries(result || []);
            }
            else if (masterTab === 'STATES') {
                result = await platformService.getStates();
                const countries = await platformService.getCountries();
                setAllCountries(countries || []);
            }
            else if (masterTab === 'CITIES') {
                result = await platformService.getCities();
                const states = await platformService.getStates();
                setAllStates(states || []);
            }
            setMasterData(result || []);
        } catch (error) {
            toast.error(`Failed to sync ${masterTab.toLowerCase()} registry`);
        } finally {
            setMasterLoading(false);
        }
    };

    const validateSetting = (key: string, value: any): string | null => {
        if (typeof value !== 'number') return null;
        if (key === 'auth.min_password_length') {
            if (value < 6) return 'Minimum length is 6';
            if (value > 32) return 'Maximum length is 32';
        }
        if (key === 'auth.password_expiry_days') {
            if (value < 30) return 'Minimum 30 days';
            if (value > 365) return 'Maximum 365 days';
        }
        return null;
    };

    const handleChange = (key: string, value: any) => {
        const error = validateSetting(key, value);
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) newErrors[key] = error;
            else delete newErrors[key];
            return newErrors;
        });
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasUnsavedChanges(true);
    };

    const handleSave = async () => {
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Validation Error", { description: "Review parameters." });
            return;
        }
        setIsSaving(true);
        try {
            const payload = Object.entries(settings).map(([key, value]) => ({
                key,
                value: String(value),
                group: key.split('.')[0].toUpperCase(),
                is_system_setting: true
            }));
            await platformService.syncGlobalSettings(payload);
            toast.success("Sync Success", { description: "Infrastructure synchronized." });
            setHasUnsavedChanges(false);
        } catch (error: any) {
            toast.error("Sync Failed", { description: error.message });
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleMasterSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            toast.loading("Committing...", { id: 'master-save' });
            if (editingMasterItem) {
                if (masterTab === 'COUNTRIES') await platformService.updateCountry(editingMasterItem.id, masterFormData);
                else if (masterTab === 'STATES') await platformService.updateState(editingMasterItem.id, masterFormData);
                else if (masterTab === 'CITIES') await platformService.updateCity(editingMasterItem.id, masterFormData);
            } else {
                if (masterTab === 'COUNTRIES') await platformService.createCountry(masterFormData);
                else if (masterTab === 'STATES') await platformService.createState(masterFormData);
                else if (masterTab === 'CITIES') await platformService.createCity(masterFormData);
            }
            toast.success("Success", { id: 'master-save' });
            setIsMasterModalOpen(false);
            loadMasterData();
        } catch (error) {
            toast.error("Failed", { id: 'master-save' });
        }
    };

    const handleMasterDelete = async (id: any) => {
        if (!window.confirm("Purge entry?")) return;
        try {
            if (masterTab === 'COUNTRIES') await platformService.deleteCountry(id);
            else if (masterTab === 'STATES') await platformService.deleteState(id);
            else if (masterTab === 'CITIES') await platformService.deleteCity(id);
            toast.success("Purged");
            loadMasterData();
        } catch (error) {
            toast.error("Locked");
        }
    };

    const filteredMasterData = (masterData || []).filter((item: any) =>
        (item.name || "").toLowerCase().includes(masterSearchTerm.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(masterSearchTerm.toLowerCase())
    );

    const filteredUsageData = (usageStats || []).filter(c =>
        (c.name || "").toLowerCase().includes(usageSearchTerm.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(usageSearchTerm.toLowerCase())
    );

    const UsageBar = ({ used, max, colorClass }: { used: number, max: number, colorClass: string }) => {
        const pct = Math.min((used / max) * 100, 100);
        return (
            <div className="w-full">
                <div className="flex justify-between text-[9px] font-bold uppercase mb-1.5 text-slate-400">
                    <span>{used} Used</span>
                    <span>{max} Max</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-[#0066FF] animate-spin" />
                    <p className="text-sm font-bold text-slate-400">LOADING ARCHITECTURE...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-3">
                            <Settings className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Global Policy</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">System Blueprint</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasUnsavedChanges && (
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-bold text-amber-700">Sync Needed</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Sync Parameters
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl w-fit gap-1">
                    {[
                        { id: "AUTH", label: "Auth Protocol", icon: Key },
                        { id: "PROTOCOLS", label: "Global Limits", icon: Server },
                        { id: "SECURITY", label: "Network Security", icon: ShieldCheck },
                        { id: "UTILIZATION", label: "Utilization Monitor", icon: ActivitySquare },
                        { id: "REGISTRY", label: "Global Registry", icon: Database },
                        { id: "RECOVERY", label: "Recovery Center", icon: RotateCcw }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase transition-all ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[500px]">
                    <div className="p-8">
                        {activeTab === "AUTH" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <Fingerprint className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase">Password Policy</h3>
                                            </div>
                                        </div>
                                        <button onClick={() => { setActiveEditGroup('PASSWORD_POLICY'); setTempSettings(settings); }} className="text-blue-600 font-bold text-[10px] uppercase hover:underline">Modify</button>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Minimum Length", key: "auth.min_password_length", unit: "chars" },
                                            { label: "Rotation Cycle", key: "auth.password_expiry_days", unit: "days" }
                                        ].map(f => (
                                            <div key={f.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100/50 text-sm font-semibold">
                                                <span className="text-slate-500">{f.label}</span>
                                                <span className="text-slate-900">{settings[f.key]} {f.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-violet-600" />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase">Session Logic</h3>
                                            </div>
                                        </div>
                                        <button onClick={() => { setActiveEditGroup('SESSION_LOGIC'); setTempSettings(settings); }} className="text-violet-600 font-bold text-[10px] uppercase hover:underline">Modify</button>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Session Timeout", key: "auth.session_timeout_hrs", unit: "hours" },
                                            { label: "Max Concurrent Logins", key: "auth.max_concurrent_sessions", unit: "sessions" }
                                        ].map(f => (
                                            <div key={f.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100/50 text-sm font-semibold">
                                                <span className="text-slate-500">{f.label}</span>
                                                <span className="text-slate-900">{settings[f.key]} {f.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "PROTOCOLS" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-amber-600" />
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Tenant Defaults</h3>
                                        </div>
                                        <button onClick={() => { setActiveEditGroup('TENANT_DEFAULTS'); setTempSettings(settings); }} className="text-amber-600 font-bold text-[10px] uppercase hover:underline">Modify</button>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Max Branches", key: "limits.max_branches_base", unit: "branches" },
                                            { label: "Staff Pool Per Branch", key: "limits.max_staff_per_branch", unit: "staff" }
                                        ].map(f => (
                                            <div key={f.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100/50 text-sm font-semibold">
                                                <span className="text-slate-500">{f.label}</span>
                                                <span className="text-slate-900">{settings[f.key]} {f.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "SECURITY" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { key: "security.ip_restriction", label: "IP Restriction Enforcement", icon: Globe, color: "text-blue-600" },
                                    { key: "security.device_fingerprinting", label: "Device Trust Registry", icon: Smartphone, color: "text-violet-600" },
                                    { key: "security.2fa_mandatory", label: "Mandatory Multi-Factor", icon: ShieldCheck, color: "text-emerald-600" },
                                    { key: "security.audit_verbosity", label: "High-Verbosity Auditing", icon: Activity, color: "text-rose-600" },
                                ].map((s) => (
                                    <div key={s.key} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <s.icon className={`w-6 h-6 ${s.color}`} />
                                            <span className="text-sm font-bold text-slate-900">{s.label}</span>
                                        </div>
                                        <button
                                            onClick={() => handleChange(s.key, !settings[s.key])}
                                            className={`w-12 h-6 rounded-full px-1 flex items-center transition-all ${settings[s.key] ? "bg-blue-600" : "bg-slate-300"}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings[s.key] ? "translate-x-6" : ""}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "UTILIZATION" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                    <h3 className="text-lg font-bold text-slate-900">Resource Utilization</h3>
                                    <input
                                        type="text"
                                        placeholder="Search entities..."
                                        className="bg-slate-100 border-none rounded-xl text-xs px-4 py-2 focus:ring-0 w-64"
                                        value={usageSearchTerm}
                                        onChange={e => setUsageSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] uppercase font-bold text-slate-400">
                                            <tr>
                                                <th className="pb-4">Enterprise</th>
                                                <th className="pb-4">User Seats</th>
                                                <th className="pb-4">Branch Slots</th>
                                                <th className="pb-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-sm font-semibold">
                                            {filteredUsageData.map(stat => (
                                                <tr key={stat.id}>
                                                    <td className="py-4">
                                                        <p className="text-slate-900">{stat.name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase">{stat.code}</p>
                                                    </td>
                                                    <td className="py-4 min-w-[150px]"><UsageBar used={stat.usersUsed} max={stat.usersMax} colorClass="bg-emerald-500" /></td>
                                                    <td className="py-4 min-w-[150px]"><UsageBar used={stat.branchesUsed} max={stat.branchesMax} colorClass="bg-blue-500" /></td>
                                                    <td className="py-4 text-right"><button className="text-blue-600 text-xs">Adjust</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "REGISTRY" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                                    {['COUNTRIES', 'STATES', 'CITIES'].map(t => (
                                        <button key={t} onClick={() => setMasterTab(t as any)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${masterTab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>{t.toLowerCase()}</button>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="Filter registry..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 text-xs" value={masterSearchTerm} onChange={e => setMasterSearchTerm(e.target.value)} />
                                    </div>
                                    <button onClick={() => { setEditingMasterItem(null); setMasterFormData({}); setIsMasterModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">+ Add Entry</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm font-semibold">
                                        <thead className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-50">
                                            <tr><th className="pb-4">Identity</th><th className="pb-4">Registry Code</th><th className="pb-4 text-right">Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredMasterData.map(item => (
                                                <tr key={item.id} className="border-b border-slate-50/50">
                                                    <td className="py-4 text-slate-900">{item.name}</td>
                                                    <td className="py-4 font-mono text-slate-400">{item.code || item.id}</td>
                                                    <td className="py-4 text-right">
                                                        <button onClick={() => { setEditingMasterItem(item); setMasterFormData(item); setIsMasterModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleMasterDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "RECOVERY" && <ArchivesTab />}
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100/50 gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Environment Secured • Heartbeat Active</span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-300 uppercase tracking-tight">Configuration Synchronized with Durkkas Cloud Cluster-A</p>
                </div>
            </div>

            {/* Config Editor Modal */}
            {activeEditGroup && (() => {
                const fields: any[] = [];
                let title = "";
                if (activeEditGroup === 'PASSWORD_POLICY') {
                    title = "Password Policy";
                    fields.push({ label: "Minimum Length", key: "auth.min_password_length", min: 6, max: 32, unit: "chars" });
                    fields.push({ label: "Rotation Cycle", key: "auth.password_expiry_days", min: 30, max: 365, unit: "days" });
                } else if (activeEditGroup === 'SESSION_LOGIC') {
                    title = "Session Logic";
                    fields.push({ label: "Session Timeout", key: "auth.session_timeout_hrs", min: 1, max: 168, unit: "hours" });
                    fields.push({ label: "Max Concurrent Logins", key: "auth.max_concurrent_sessions", min: 1, max: 10, unit: "sessions" });
                } else if (activeEditGroup === 'TENANT_DEFAULTS') {
                    title = "Tenant Defaults";
                    fields.push({ label: "Max Branches", key: "limits.max_branches_base", min: 1, max: 100, unit: "branches" });
                    fields.push({ label: "Staff Per Branch", key: "limits.max_staff_per_branch", min: 5, max: 1000, unit: "staff" });
                }

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveEditGroup(null)} />
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
                                <button onClick={() => setActiveEditGroup(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                {fields.map(f => (
                                    <div key={f.key} className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{f.label}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-lg font-bold focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                                                value={tempSettings[f.key] || ''}
                                                onChange={e => setTempSettings({ ...tempSettings, [f.key]: Number(e.target.value) })}
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase">{f.unit}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 flex gap-4">
                                    <button onClick={() => setActiveEditGroup(null)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
                                    <button
                                        onClick={() => {
                                            setSettings(tempSettings);
                                            setHasUnsavedChanges(true);
                                            setActiveEditGroup(null);
                                        }}
                                        className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                    >
                                        Apply Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Master Modal */}
            {isMasterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMasterModalOpen(false)} />
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{editingMasterItem ? 'Edit Entry' : 'New Entry'}</h3>
                            <button onClick={() => setIsMasterModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleMasterSave} className="p-8 space-y-4">
                            {masterTab === 'STATES' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Parent Country</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold" value={masterFormData.country_id || ''} onChange={e => setMasterFormData({ ...masterFormData, country_id: e.target.value })} required>
                                        <option value="">Select Country</option>
                                        {allCountries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            {masterTab === 'CITIES' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Parent State</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold" value={masterFormData.state_id || ''} onChange={e => setMasterFormData({ ...masterFormData, state_id: e.target.value })} required>
                                        <option value="">Select State</option>
                                        {allStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Name</label>
                                <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold" value={masterFormData.name || ''} onChange={e => setMasterFormData({ ...masterFormData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Code</label>
                                <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold uppercase" value={masterFormData.code || ''} onChange={e => setMasterFormData({ ...masterFormData, code: e.target.value.toUpperCase() })} required />
                            </div>
                            {masterTab === 'COUNTRIES' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">Phone Code</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm" value={masterFormData.phone_code || ''} onChange={e => setMasterFormData({ ...masterFormData, phone_code: e.target.value })} /></div>
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">Currency</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm" value={masterFormData.currency_code || ''} onChange={e => setMasterFormData({ ...masterFormData, currency_code: e.target.value })} /></div>
                                </div>
                            )}
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsMasterModalOpen(false)} className="flex-1 py-3 font-bold text-slate-400">Abort</button>
                                <button type="submit" className="flex-[2] bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
