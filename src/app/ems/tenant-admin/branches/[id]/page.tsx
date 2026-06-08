"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Building2,
    MapPin,
    Save,
    ArrowLeft,
    Loader2,
    Mail,
    Phone,
    Trash2,
    ShieldCheck,
    Search,
    Users,
    UserPlus,
    XCircle,
    Building,
    Check,
    UserCircle,
    Layers,
    Clock,
    Globe,
    ShieldAlert,
    X,
    AlertTriangle,
    FileSearch,
    UserCheck,
    History
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

export default function EditBranchPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [deletionInfo, setDeletionInfo] = useState<{
        deleted_by_name: string;
        deleted_by_email: string;
        deleted_at: string;
        delete_reason: string;
    } | null>(null);

    const [formData, setFormData] = useState<{
        name: string,
        code: string,
        branch_type: string,
        is_head_office: boolean,
        email: string,
        phone: string,
        address_line1: string,
        address_line2?: string,
        city: string,
        state: string,
        country: string,
        postal_code: string,
        is_active: boolean,
        admin_permissions: string[]
    }>({
        name: "",
        code: "",
        branch_type: "BRANCH",
        is_head_office: false,
        email: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        country: "India",
        postal_code: "",
        is_active: true,
        admin_permissions: []
    });

    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState("");

    useEffect(() => {
        if (params.id) {
            loadBranch(params.id as string);
            loadEmployees();
        }
    }, [params.id]);

    const loadBranch = async (id: string) => {
        try {
            setLoading(true);
            const data = await platformService.getBranch(id);
            setFormData({
                name: data.name || "",
                code: data.code || "",
                branch_type: data.branch_type || "BRANCH",
                is_head_office: data.is_head_office || false,
                email: data.email || "",
                phone: data.phone || "",
                address_line1: data.address_line1 || "",
                address_line2: data.address_line2 || "",
                city: data.city || "",
                state: data.state || "",
                country: data.country || "India",
                postal_code: data.postal_code || "",
                is_active: data.is_active ?? true,
                admin_permissions: data.admin_permissions || []
            });
            if (data.deletion_info) {
                setDeletionInfo(data.deletion_info);
            }
        } catch (error) {
            toast.error("Failed to load branch details");
            router.push("/ems/tenant-admin/branches");
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        try {
            const data = await platformService.getEmployees();
            setAllEmployees(data || []);
        } catch (error) {
            console.error("Failed to load employees", error);
        }
    };

    const handleAssignEmployee = async (employeeId: string) => {
        try {
            const bId = !isNaN(Number(params.id)) ? Number(params.id) : params.id;
            await platformService.updateEmployee(employeeId, { branch_id: bId });
            toast.success("Employee assigned to branch");
            loadEmployees();
        } catch (error) {
            toast.error("Assignment failed");
        }
    };

    const handleUnassignEmployee = async (employeeId: string) => {
        try {
            await platformService.updateEmployee(employeeId, { branch_id: null });
            toast.success("Employee unassigned");
            loadEmployees();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await platformService.updateBranch(params.id as string, formData);
            toast.success("Branch configuration updated");
            router.push("/ems/tenant-admin/branches");
        } catch (error: any) {
            toast.error(error.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const executeDecommission = async () => {
        if (!deleteReason.trim()) {
            toast.error("Reason is strictly required for decommissioning protocol");
            return;
        }

        try {
            setSaving(true);
            await platformService.deleteBranch(params.id as string, deleteReason);
            toast.success("Unit decommissioned successfully");
            router.push("/ems/tenant-admin/branches");
        } catch (error: any) {
            toast.error(error.message || "Decommission failed");
        } finally {
            setSaving(false);
            setShowDeleteModal(false);
        }
    };

    const branchEmployees = allEmployees.filter(e => String(e.branch_id) === String(params.id));
    const otherEmployees = allEmployees.filter(e =>
        String(e.branch_id) !== String(params.id) &&
        (e.first_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            e.last_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            e.employee_code?.toLowerCase().includes(employeeSearch.toLowerCase()))
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-12 px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <Link
                            href="/ems/tenant-admin/branches"
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 shadow-sm transition-all mt-1"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Edit Branch</h1>
                                <span className={`px-2 py-1 ${formData.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'} text-[10px] font-bold uppercase tracking-wider rounded-md border flex items-center gap-1.5`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${formData.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                    {formData.is_active ? 'Operational' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Global configuration for <span className="text-blue-600 font-bold">{formData.name}</span>
                            </p>
                        </div>
                    </div>

                    {!formData.is_active && deletionInfo ? (
                        <div className="flex items-center gap-3 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm tracking-tight shadow-lg shadow-rose-200">
                            <ShieldAlert className="w-5 h-5" />
                            Unit Retired
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold text-sm tracking-tight hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Decommission Unit
                        </button>
                    )}
                </div>

                {/* Decommission Report (If Archived) */}
                {deletionInfo && (
                    <div className="mb-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] overflow-hidden">
                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-rose-100">
                            <div className="p-8 flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-widest">Decommission Timeline</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="w-4 h-4 text-rose-500" />
                                        <p className="text-sm font-bold text-rose-800">
                                            Executed by: <span className="text-rose-600">{deletionInfo.deleted_by_name}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-rose-500" />
                                        <p className="text-sm font-bold text-rose-800">
                                            Timestamp: <span className="text-rose-600">{new Date(deletionInfo.deleted_at).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 flex-[1.5]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                        <FileSearch className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-widest">Formal Removal Reason</h4>
                                </div>
                                <div className="bg-white/60 p-5 rounded-2xl border border-rose-100 italic">
                                    <p className="text-sm font-bold text-rose-800 leading-relaxed">
                                        "{deletionInfo.delete_reason}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Section 1: Basic Identity */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-slate-900">Basic Identity</h2>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unique Code</label>
                                    <input
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 uppercase transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Category</label>
                                    <select
                                        name="branch_type"
                                        value={formData.branch_type}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="BRANCH">Regular Branch</option>
                                        <option value="HEAD_OFFICE">Headquarters</option>
                                        <option value="WAREHOUSE">Warehouse</option>
                                    </select>
                                </div>
                                <div className="flex flex-col justify-end pb-1">
                                    <label className="relative inline-flex items-center cursor-pointer p-2 bg-slate-50 border border-slate-200 rounded-xl transition-all hover:bg-slate-100">
                                        <input
                                            type="checkbox"
                                            name="is_head_office"
                                            checked={formData.is_head_office}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[12px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-bold text-slate-700">Set as Head Office</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Employee Deployment */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h2 className="font-bold text-slate-900">Employee Deployment</h2>
                                </div>
                                <span className="bg-emerald-50 px-3 py-1 rounded-full text-[11px] font-black text-emerald-700 uppercase tracking-wide border border-emerald-100">
                                    {branchEmployees.length} Staff Assigned
                                </span>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Current Members */}
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Assigned to this Unit</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {branchEmployees.map(emp => (
                                            <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:border-blue-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-600 shadow-sm overflow-hidden">
                                                        {emp.profile_picture ? (
                                                            <img src={emp.profile_picture} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{emp.first_name?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{emp.employee_code}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnassignEmployee(emp.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Unassign"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {branchEmployees.length === 0 && (
                                            <div className="col-span-full py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-slate-400">No organizational members assigned.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Assign Others */}
                                <div className="pt-8 border-t border-slate-50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Available for Deployment</h3>
                                        <div className="relative w-full md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or ID..."
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {otherEmployees.slice(0, 10).map(emp => (
                                            <div key={emp.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">
                                                        {emp.first_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{emp.employee_code}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAssignEmployee(emp.id)}
                                                    className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    title="Assign to Branch"
                                                >
                                                    <UserPlus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {otherEmployees.length === 0 && (
                                            <div className="col-span-full py-6 text-center">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No matching members found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Branch Governance (Access Control) */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-slate-900">Governance & Permissions</h2>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        id: 'ems',
                                        label: "EMS Operations",
                                        color: "text-emerald-600",
                                        items: [
                                            { id: 'ems.students', label: 'Student Records' },
                                            { id: 'ems.attendance', label: 'Attendance' },
                                            { id: 'ems.materials', label: 'Materials' }
                                        ]
                                    },
                                    {
                                        id: 'lms',
                                        label: "EMS Academics",
                                        color: "text-indigo-600",
                                        items: [
                                            { id: 'lms.courses', label: 'Course Ware' },
                                            { id: 'lms.live_classes', label: 'Remote Learning' },
                                            { id: 'lms.assessments', label: 'Evaluation Engine' }
                                        ]
                                    }
                                ].map((group) => (
                                    <div key={group.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition-colors group">
                                        <h6 className={`text-[10px] font-black uppercase tracking-widest ${group.color}`}>{group.label}</h6>
                                        <div className="space-y-3">
                                            {group.items.map((item) => (
                                                <label key={item.id} className="flex items-center gap-3 cursor-pointer select-none group/label">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.admin_permissions.includes(item.id)}
                                                            onChange={(e) => {
                                                                const newPerms = e.target.checked
                                                                    ? [...formData.admin_permissions, item.id]
                                                                    : formData.admin_permissions.filter(p => p !== item.id);
                                                                setFormData(prev => ({ ...prev, admin_permissions: newPerms }));
                                                            }}
                                                            className="w-5 h-5 border-2 border-slate-300 rounded-lg checked:bg-blue-600 checked:border-blue-600 focus:ring-0 transition-all cursor-pointer appearance-none"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none opacity-0 group-has-[:checked]:opacity-100">
                                                            <Check className="w-3 h-3 stroke-[4]" />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 group-hover/label:text-slate-900 transition-colors uppercase tracking-tight">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Secondary Info & Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Section 4: Contact & Location */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-slate-900">Reach & Location</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Street Address</label>
                                        <input
                                            name="address_line1"
                                            value={formData.address_line1}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postal Code</label>
                                            <input
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                                        <input
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Access</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Save Action */}
                        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-slate-200 border border-slate-800 space-y-6">
                            <div>
                                <h3 className="text-lg font-black tracking-tight mb-2">Unit Governance</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Synchronizing updates will affect all connected modules and employee scopes associated with this branch.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Cloud sync ready</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Audit logs enabled</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/40 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                Sync Configuration
                            </button>
                        </div>
                    </div>
                </form>

                {/* Modern Decommission Protocol Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in transition-all">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col items-center text-center">
                            <div className="bg-rose-600 w-full p-12 text-white flex flex-col items-center">
                                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
                                    <ShieldAlert size={40} />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight">Decommission Unit</h3>
                                <p className="text-rose-100 mt-2 font-medium italic">Protocol execution ID: {params.id}</p>
                            </div>

                            <div className="p-12 w-full space-y-8 text-left">
                                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-rose-900 uppercase tracking-tight">Critical Warning</p>
                                            <p className="text-[11px] font-bold text-rose-700 leading-relaxed">
                                                Decommissioning {formData.name} will restrict access to all branch-specific operations and mark the unit as archived. This action is recorded in the platform audit trail.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Formal Reason for Removal</label>
                                    <textarea
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        placeholder="e.g. Regional consolidation, Operational shutdown, Lease expiration..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={() => { setShowDeleteModal(false); setDeleteReason(""); }}
                                        className="py-5 px-6 bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                        disabled={saving}
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={executeDecommission}
                                        disabled={saving || !deleteReason.trim()}
                                        className="py-5 px-6 bg-rose-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-rose-200 transition-all hover:bg-rose-500 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                        Execute
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
