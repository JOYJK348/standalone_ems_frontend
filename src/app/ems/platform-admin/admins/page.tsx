"use client";

import React, { useEffect, useState } from "react";
import {
    Users2,
    ShieldCheck,
    Loader2,
    Building,
    UserCog,
    Search,
    Filter,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    Crown,
    Building2,
    Hash,
    User,
    Briefcase,
    Globe,
    Activity,
    Trash2,
    Power,
    AlertTriangle,
    X
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

interface AdminUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    user_roles?: any[];
    company?: any;
    branch?: any;
}

export default function PlatformAdminsOverview() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'ALL' | 'COMPANY' | 'BRANCH'>('ALL');

    const [companyAdmins, setCompanyAdmins] = useState<AdminUser[]>([]);
    const [branchAdmins, setBranchAdmins] = useState<AdminUser[]>([]);
    const [platformAdmins, setPlatformAdmins] = useState<AdminUser[]>([]);

    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    // Delete modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch all required data
            const [usersData, companiesData, branchesData] = await Promise.all([
                platformService.getUsers(),
                platformService.getCompanies(),
                platformService.getBranches()
            ]);

            setCompanies(companiesData);
            setBranches(branchesData);

            // Categorize admins by role level
            const companyAdminsList: AdminUser[] = [];
            const branchAdminsList: AdminUser[] = [];
            const platformAdminsList: AdminUser[] = [];

            usersData.forEach((user: any) => {
                const roleLevel = user.user_roles?.[0]?.roles?.level || 0;
                const roleName = user.user_roles?.[0]?.roles?.name || '';

                // Enrich user data with company and branch info
                const enrichedUser = {
                    ...user,
                    company: companiesData.find((c: any) => String(c.id) === String(user.user_roles?.[0]?.company_id)),
                    branch: branchesData.find((b: any) => String(b.id) === String(user.user_roles?.[0]?.branch_id))
                };

                if (roleLevel === 5) {
                    platformAdminsList.push(enrichedUser);
                } else if (roleLevel === 4 || roleName.toLowerCase().includes('company_admin')) {
                    companyAdminsList.push(enrichedUser);
                } else if (roleLevel === 1 || roleName.toLowerCase().includes('branch_admin')) {
                    branchAdminsList.push(enrichedUser);
                }
            });

            setCompanyAdmins(companyAdminsList);
            setBranchAdmins(branchAdminsList);
            setPlatformAdmins(platformAdminsList);

        } catch (error) {
            console.error("Admins data error", error);
            toast.error("Failed to sync admin metrics");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (admin: AdminUser) => {
        try {
            const action = admin.is_active ? 'Suspending' : 'Activating';
            toast.loading(`${action} admin privileges...`, { id: 'toggle-status' });

            await platformService.updateUser(admin.id, { is_active: !admin.is_active });

            toast.success(`Admin privileges ${admin.is_active ? 'revoked' : 'restored'} successfully`, { id: 'toggle-status' });
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status", { id: 'toggle-status' });
        }
    };

    const openDeleteModal = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setDeleteReason("");
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedAdmin || !deleteReason.trim()) {
            toast.error("Please provide a reason for removal");
            return;
        }

        try {
            setDeleting(true);
            await platformService.deleteUser(selectedAdmin.id, deleteReason);
            toast.success("Admin account archived successfully");
            setIsDeleteModalOpen(false);
            setSelectedAdmin(null);
            setDeleteReason("");
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to archive admin account");
        } finally {
            setDeleting(false);
        }
    };

    const stats = {
        platform: platformAdmins.length,
        company: companyAdmins.length,
        branch: branchAdmins.length,
        total: platformAdmins.length + companyAdmins.length + branchAdmins.length
    };

    // Filter admins based on search and active tab
    const getFilteredAdmins = () => {
        let admins: AdminUser[] = [];

        if (activeTab === 'COMPANY') {
            admins = companyAdmins;
        } else if (activeTab === 'BRANCH') {
            admins = branchAdmins;
        } else {
            admins = [...platformAdmins, ...companyAdmins, ...branchAdmins];
        }

        if (!searchTerm) return admins;

        return admins.filter(admin =>
            (admin.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (admin.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (admin.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (admin.company?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (admin.branch?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
    };

    const filteredAdmins = getFilteredAdmins();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Access Control</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            🛡️ Administrative Registry
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Privileged accounts with elevated system access
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Platform Admins", value: stats.platform, icon: Crown, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-50", textColor: "text-violet-600" },
                        { label: "Company Admins", value: stats.company, icon: Building2, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
                        { label: "Branch Admins", value: stats.branch, icon: Building, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
                        { label: "Total Admins", value: stats.total, icon: Activity, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50", textColor: "text-amber-600" },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'ALL', label: 'All Admins', count: stats.company + stats.branch + stats.platform },
                        { id: 'COMPANY', label: 'Company Level', count: stats.company },
                        { id: 'BRANCH', label: 'Branch Level', count: stats.branch }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 md:px-8 py-3 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                ? "bg-white text-[#0066FF] shadow-sm border border-slate-100"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.id ? 'bg-[#0066FF] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, company, or branch..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Admin Tables */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading administrative registry...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5" />
                                                    Admin Identity
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    Contact Details
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    Jurisdiction
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3.5 h-3.5" />
                                                    Unique Code
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAdmins.map((admin) => {
                                            const isCompanyAdmin = companyAdmins.some(ca => ca.id === admin.id);
                                            const roleLevel = admin.user_roles?.[0]?.roles?.level || 0;

                                            return (
                                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${isCompanyAdmin ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                                                                {(admin.first_name || 'U').charAt(0)}{(admin.last_name || 'N').charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 leading-tight">
                                                                    {admin.first_name || 'Unknown'} {admin.last_name || 'User'}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isCompanyAdmin ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                        {isCompanyAdmin ? 'Company Admin' : 'Branch Admin'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400">Level {roleLevel}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                                {admin.email}
                                                            </div>
                                                            {admin.phone && (
                                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                                    {admin.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {admin.company && (
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                                                    <span className="text-sm font-bold text-slate-800">{admin.company.name}</span>
                                                                </div>
                                                            )}
                                                            {admin.branch && (
                                                                <div className="flex items-center gap-2">
                                                                    <Building className="w-3.5 h-3.5 text-emerald-500" />
                                                                    <span className="text-xs text-slate-600">{admin.branch.name}</span>
                                                                </div>
                                                            )}
                                                            {!admin.company && !admin.branch && (
                                                                <span className="text-xs text-slate-400 italic">Global Access</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <code className="text-xs font-mono font-bold text-[#0066FF] bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit">
                                                                {String(admin.id || 'N/A').substring(0, 8).toUpperCase()}
                                                            </code>
                                                            <span className="text-[10px] text-slate-400">
                                                                Since {admin.created_at ? formatDate(admin.created_at) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${admin.is_active
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {admin.is_active ? 'Active' : 'Suspended'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => toggleStatus(admin)}
                                                                className={`p-2 rounded-lg transition-all ${admin.is_active
                                                                    ? 'hover:bg-amber-50 text-slate-600 hover:text-amber-600'
                                                                    : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-600'
                                                                    }`}
                                                                title={admin.is_active ? 'Suspend Admin' : 'Restore Admin'}
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(admin)}
                                                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-600 hover:text-rose-600 transition-all"
                                                                title="Revoke & Archive Admin"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredAdmins.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center text-slate-400">
                                                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                                    <p className="font-semibold">No administrators found</p>
                                                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredAdmins.map((admin) => {
                                const isCompanyAdmin = companyAdmins.some(ca => ca.id === admin.id);
                                const roleLevel = admin.user_roles?.[0]?.roles?.level || 0;

                                return (
                                    <div key={admin.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm ${isCompanyAdmin ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                                                    {(admin.first_name || 'U').charAt(0)}{(admin.last_name || 'N').charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                                        {admin.first_name || 'Unknown'} {admin.last_name || 'User'}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isCompanyAdmin ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {isCompanyAdmin ? 'Company' : 'Branch'} Admin
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold border ${admin.is_active
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                {admin.is_active ? 'Active' : 'Suspended'}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="text-slate-700 font-medium truncate">{admin.email}</span>
                                            </div>

                                            {admin.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span className="text-slate-700 font-medium">{admin.phone}</span>
                                                </div>
                                            )}

                                            {admin.company && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                                                    <span className="text-slate-800 font-bold">{admin.company.name}</span>
                                                </div>
                                            )}

                                            {admin.branch && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span className="text-slate-700 font-medium">{admin.branch.name}</span>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                                                    <code className="text-xs font-mono font-bold text-[#0066FF]">
                                                        {String(admin.id || 'N/A').substring(0, 8).toUpperCase()}
                                                    </code>
                                                </div>
                                                <span className="text-[10px] text-slate-400">
                                                    Since {admin.created_at ? formatDate(admin.created_at) : 'N/A'}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => toggleStatus(admin)}
                                                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${admin.is_active
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    <Power className="w-3.5 h-3.5" />
                                                    {admin.is_active ? 'Suspend' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(admin)}
                                                    className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Revoke
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredAdmins.length === 0 && (
                                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                    <p className="font-semibold text-slate-600">No administrators found</p>
                                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Security Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-900 text-sm md:text-base uppercase tracking-tight">Security Protocol</h4>
                        <p className="text-sm text-amber-800/80 font-medium mt-1 leading-normal">
                            This registry displays only users with elevated privileges (Level 1, 4, 5). Standard employees are excluded as they do not constitute administrative risk vectors. All admin actions are logged in the audit trail.
                        </p>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedAdmin && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Revoke Admin Access</h3>
                                    <p className="text-sm text-slate-500">Security event will be logged</p>
                                </div>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-slate-600">
                                    You are about to permanently revoke access for <strong>{selectedAdmin.first_name || 'Admin'} {selectedAdmin.last_name}</strong>.
                                    This action will de-escalate privileges and archive the account.
                                </p>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Revocation Reason <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Required for audit trail..."
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm transition-all"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting || !deleteReason.trim()}
                                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Revoking...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Confirm Revoke
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
