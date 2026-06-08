"use client";

import React, { useEffect, useState } from "react";
import {
    Users2,
    ShieldCheck,
    TrendingUp,
    Search,
    Filter,
    Loader2,
    Plus,
    Edit,
    Eye,
    Building2,
    MapPin,
    UserCheck,
    Briefcase,
    Power,
    Trash2,
    AlertTriangle,
    X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

export default function PlatformUsersOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        platform: 0,
        company: 0,
        branch: 0,
        employee: 0,
        total: 0
    });
    const [users, setUsers] = useState<any[]>([]);
    const [filterRole, setFilterRole] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // NEW: Create/Edit Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creationData, setCreationData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role_type: "5", // Default Platform Admin
        company_id: "" // For Company Admin
    });
    const [companies, setCompanies] = useState<any[]>([]); // For dropdown
    const [creating, setCreating] = useState(false);

    // Existing Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam) {
            setFilterRole(roleParam);
        }
        loadUserAnalytics();
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await platformService.getCompanies();
            setCompanies(data || []);
        } catch (e) {
            console.error("Failed to load companies", e);
        }
    };

    const loadUserAnalytics = async () => {
        try {
            setLoading(true);
            const usersData = await platformService.getUsers();
            setUsers(usersData);

            // Calculate Role Distribution
            const distribution = {
                platform: 0,
                company: 0,
                branch: 0,
                employee: 0,
                total: usersData.length
            };

            usersData.forEach((u: any) => {
                const level = u.user_roles?.[0]?.roles?.level || 0;
                if (level === 5) distribution.platform++;
                else if (level === 4) distribution.company++;
                else if (level === 1) distribution.branch++;
                else distribution.employee++;
            });

            setStats(distribution);
        } catch (error) {
            console.error("User overview error", error);
            toast.error("Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setCreationData({
            email: user.email || "",
            password: "", // Leave blank to keep unchanged
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role_type: user.user_roles?.[0]?.roles?.level?.toString() || "5",
            company_id: user.user_roles?.[0]?.company_id?.toString() || ""
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);

            // Basic Role Mapping (Should be dynamic)
            const roles = await platformService.getRoles();
            const targetRole = roles.find((r: any) => r.level === parseInt(creationData.role_type));

            if (!targetRole) {
                toast.error("Invalid Role Selection");
                return;
            }

            if (targetRole.level === 4 && !creationData.company_id) {
                toast.error("Company selection is required for Company Admins");
                return;
            }

            const payload: any = {
                first_name: creationData.first_name,
                last_name: creationData.last_name,
                role_id: targetRole.id,
                company_id: creationData.company_id ? parseInt(creationData.company_id) : null
            };

            // Password handling
            if (creationData.password) {
                payload.password = creationData.password;
            } else if (!selectedUser) {
                toast.error("Password is required for new users");
                setCreating(false);
                return;
            }

            if (selectedUser) {
                // UPDATE MODE
                await platformService.updateUser(selectedUser.id, payload);
                toast.success("User updated successfully!");
            } else {
                // CREATE MODE
                payload.email = creationData.email;
                await platformService.createUser(payload);
                toast.success("User created successfully!");
            }

            setIsCreateModalOpen(false);
            setCreationData({ email: "", password: "", first_name: "", last_name: "", role_type: "5", company_id: "" });
            setSelectedUser(null);
            loadUserAnalytics();
        } catch (error: any) {
            toast.error(error.message || "Failed to save user");
        } finally {
            setCreating(false);
        }
    };


    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const action = currentStatus ? "Suspending" : "Activating";
            toast.loading(`${action} user...`, { id: "toggle-status" });

            // Assuming API supports this, or we fallback to update
            await platformService.updateUser(id, { is_active: !currentStatus });

            toast.success(`User ${currentStatus ? "suspended" : "activated"} successfully`, { id: "toggle-status" });
            loadUserAnalytics();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status", { id: "toggle-status" });
        }
    };

    const openDeleteModal = (user: any) => {
        setSelectedUser(user);
        setDeleteReason("");
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedUser || !deleteReason.trim()) {
            toast.error("Please provide a reason for deletion");
            return;
        }

        try {
            setDeleting(true);
            await platformService.deleteUser(selectedUser.id, deleteReason);
            toast.success("User archived successfully");
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            await loadUserAnalytics();
        } catch (error: any) {
            toast.error(error.message || "Failed to archive user");
        } finally {
            setDeleting(false);
        }
    };

    // Filter Logic
    const usersToDisplay = users.filter(user => {
        const matchesSearch = (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const roleMatch = !filterRole || user.user_roles?.[0]?.roles?.name === filterRole;

        const statusMatch = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' ? user.is_active : !user.is_active);

        return matchesSearch && roleMatch && statusMatch;
    });

    const statCards = [
        {
            label: "Total Users",
            value: stats.total,
            icon: Users2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            trend: "+12%"
        },
        {
            label: "Platform Admins",
            value: stats.platform,
            icon: ShieldCheck,
            color: "text-violet-600",
            bgColor: "bg-violet-50",
            trend: "Stable"
        },
        {
            label: "Company Admins",
            value: stats.company,
            icon: Building2,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            trend: "+5%"
        },
        {
            label: "Employees",
            value: stats.employee,
            icon: Briefcase,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            trend: "+8%"
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Users2 className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">User Management</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Global Registry
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Manage and monitor all users across the platform
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full md:w-auto bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Stats Grid - Identical to Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statCards.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 hover:border-slate-200 transition-all hover:shadow-lg group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-xs md:text-sm font-medium text-slate-500">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Search & Filters - Identical to Companies */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            <div className="relative min-w-[150px]">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-none rounded-xl py-3 pl-9 pr-8 text-xs font-bold uppercase tracking-wider text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 cursor-pointer"
                                    value={filterRole || ''}
                                    onChange={(e) => setFilterRole(e.target.value || null)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="PLATFORM_ADMIN">Platform Admin</option>
                                    <option value="COMPANY_ADMIN">Company Admin</option>
                                    <option value="BRANCH_ADMIN">Branch Admin</option>
                                    <option value="EMPLOYEE">Employee</option>
                                </select>
                            </div>
                            <div className="relative min-w-[150px]">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-none rounded-xl py-3 pl-9 pr-8 text-xs font-bold uppercase tracking-wider text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading directory...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View - Identical to Companies */}
                        <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Identity</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {usersToDisplay.map((user: any) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white flex items-center justify-center font-bold text-sm">
                                                            {user.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{user.email}</p>
                                                            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {String(user.id).substring(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                        {user.unique_code || '---'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {user.phone || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold
                                                        ${user.user_roles?.[0]?.roles?.level === 5 ? 'bg-violet-100 text-violet-700' :
                                                            user.user_roles?.[0]?.roles?.level === 4 ? 'bg-blue-100 text-blue-700' :
                                                                user.user_roles?.[0]?.roles?.level === 1 ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-slate-100 text-slate-700'}`}>
                                                        {user.user_roles?.[0]?.roles?.name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {user.user_roles?.[0]?.companies?.name || 'Global Platform'}
                                                        </span>
                                                        {user.user_roles?.[0]?.branches?.name && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                                <MapPin className="w-3 h-3" />
                                                                {user.user_roles?.[0]?.branches?.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {user.is_active ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-[#0066FF] transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-amber-600 transition-all"
                                                            title="Edit User"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                            className={`p-2 rounded-lg transition-all ${user.is_active
                                                                ? 'hover:bg-amber-50 text-slate-600 hover:text-amber-600'
                                                                : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-600'
                                                                }`}
                                                            title={user.is_active ? 'Suspend User' : 'Activate User'}
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
                                        ))}
                                        {usersToDisplay.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                                    No users found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4" >
                            {
                                usersToDisplay.map((user: any) => (
                                    <div key={user.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white flex items-center justify-center font-bold text-lg">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 break-all pr-2 text-sm">{user.email}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                        ${user.user_roles?.[0]?.roles?.level === 5 ? 'bg-violet-100 text-violet-700' :
                                                                user.user_roles?.[0]?.roles?.level === 4 ? 'bg-blue-100 text-blue-700' :
                                                                    user.user_roles?.[0]?.roles?.level === 1 ? 'bg-emerald-100 text-emerald-700' :
                                                                        'bg-slate-100 text-slate-700'}`}>
                                                            {user.user_roles?.[0]?.roles?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {user.is_active ? 'Active' : 'SSPD'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-500 font-medium mb-1">Scope</p>
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {user.user_roles?.[0]?.companies?.name || 'Global'}
                                                </p>
                                            </div>
                                            {user.user_roles?.[0]?.branches?.name ? (
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <p className="text-xs text-slate-500 font-medium mb-1">Branch</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {user.user_roles?.[0]?.branches?.name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <p className="text-xs text-slate-500 font-medium mb-1">ID</p>
                                                    <p className="text-sm font-bold text-slate-900 font-mono">
                                                        ...{String(user.id).substring(0, 8)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2.5 rounded-xl font-semibold text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                className={`p-2.5 rounded-xl font-semibold text-sm transition-all ${user.is_active
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    }`}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                className="p-2.5 rounded-xl font-semibold text-sm bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                            {
                                usersToDisplay.length === 0 && (
                                    <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                                        No users found.
                                    </div>
                                )
                            }
                        </div >
                    </>
                )
                }
            </div >

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-[#0066FF]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedUser ? 'Edit User' : 'Create New User'}</h3>
                                    <p className="text-sm text-slate-500">{selectedUser ? 'Update user details and access' : 'Add a new user to the platform registry'}</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                            value={creationData.first_name}
                                            onChange={(e) => setCreationData({ ...creationData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                            value={creationData.last_name}
                                            onChange={(e) => setCreationData({ ...creationData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                        value={creationData.email}
                                        onChange={(e) => setCreationData({ ...creationData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                        value={creationData.password}
                                        onChange={(e) => setCreationData({ ...creationData, password: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Type</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                        value={creationData.role_type}
                                        onChange={(e) => setCreationData({ ...creationData, role_type: e.target.value })}
                                    >
                                        <option value="5">Platform Admin (Level 5)</option>
                                        <option value="4">Company Admin (Level 4)</option>
                                        <option value="1">Branch Admin (Level 1)</option>
                                        <option value="0">Employee / User (Level 0)</option>
                                    </select>
                                </div>

                                {/* Conditional Company Selection for Company Admin & below */}
                                {parseInt(creationData.role_type) <= 4 && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Company</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                            value={creationData.company_id}
                                            onChange={(e) => setCreationData({ ...creationData, company_id: e.target.value })}
                                            required={parseInt(creationData.role_type) === 4}
                                        >
                                            <option value="">Select Company...</option>
                                            {companies.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm transition-all"
                                        disabled={creating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 bg-[#0066FF] hover:bg-[#0052CC] text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        {creating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {selectedUser ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="w-4 h-4" />
                                                {selectedUser ? 'Update User' : 'Create User'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Soft Delete Modal */}
            {
                isDeleteModalOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Archive User</h3>
                                        <p className="text-sm text-slate-500">Action requires justification</p>
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
                                        You are about to archive <strong>{selectedUser.email}</strong>.
                                        This will revoke their access immediately.
                                    </p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Reason for Archival <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        placeholder="Enter reason (e.g., Left organization, Role changed)..."
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
                )
            }
        </DashboardLayout >
    );
}
