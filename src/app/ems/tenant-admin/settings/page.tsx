"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Building2,
    Settings,
    ShieldCheck,
    Save,
    Plus,
    Loader2,
    LayoutGrid,
    Users2,
    Hash,
    Trash2,
    Crown,
    CheckCircle2,
    Zap,
    CreditCard,
    Edit3,
    X,
    Building,
    Briefcase,
    AlertCircle,
    Lock,
    Pencil,
    History as HistoryIcon,
    RotateCcw,
    Archive,
    Palette,
    Store
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";
import ImageUpload from "@/components/ui/ImageUpload";

export default function WorkspaceSettings() {
    const { user } = useAuthStore();
    const { limits, hasModule, refresh: refreshLimits } = useFeatureAccess();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"GENERAL" | "DEPARTMENTS" | "DESIGNATIONS" | "SUBSCRIPTION" | "ARCHIVES" | "BRANDING">("GENERAL");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Data States
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [archivedLeads, setArchivedLeads] = useState<any[]>([]);

    // Edit/Delete States
    const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
    const [editingDesigId, setEditingDesigId] = useState<string | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ id: string, type: 'DEPT' | 'DESIG', name: string } | null>(null);
    const [deleteReason, setDeleteReason] = useState("");

    // Form States for Department
    const [deptForm, setDeptForm] = useState({
        name: "",
        code: "",
        description: "",
        branch_id: "",
        parent_department_id: ""
    });

    // Form States for Designation
    const [desigForm, setDesigForm] = useState({
        title: "",
        code: "",
        description: "",
        level: 1
    });

    // Branding State
    const [brandingForm, setBrandingForm] = useState({
        logo_url: "",
        favicon_url: "",
        primary_color: "#0066FF",
        secondary_color: "#0052CC",
        accent_color: "#00C853"
    });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ["GENERAL", "DEPARTMENTS", "DESIGNATIONS", "SUBSCRIPTION", "BRANDING", "ARCHIVES"].includes(tab.toUpperCase())) {
            setActiveTab(tab.toUpperCase() as any);
        }
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === "DEPARTMENTS") {
            loadDepartments();
            loadBranches();
        }
        if (activeTab === "DESIGNATIONS") loadDesignations();
        if (activeTab === "SUBSCRIPTION") loadCompanyDetails();
        if (activeTab === "ARCHIVES") loadArchivedLeads();
        if (activeTab === "BRANDING") loadBranding();
    }, [activeTab]);

    const loadBranding = async () => {
        setLoading(true);
        try {
            const companies = await platformService.getCompanies();
            if (companies && companies.length > 0) {
                const companyData = companies[0];
                setCompany(companyData);

                // Fetch dedicated branding info (it's in its own table)
                const branding = await platformService.getCompanyBranding(companyData.id.toString());

                if (branding) {
                    setBrandingForm({
                        logo_url: branding.logo_url || "",
                        favicon_url: branding.favicon_url || "",
                        primary_color: branding.primary_color || "#0066FF",
                        secondary_color: branding.secondary_color || "#0052CC",
                        accent_color: branding.accent_color || "#00C853"
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch branding details");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBranding = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!company?.id) {
                // Try to load company if missing
                const companies = await platformService.getCompanies();
                if (companies.length > 0) {
                    await platformService.updateCompanyBranding(companies[0].id, brandingForm);
                } else {
                    throw new Error("Company not found");
                }
            } else {
                await platformService.updateCompanyBranding(company.id, brandingForm);
            }
            toast.success("Branding updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update branding");
        } finally {
            setSaving(false);
        }
    };

    const loadBranches = async () => {
        try {
            const data = await platformService.getBranches();
            setBranches(data || []);
        } catch (error) {
            console.error("Failed to fetch branches");
        }
    };

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const data = await platformService.getDepartments();
            setDepartments(data || []);
        } catch (error) {
            toast.error("Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    const loadDesignations = async () => {
        setLoading(true);
        try {
            const data = await platformService.getDesignations();
            setDesignations(data || []);
        } catch (error) {
            toast.error("Failed to fetch designations");
        } finally {
            setLoading(false);
        }
    };

    const loadCompanyDetails = async () => {
        setLoading(true);
        try {
            const data = await platformService.getCompanies();
            setCompany(data[0] || null);
        } catch (error) {
            toast.error("Failed to fetch subscription details");
        } finally {
            setLoading(false);
        }
    };

    const loadArchivedLeads = async () => {
        setArchivedLeads([]);
    };

    const handleRestoreLead = async (_lead: any) => {
        toast.info('Archive restore is not available in EMS standalone.');
    };

    // Helper to generate unique code
    const generateCode = (name: string, existing: any[], idField: string = 'code') => {
        if (!name) return "";

        // 1. Create base acronym (e.g. "Administration" -> "HR", "Sales" -> "SAL")
        const words = name.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase().split(/\s+/).filter(w => w.length > 0);
        let base = "";

        if (words.length === 1) {
            base = words[0].substring(0, 3); // "Sales" -> "SAL"
        } else {
            base = words.map(w => w[0]).join('').substring(0, 3); // "Administration" -> "HR"
        }

        if (base.length < 2) base = name.substring(0, 2).toUpperCase();

        // 2. Generate Acronym + Random Number (e.g., HR-892)
        const generateCandidate = () => {
            const num = Math.floor(Math.random() * 900) + 100; // 100-999
            return `${base}-${num}`;
        };

        // 3. Ensure uniqueness
        let code = generateCandidate();
        const exists = (c: string) => existing.some(item =>
            (item[idField] || item.designation_code || item.department_code) === c
        );

        // Try up to 10 times to find a unique code
        let attempts = 0;
        while (exists(code) && attempts < 10) {
            code = generateCandidate();
            attempts++;
        }

        return code;
    };

    const handleDeptNameChange = (val: string) => {
        // Only auto-generate code if we are NOT editing an existing department (unless field was empty)
        if (!editingDeptId) {
            const code = generateCode(val, departments, 'code');
            setDeptForm(prev => ({
                ...prev,
                name: val,
                code: code
            }));
        } else {
            setDeptForm(prev => ({ ...prev, name: val }));
        }
    };

    const handleDesigTitleChange = (val: string) => {
        // Only auto-generate code if we are NOT editing
        if (!editingDesigId) {
            const code = generateCode(val, designations, 'designation_code');
            setDesigForm(prev => ({
                ...prev,
                title: val,
                code: code
            }));
        } else {
            setDesigForm(prev => ({ ...prev, title: val }));
        }
    };

    const handleSaveDept = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deptForm.name.trim()) {
            return toast.error("Name is required");
        }

        setSaving(true);
        try {
            const payload = {
                name: deptForm.name.trim(),
                code: deptForm.code.trim().toUpperCase(),
                description: deptForm.description?.trim() || null,
                branch_id: deptForm.branch_id || null,
                parent_department_id: deptForm.parent_department_id || null,
                is_active: true
            };

            if (editingDeptId) {
                await platformService.updateDepartment(editingDeptId, payload);
                toast.success("Department updated successfully");
            } else {
                await platformService.createDepartment(payload);
                toast.success("Department created successfully");
            }

            setDeptForm({ name: "", code: "", description: "", branch_id: "", parent_department_id: "" });
            setEditingDeptId(null);
            loadDepartments();
            refreshLimits();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editingDeptId ? "update" : "create"} department`);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDesig = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!desigForm.title.trim()) {
            return toast.error("Title is required");
        }

        setSaving(true);
        try {
            const payload = {
                title: desigForm.title.trim(),
                designation_code: desigForm.code.trim().toUpperCase(),
                code: desigForm.code.trim().toUpperCase(),
                description: desigForm.description?.trim() || null,
                level: Number(desigForm.level) || 1,
                is_active: true
            };

            if (editingDesigId) {
                await platformService.updateDesignation(editingDesigId, payload);
                toast.success("Designation updated successfully");
            } else {
                await platformService.createDesignation(payload);
                toast.success("Designation created successfully");
            }

            setDesigForm({ title: "", code: "", description: "", level: 1 });
            setEditingDesigId(null);
            loadDesignations();
            refreshLimits();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editingDesigId ? "update" : "create"} designation`);
        } finally {
            setSaving(false);
        }
    };

    const startEditDept = (dept: any) => {
        setDeptForm({
            name: dept.name || "",
            code: dept.code || dept.department_code || "",
            description: dept.description || "",
            branch_id: dept.branch_id || "",
            parent_department_id: dept.parent_department_id || ""
        });
        setEditingDeptId(dept.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startEditDesig = (desig: any) => {
        setDesigForm({
            title: desig.title || "",
            code: desig.code || desig.designation_code || "",
            description: desig.description || "",
            level: desig.level || 1
        });
        setEditingDesigId(desig.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingDeptId(null);
        setEditingDesigId(null);
        setDeptForm({ name: "", code: "", description: "", branch_id: "", parent_department_id: "" });
        setDesigForm({ title: "", code: "", description: "", level: 1 });
    };

    const handleDelete = async () => {
        if (!deletingItem || !deleteReason.trim()) {
            toast.error("Please provide a reason for deletion");
            return;
        }

        setSaving(true); // Reuse saving state for loading spinner
        try {
            if (deletingItem.type === 'DEPT') {
                await platformService.deleteDepartment(deletingItem.id, deleteReason);
                loadDepartments();
            } else {
                await platformService.deleteDesignation(deletingItem.id, deleteReason);
                loadDesignations();
            }
            toast.success(`${deletingItem.type === 'DEPT' ? 'Department' : 'Designation'} deleted successfully`);
            setDeletingItem(null);
            setDeleteReason("");
            refreshLimits();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deletion failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto pb-12 px-4 md:px-6">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-2xl flex items-center justify-center shadow-lg">
                            <Settings className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        Organization Settings
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 md:mt-2">
                        Configure departments, designations, and company preferences
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 md:pb-0 scrollbar-hide">
                    {[
                        { id: "GENERAL", label: "General", icon: Building2 },
                        { id: "DEPARTMENTS", label: "Departments", icon: LayoutGrid },
                        { id: "DESIGNATIONS", label: "Designations", icon: Users2 },
                        { id: "SUBSCRIPTION", label: "Subscription", icon: Crown },
                        { id: "BRANDING", label: "Branding", icon: Palette },
                        { id: "ARCHIVES", label: "Recovery", icon: HistoryIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === tab.id
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* 5. ARCHIVES & RECOVERY TAB */}
                    {activeTab === "ARCHIVES" && (
                        <div className="p-4 md:p-8 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <HistoryIcon className="w-5 h-5 text-violet-600" />
                                        Data Recycle Bin
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Review recoverable tenant records for EMS standalone.</p>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Archived Records: {archivedLeads.length}
                                </div>
                            </div>

                            {loading && archivedLeads.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
                                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Scanning Cloud Archives...</p>
                                </div>
                            ) : archivedLeads.length > 0 ? (
                                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#F8FAFC] text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                                            <tr>
                                                <th className="px-6 py-4">Deleted Record</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4">Deletion Context</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {archivedLeads.map((lead, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                                    <td className="px-6 py-5">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">{lead._display_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium">{lead.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase text-slate-500 tracking-widest border border-slate-200">
                                                            {lead._typeName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="max-w-[250px]">
                                                            <div className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1.5 mb-1">
                                                                <Trash2 className="w-3 h-3" />
                                                                {lead.delete_reason || 'No reason documented'}
                                                            </div>
                                                            <div className="text-[9px] text-slate-400 font-medium italic">
                                                                Removed on: {new Date(lead.deleted_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            onClick={() => handleRestoreLead(lead)}
                                                            className="h-9 px-4 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 hover:scale-105 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 ml-auto"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            Surgical Restore
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800">Recycle Bin Empty</h4>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Absolute data integrity maintained. No archived records found in your system.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. DEPARTMENTS TAB */}
                    {activeTab === "DEPARTMENTS" && (
                        <div className="p-4 md:p-8">
                            {/* Usage Monitor */}
                            <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-violet-600" />
                                        Department Utilization
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium">Monitoring organizational hierarchy limits.</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-slate-900">{departments.length}</span>
                                        <span className="text-slate-300 text-lg">/</span>
                                        <span className="text-slate-400 font-bold">{limits.maxDepartments === 0 ? '∞' : limits.maxDepartments}</span>
                                    </div>
                                    <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${limits.maxDepartments > 0 && (departments.length / limits.maxDepartments) > 0.9 ? 'bg-rose-500' : 'bg-violet-600'
                                                }`}
                                            style={{ width: `${limits.maxDepartments === 0 ? 10 : Math.min(100, (departments.length / limits.maxDepartments) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Create Form */}
                            <form onSubmit={handleSaveDept} className={`bg-gradient-to-br ${editingDeptId ? 'from-amber-50 to-orange-50 border-amber-200' : 'from-blue-50 to-violet-50 border-blue-100'} rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border transition-all`}>
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <div className={`w-10 h-10 ${editingDeptId ? 'bg-amber-500' : 'bg-blue-600'} text-white rounded-xl flex items-center justify-center`}>
                                        {editingDeptId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-slate-900">
                                            {editingDeptId ? "Edit Department" : "Add New Department"}
                                        </h3>
                                        <p className="text-xs text-slate-600">
                                            {editingDeptId ? "Update existing department details" : "Create a new organizational department"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Department Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Administration"
                                            value={deptForm.name}
                                            onChange={(e) => handleDeptNameChange(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                            <span>Department Code</span>
                                            {!editingDeptId && (
                                                <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Zap className="w-3 h-3" /> AUTO
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={deptForm.code}
                                                readOnly={true} // Always read-only to preserve uniqueness logic
                                                className={`w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-sm font-mono font-bold uppercase cursor-not-allowed select-none`}
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Branch (Optional)</label>
                                        <select
                                            value={deptForm.branch_id}
                                            onChange={(e) => setDeptForm(prev => ({ ...prev, branch_id: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Parent Department (Optional)</label>
                                        <select
                                            value={deptForm.parent_department_id}
                                            onChange={(e) => setDeptForm(prev => ({ ...prev, parent_department_id: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="">No Parent (Top Level)</option>
                                            {departments.filter(d => d.id !== editingDeptId).map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
                                        <textarea
                                            placeholder="Brief description of this department's responsibilities..."
                                            value={deptForm.description}
                                            onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={saving || (!editingDeptId && limits.maxDepartments > 0 && departments.length >= limits.maxDepartments)}
                                        className={`flex-1 md:flex-initial md:px-8 ${editingDeptId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : (limits.maxDepartments > 0 && departments.length >= limits.maxDepartments ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200')} text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50`}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingDeptId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                        {saving ? "Processing..." : (editingDeptId ? "Update Department" : (limits.maxDepartments > 0 && departments.length >= limits.maxDepartments ? "Limit Reached" : "Create Department"))}
                                    </button>
                                    {(!editingDeptId && limits.maxDepartments > 0 && departments.length >= limits.maxDepartments) && (
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Upgrade plan to add more departments
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        {editingDeptId ? "Cancel" : "Clear"}
                                    </button>
                                </div>
                            </form>

                            {/* Department List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-violet-600" />
                                    Existing Departments ({departments.length})
                                </h3>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                ) : departments.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-500">No departments created yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Use the form above to create your first department</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {departments.map((dept) => (
                                            <div key={dept.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all group relative">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">{dept.name}</h4>
                                                        <p className="text-xs font-mono font-bold text-violet-600 mt-1">
                                                            {dept.department_code || dept.code}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => startEditDept(dept)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Department"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingItem({ id: dept.id, type: 'DEPT', name: dept.name })}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Delete Department"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {dept.description && (
                                                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{dept.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    {dept.branch_id && (
                                                        <span className="flex items-center gap-1">
                                                            <Building className="w-3 h-3" />
                                                            Branch Specific
                                                        </span>
                                                    )}
                                                    <span className="text-slate-300">•</span>
                                                    <span>ID: #{dept.id}</span>
                                                </div>
                                                {dept.is_active && (
                                                    <span className="absolute bottom-4 right-4 inline-flex w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. DESIGNATIONS TAB */}
                    {activeTab === "DESIGNATIONS" && (
                        <div className="p-4 md:p-8">
                            {/* Usage Monitor */}
                            <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <Users2 className="w-4 h-4 text-violet-600" />
                                        Designation Utilization
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium">Monitoring professional role limits.</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-slate-900">{designations.length}</span>
                                        <span className="text-slate-300 text-lg">/</span>
                                        <span className="text-slate-400 font-bold">{limits.maxDesignations === 0 ? '∞' : limits.maxDesignations}</span>
                                    </div>
                                    <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${limits.maxDesignations > 0 && (designations.length / limits.maxDesignations) > 0.9 ? 'bg-rose-500' : 'bg-violet-600'
                                                }`}
                                            style={{ width: `${limits.maxDesignations === 0 ? 10 : Math.min(100, (designations.length / limits.maxDesignations) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Create Form */}
                            <form onSubmit={handleSaveDesig} className={`bg-gradient-to-br ${editingDesigId ? 'from-amber-50 to-orange-50 border-amber-200' : 'from-violet-50 to-purple-50 border-violet-100'} rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border transition-all`}>
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <div className={`w-10 h-10 ${editingDesigId ? 'bg-amber-500' : 'bg-violet-600'} text-white rounded-xl flex items-center justify-center`}>
                                        {editingDesigId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-slate-900">
                                            {editingDesigId ? "Edit Designation" : "Add New Designation"}
                                        </h3>
                                        <p className="text-xs text-slate-600">
                                            {editingDesigId ? "Update existing designation details" : "Create a new job title or position"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Designation Title <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Senior Software Engineer"
                                            value={desigForm.title}
                                            onChange={(e) => handleDesigTitleChange(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                            <span>Designation Code</span>
                                            {!editingDesigId && (
                                                <span className="text-[10px] text-violet-600 font-bold bg-violet-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Zap className="w-3 h-3" /> AUTO
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={desigForm.code}
                                                readOnly={true}
                                                className={`w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-sm font-mono font-bold uppercase cursor-not-allowed select-none`}
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Level <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            placeholder="1"
                                            value={desigForm.level}
                                            onChange={(e) => setDesigForm(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                            required
                                        />
                                        <p className="text-xs text-slate-500">Hierarchy level (1-10, higher = senior)</p>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
                                        <textarea
                                            placeholder="Brief description of this role's responsibilities and requirements..."
                                            value={desigForm.description}
                                            onChange={(e) => setDesigForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={saving || (!editingDesigId && limits.maxDesignations > 0 && designations.length >= limits.maxDesignations)}
                                        className={`flex-1 md:flex-initial md:px-8 ${editingDesigId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : (limits.maxDesignations > 0 && designations.length >= limits.maxDesignations ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200')} text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50`}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingDesigId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                        {saving ? "Processing..." : (editingDesigId ? "Update Designation" : (limits.maxDesignations > 0 && designations.length >= limits.maxDesignations ? "Limit Reached" : "Create Designation"))}
                                    </button>
                                    {(!editingDesigId && limits.maxDesignations > 0 && designations.length >= limits.maxDesignations) && (
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Upgrade plan to add more designations
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        {editingDesigId ? "Cancel" : "Clear"}
                                    </button>
                                </div>
                            </form>

                            {/* Designation List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Users2 className="w-4 h-4 text-violet-600" />
                                    Existing Designations ({designations.length})
                                </h3>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                                    </div>
                                ) : designations.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <Users2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-500">No designations created yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Use the form above to create your first designation</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {designations.map((desig) => (
                                            <div key={desig.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all relative">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">{desig.title}</h4>
                                                        <p className="text-xs font-mono font-bold text-violet-600 mt-1">
                                                            {desig.designation_code || desig.code}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => startEditDesig(desig)}
                                                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                            title="Edit Designation"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingItem({ id: desig.id, type: 'DESIG', name: desig.title })}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Delete Designation"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {desig.description && (
                                                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{desig.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" />
                                                        Level {desig.level}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span>ID: #{desig.id}</span>
                                                </div>
                                                {desig.is_active && (
                                                    <span className="absolute bottom-4 right-4 inline-flex w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. SUBSCRIPTION TAB */}
                    {activeTab === "SUBSCRIPTION" && (
                        <div className="p-4 md:p-8">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mb-6">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <Crown className="w-10 h-10 md:w-12 md:h-12 text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                            <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Active Plan
                                            </span>
                                            {company?.is_active && (
                                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                    Running
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                                            {company?.subscription_plan || 'TRIAL PLAN'}
                                        </h2>
                                        <p className="text-sm md:text-base text-slate-400 max-w-xl">
                                            Your organization is currently operating on the {company?.subscription_plan?.toLowerCase()} tier.
                                            This plan includes access to core modules and {(Array.isArray(company?.enabled_modules) ? company.enabled_modules : JSON.parse(company?.enabled_modules || '[]')).length} add-on features.
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right w-full md:w-auto">
                                        <div className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Validity Period</div>
                                        <div className="text-lg md:text-xl font-black">
                                            {company?.subscription_start_date ? new Date(company.subscription_start_date).toLocaleDateString() : 'N/A'}
                                            <span className="text-slate-500 mx-2">—</span>
                                            {company?.subscription_end_date ? new Date(company.subscription_end_date).toLocaleDateString() : 'Ongoing'}
                                        </div>
                                        <div className="mt-4 flex flex-col md:flex-row gap-2">
                                            <button className="w-full md:w-auto px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors">
                                                Plan Details
                                            </button>
                                            <Link href="/ems/tenant-admin/subscription">
                                                <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    Manage Plan
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:p-6 rounded-2xl border border-slate-100 bg-slate-50">
                                <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4 md:mb-6">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    Active Modules
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const raw = company?.enabled_modules;
                                        let modules: string[] = [];
                                        try {
                                            modules = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
                                        } catch (e) {
                                            console.error("Failed to parse modules:", e);
                                        }

                                        if (modules.length === 0) return <p className="text-sm text-slate-400 italic">No modules active</p>;

                                        const niceNames: any = {
                                            'CORE': 'Core Management',
                                            'EMS': 'EMS Core',
                                            'ATTENDANCE': 'Attendance Tracking',
                                            
                                            
                                            'LMS': 'Learning Platform',
                                            
                                            'INVENTORY': 'Inventory Sync'
                                        };

                                        return modules.map((mod: string) => (
                                            <div key={mod} className="px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                {niceNames[mod] || mod}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            <div className="p-4 md:p-6 rounded-2xl border border-slate-100 bg-slate-50">
                                <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4 md:mb-6">
                                    <LayoutGrid className="w-5 h-5 text-blue-500" />
                                    Resource Allocation
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Max Users', val: company?.max_users || limits.maxUsers, icon: Users2 },
                                        { label: 'Max Branches', val: company?.max_branches || limits.maxBranches, icon: Building },
                                        { label: 'Max Depts', val: company?.max_departments || limits.maxDepartments, icon: LayoutGrid },
                                        { label: 'Max Desigs', val: company?.max_designations || limits.maxDesignations, icon: Briefcase },
                                    ].map((item, i) => (
                                        <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <item.icon className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{item.val === 0 ? '∞' : item.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* 6. BRANDING TAB */}
                {activeTab === "BRANDING" && (
                    <div className="p-4 md:p-8">
                        <form onSubmit={handleSaveBranding} className="max-w-4xl mx-auto">
                            <FormSection
                                title="Visual Identity"
                                description="Update your company's logo and favicon"
                                icon={Palette}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ImageUpload
                                        label="Company Logo"
                                        value={brandingForm.logo_url}
                                        onChange={(url) => setBrandingForm(prev => ({ ...prev, logo_url: url }))}
                                    />
                                    <ImageUpload
                                        label="Favicon"
                                        value={brandingForm.favicon_url}
                                        onChange={(url) => setBrandingForm(prev => ({ ...prev, favicon_url: url }))}
                                    />
                                </div>
                            </FormSection>

                            <FormSection
                                title="Theme Colors"
                                description="Customize your platform's color scheme"
                                icon={Store}
                                className="mt-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">Primary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                                                value={brandingForm.primary_color}
                                                onChange={(e) => setBrandingForm(prev => ({ ...prev, primary_color: e.target.value }))}
                                            />
                                            <input
                                                type="text"
                                                value={brandingForm.primary_color}
                                                onChange={(e) => setBrandingForm(prev => ({ ...prev, primary_color: e.target.value }))}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-violet-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">Secondary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                                                value={brandingForm.secondary_color}
                                                onChange={(e) => setBrandingForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                                            />
                                            <input
                                                type="text"
                                                value={brandingForm.secondary_color}
                                                onChange={(e) => setBrandingForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-violet-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">Accent Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                                                value={brandingForm.accent_color}
                                                onChange={(e) => setBrandingForm(prev => ({ ...prev, accent_color: e.target.value }))}
                                            />
                                            <input
                                                type="text"
                                                value={brandingForm.accent_color}
                                                onChange={(e) => setBrandingForm(prev => ({ ...prev, accent_color: e.target.value }))}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-violet-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="mt-8 p-6 rounded-2xl border border-slate-100 bg-slate-50">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Live Preview</h4>
                                    <div className="flex gap-4">
                                        {/* Sidebar Preview */}
                                        <div
                                            className="w-48 h-32 rounded-xl shadow-lg flex flex-col p-3 relative overflow-hidden"
                                            style={{ background: `linear-gradient(to bottom, ${brandingForm.primary_color}, ${brandingForm.secondary_color})` }}
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                {brandingForm.logo_url ? (
                                                    <img src={brandingForm.logo_url} className="w-6 h-6 object-contain bg-white/20 rounded p-0.5" />
                                                ) : (
                                                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white text-[10px] font-bold">D</div>
                                                )}
                                                <div className="h-2 w-20 bg-white/20 rounded"></div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="h-1.5 w-full bg-white/10 rounded"></div>
                                                <div className="h-1.5 w-full bg-white/10 rounded"></div>
                                                <div className="h-1.5 w-3/4 bg-white/30 rounded"></div>
                                            </div>
                                        </div>

                                        {/* Button Preview */}
                                        <div className="flex items-center justify-center flex-1 bg-white rounded-xl border border-slate-200">
                                            <button
                                                className="px-4 py-2 rounded-lg text-white font-bold text-sm shadow-lg transition-transform hover:scale-105"
                                                style={{ backgroundColor: brandingForm.accent_color }}
                                            >
                                                Accent Button
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </FormSection>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold uppercase text-sm tracking-wide shadow-lg shadow-violet-200 hover:bg-violet-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? "Saving Changes..." : "Save Branding"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {/* Delete Confirmation Modal */}
                {deletingItem && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Delete {deletingItem.type === 'DEPT' ? 'Department' : 'Designation'}</h3>
                                    <p className="text-xs text-slate-500">This action will soft-delete the record</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <p className="text-sm text-amber-900 font-medium">
                                    Are you sure you want to delete <strong className="text-neutral-900">{deletingItem.name}</strong>?
                                    This might affect employees currently assigned to this {deletingItem.type === 'DEPT' ? 'department' : 'designation'}.
                                </p>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-semibold text-slate-600">
                                    Reason for Deletion <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="e.g., Department restructuring, Role obsolete..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                                    rows={3}
                                    required
                                />
                                <p className="text-xs text-slate-500">
                                    Deleted by: <strong className="text-slate-700">{user?.email}</strong>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeletingItem(null);
                                        setDeleteReason("");
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading || !deleteReason.trim()}
                                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Confirm Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
}

function FormSection({ title, description, icon: Icon, children, className = "" }: any) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 p-6 md:p-8 ${className}`}>
            <div className="flex items-start gap-4 mb-8">
                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}
