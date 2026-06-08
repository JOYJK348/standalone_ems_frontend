"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    MapPin,
    Plus,
    Search,
    Users,
    Mail,
    Phone,
    Loader2,
    Eye,
    MoreVertical,
    TrendingUp,
    Building,
    Crown
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import Link from "next/link";
import { toast } from "sonner";

interface Branch {
    id: string;
    name: string;
    code: string;
    branch_type: string;
    city: string;
    state: string;
    email?: string;
    phone?: string;
    is_active: boolean;
    is_head_office: boolean;
    totalEmployees?: number;
}

export default function WorkspaceBranches() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const [branchesData, employeesData] = await Promise.all([
                platformService.getBranches(),
                platformService.getEmployees()
            ]);

            const enhanced = (branchesData || []).map((b: any) => {
                const count = (employeesData || []).filter((e: any) => e.branch_id === b.id).length;
                return {
                    ...b,
                    totalEmployees: count
                };
            });
            setBranches(enhanced);
        } catch (error) {
            toast.error("Failed to load branches");
        } finally {
            setLoading(false);
        }
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEmployees = branches.reduce((sum, b) => sum + (b.totalEmployees || 0), 0);

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-12 px-4 md:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Branches</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Manage all your business locations</p>
                    </div>
                    <Link
                        href="/ems/tenant-admin/branches/new"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        Add Branch
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Branches</p>
                                <p className="text-2xl font-black text-slate-900">{branches.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Employees</p>
                                <p className="text-2xl font-black text-slate-900">{totalEmployees}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                                <Crown className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Head Office</p>
                                <p className="text-2xl font-black text-slate-900">{branches.filter(b => b.is_head_office).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search branches by name, code, or city..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Branches List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <p className="text-sm font-semibold text-slate-500">Loading branches...</p>
                    </div>
                ) : filteredBranches.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No branches found</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {searchTerm ? "Try adjusting your search" : "Get started by adding your first branch"}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/ems/tenant-admin/branches/new"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Add First Branch
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBranches.map((branch) => (
                            <div key={branch.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                                {/* Header */}
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 ${branch.is_head_office ? 'bg-gradient-to-br from-violet-600 to-violet-700' : 'bg-gradient-to-br from-blue-600 to-blue-700'} text-white rounded-xl flex items-center justify-center shadow-lg`}>
                                            {branch.is_head_office ? (
                                                <Crown className="w-7 h-7" />
                                            ) : (
                                                <Building className="w-7 h-7" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {branch.is_head_office && (
                                                <span className="px-2 py-1 bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-violet-200">
                                                    HQ
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 ${branch.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'} text-[10px] font-bold uppercase tracking-wider rounded-md border flex items-center gap-1.5`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${branch.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {branch.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{branch.name}</h3>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Code: {branch.code}</p>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">{branch.city}, {branch.state}</span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-slate-600">Employees</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{branch.totalEmployees || 0}</span>
                                    </div>
                                    {branch.email && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-medium truncate">{branch.email}</span>
                                        </div>
                                    )}
                                    {branch.phone && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-medium">{branch.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-6 pt-0">
                                    <Link
                                        href={`/ems/tenant-admin/branches/${branch.id}`}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
