"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    Plus,
    Search,
    Eye,
    Power,
    Loader2,
    MapPin,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    BarChart3,
    Trash2,
    AlertTriangle,
    X,
    LayoutDashboard
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import Link from "next/link";
import { toast } from "sonner";

interface CompanyDetail {
    id: string;
    name: string;
    code: string;
    status: "ACTIVE" | "SUSPENDED";
    branches: number;
    employees: number;
    ownerName: string;
    plan: string;
}

export default function PlatformCompanies() {
    const [companies, setCompanies] = useState<CompanyDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const [companiesData, branchesData, employeesData] = await Promise.all([
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getEmployees()
            ]);

            const mapped: CompanyDetail[] = companiesData.map((c: any) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                status: c.is_active === false ? "SUSPENDED" : "ACTIVE",
                branches: branchesData.filter((b: any) => b.company_id?.toString() === c.id?.toString()).length,
                employees: employeesData.filter((e: any) => e.company_id?.toString() === c.id?.toString()).length,
                ownerName: "Admin User",
                plan: c.subscription_plan || "TRIAL"
            }));
            setCompanies(mapped);
        } catch (error) {
            toast.error("Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, current: string) => {
        try {
            const isSuspended = current === 'SUSPENDED';
            const action = isSuspended ? 'Activating' : 'Suspending';

            toast.loading(`${action} company...`, { id: 'toggle-status' });
            await platformService.toggleCompanyStatus(id, isSuspended);
            toast.success(`Company ${isSuspended ? 'activated' : 'suspended'} successfully`, { id: 'toggle-status' });
            await loadCompanies();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status", { id: 'toggle-status' });
        }
    };

    const openDeleteModal = (company: CompanyDetail) => {
        setSelectedCompany(company);
        setDeleteReason("");
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCompany || !deleteReason.trim()) {
            toast.error("Please provide a reason for deletion");
            return;
        }

        try {
            setDeleting(true);
            await platformService.deleteCompany(selectedCompany.id, deleteReason);
            toast.success("Company archived successfully");
            setIsDeleteModalOpen(false);
            setSelectedCompany(null);
            setDeleteReason("");
            await loadCompanies();
        } catch (error: any) {
            toast.error(error.message || "Failed to archive company");
        } finally {
            setDeleting(false);
        }
    };

    const filtered = companies.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: companies.length,
        active: companies.filter(c => c.status === "ACTIVE").length,
        suspended: companies.filter(c => c.status === "SUSPENDED").length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Building2 className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Company Management</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Companies Directory
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Manage all registered organizations on the platform
                        </p>
                    </div>
                    <Link href="/ems/platform-admin/core/companies/create-with-admin">
                        <button className="w-full md:w-auto bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span>Add New Company</span>
                        </button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Total Companies</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Active Companies</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.suspended}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Suspended</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by company name or code..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter("ALL")}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "ALL"
                                    ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter("ACTIVE")}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "ACTIVE"
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setStatusFilter("SUSPENDED")}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "SUSPENDED"
                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                Suspended
                            </button>
                        </div>
                    </div>
                </div>

                {/* Companies List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading companies...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Branches</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Users</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map((company) => (
                                            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-bold">
                                                            {company.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{company.name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{company.code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${company.plan === 'ENTERPRISE' ? 'bg-violet-100 text-violet-700' :
                                                        company.plan === 'PREMIUM' ? 'bg-blue-100 text-blue-700' :
                                                            company.plan === 'STANDARD' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {company.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-sm font-semibold text-slate-900">{company.branches}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-sm font-semibold text-slate-900">{company.employees}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${company.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {company.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                platformService.switchCompany(company.id);
                                                                toast.success(`Entering ${company.name} workspace...`);
                                                                // Redirect to workspace dashboard
                                                                window.location.href = '/workspace/dashboard';
                                                            }}
                                                            className="p-2 hover:bg-emerald-50 rounded-lg text-slate-600 hover:text-emerald-600 transition-all"
                                                            title="Enter Workspace"
                                                        >
                                                            <LayoutDashboard className="w-4 h-4" />
                                                        </button>
                                                        <Link href={`/ems/platform-admin/core/companies/${company.id}`}>
                                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-[#0066FF] transition-all" title="View Details">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleStatus(company.id, company.status)}
                                                            className={`p-2 rounded-lg transition-all ${company.status === 'ACTIVE'
                                                                ? 'hover:bg-amber-50 text-slate-600 hover:text-amber-600'
                                                                : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-600'
                                                                }`}
                                                            title={company.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                        >
                                                            <Power className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(company)}
                                                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-600 hover:text-rose-600 transition-all"
                                                            title="Archive Company"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filtered.map((company) => (
                                <div key={company.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-bold text-lg">
                                                {company.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{company.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{company.code}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${company.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {company.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Plan</p>
                                            <p className="text-sm font-bold text-slate-900">{company.plan}</p>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Branches</p>
                                            <p className="text-sm font-bold text-slate-900">{company.branches}</p>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Users</p>
                                            <p className="text-sm font-bold text-slate-900">{company.employees}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/ems/platform-admin/core/companies/${company.id}`} className="flex-1">
                                            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                platformService.switchCompany(company.id);
                                                toast.success(`Entering ${company.name} workspace...`);
                                                window.location.href = '/workspace/dashboard';
                                            }}
                                            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all flex items-center justify-center"
                                            title="Enter Workspace"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(company.id, company.status)}
                                            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${company.status === 'ACTIVE'
                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                }`}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(company)}
                                            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No companies found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Archive Company</h3>
                                    <p className="text-sm text-slate-500">This action can be restored later</p>
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
                                    You are about to archive <strong>{selectedCompany.name}</strong> ({selectedCompany.code}).
                                    This will deactivate all associated users and data.
                                </p>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Reason for Archival <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Enter the reason for archiving this company..."
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
                                            Archiving...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Archive Company
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
