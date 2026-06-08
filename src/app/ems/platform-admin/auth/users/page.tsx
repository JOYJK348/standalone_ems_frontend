"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import {
    Users,
    Plus,
    ArrowLeft,
    ShieldCheck,
    Search,
    Trash2,
    Eye,
    Power,
    AlertTriangle,
    X,
    Loader2,
    Mail,
    CheckCircle2,
    XCircle,
    Crown
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UserData {
    id: string;
    email: string;
    display_name: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    level: number;
    role_name: string;
    updated_at: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await platformService.getUsers();
            setUsers(data || []);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleStatus = async (user: UserData) => {
        try {
            const action = user.is_active ? 'Deactivating' : 'Activating';
            toast.loading(`${action} user...`, { id: 'toggle-status' });

            await platformService.updateUser(user.id, { is_active: !user.is_active });
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`, { id: 'toggle-status' });
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status", { id: 'toggle-status' });
        }
    };

    const openDeleteModal = (user: UserData) => {
        setSelectedUser(user);
        setDeleteReason("");
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedUser || !deleteReason.trim()) {
            toast.error("Please provide a reason for deletion");
            return;
        }

        console.log('🛑 Frontend: handleDelete called for user', selectedUser.id);

        try {
            setDeleting(true);
            await platformService.deleteUser(selectedUser.id, deleteReason);
            console.log('✅ Frontend: deleteUser success');
            toast.success("User archived successfully");
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            setDeleteReason("");
            await loadData();
        } catch (error: any) {
            console.error('❌ Frontend: deleteUser failed', error);
            const errorMessage = error.response?.data?.error?.message || error.message || "Failed to archive user";
            toast.error(`Error: ${errorMessage}. Check console for details.`);
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadge = (level: number) => {
        if (level >= 5) return { label: "Platform Admin", color: "bg-rose-100 text-rose-700 border-rose-200" };
        if (level >= 4) return { label: "Company Admin", color: "bg-blue-100 text-blue-700 border-blue-200" };
        if (level >= 2) return { label: "Product Admin", color: "bg-violet-100 text-violet-700 border-violet-200" };
        if (level >= 1) return { label: "Branch Admin", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
        return { label: "User", color: "bg-slate-100 text-slate-700 border-slate-200" };
    };

    const filtered = users.filter(u => {
        const matchesSearch =
            (u.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (u.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (u.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && u.is_active) ||
            (statusFilter === "INACTIVE" && !u.is_active);
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        admins: users.filter(u => (u.level || 0) >= 4).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/ems/platform-admin/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-2">
                                <Users className="w-3.5 h-3.5 text-violet-600" />
                                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Identity Management</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">User Management</h1>
                            <p className="text-sm text-slate-500 font-medium">Global user directory and access control</p>
                        </div>
                    </div>

                    <button className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Create User</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Total Users</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Active Users</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-rose-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.inactive}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Inactive Users</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-violet-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.admins}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Administrators</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status as any)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === status
                                        ? status === "ACTIVE"
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                            : status === "INACTIVE"
                                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                                                : "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading users...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map((user) => {
                                            const roleBadge = getRoleBadge(user.level || 0);
                                            return (
                                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold">
                                                                {user.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">{user.display_name || "System User"}</p>
                                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {user.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${roleBadge.color}`}>
                                                            <ShieldCheck className="w-3 h-3" />
                                                            {roleBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {user.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-500">
                                                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-[#0066FF] transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleStatus(user)}
                                                                className={`p-2 rounded-lg transition-all ${user.is_active
                                                                    ? 'hover:bg-amber-50 text-slate-600 hover:text-amber-600'
                                                                    : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-600'
                                                                    }`}
                                                                title={user.is_active ? 'Deactivate' : 'Activate'}
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-600 hover:text-rose-600 transition-all"
                                                                title="Archive User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filtered.map((user) => {
                                const roleBadge = getRoleBadge(user.level || 0);
                                return (
                                    <div key={user.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {user.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{user.display_name || "System User"}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {user.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${roleBadge.color}`}>
                                                <ShieldCheck className="w-3 h-3" />
                                                {roleBadge.label}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${user.is_active
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    }`}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filtered.length === 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No users found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Archive User</h3>
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
                                    You are about to archive <strong>{selectedUser.display_name || selectedUser.email}</strong>.
                                    This will deactivate the user and revoke all access.
                                </p>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Reason for Archival <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Enter the reason for archiving this user..."
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
                                            Archive User
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
