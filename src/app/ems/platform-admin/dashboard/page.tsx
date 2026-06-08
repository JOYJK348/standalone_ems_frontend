"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2,
    Users,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Loader2,
    CheckCircle2,
    BarChart3,
    PieChart,
    Globe,
    Zap,
    Crown,
    Shield,
    MapPin
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

export default function PlatformDashboard() {
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedModule, setSelectedModule] = useState<string>('');

    const [stats, setStats] = useState({
        totalCompanies: 0,
        activeCompanies: 0,
        totalUsers: 0,
        totalBranches: 0,
        totalEmployees: 0,
        totalDepartments: 0,
        platformAdmins: 0,
        companyAdmins: 0
    });

    const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [companiesData, usersData, branchesData, deptData, desigData, empData] = await Promise.all([
                platformService.getCompanies(),
                platformService.getUsers(),
                platformService.getBranches(),
                platformService.getDepartments(),
                platformService.getDesignations(),
                platformService.getEmployees()
            ]);

            setCompanies(companiesData || []);
            setUsers(usersData || []);
            setBranches(branchesData || []);
            setDepartments(deptData || []);
            setDesignations(desigData || []);
            setEmployees(empData || []);

            // Calculate stats
            const activeCompanies = companiesData.filter((c: any) => c.is_active !== false).length;

            let platformAdmins = 0;
            let companyAdmins = 0;
            usersData.forEach((u: any) => {
                const level = u.user_roles?.[0]?.roles?.level || 0;
                if (level === 5) platformAdmins++;
                else if (level === 4) companyAdmins++;
            });

            setStats({
                totalCompanies: companiesData.length,
                activeCompanies,
                totalUsers: usersData.length,
                totalBranches: branchesData.length,
                totalEmployees: empData.length,
                totalDepartments: deptData.length,
                platformAdmins,
                companyAdmins
            });

            // Get recent 5 companies (Sorted by creation time or ID descending)
            const sortedRecent = [...companiesData].sort((a: any, b: any) => {
                // Try sorting by ID descending (assuming serial or UUID with time component)
                // or created_at if available
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                // Fallback to ID comparison if timestamps missing (string comparison for UUIDs works roughly for time if sequential)
                return String(b.id).localeCompare(String(a.id));
            });

            setRecentCompanies(sortedRecent.slice(0, 5).map((c: any) => ({
                id: c.id,
                name: c.name,
                plan: c.subscription_plan || 'TRIAL',
                status: c.is_active !== false ? 'ACTIVE' : 'SUSPENDED',
                branches: branchesData.filter((b: any) => String(b.company_id) === String(c.id)).length
            })));

        } catch (error) {
            console.error("Dashboard data error", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCompany('');
        setSelectedBranch('');
        setSelectedDepartment('');
        setSelectedModule('');
    };

    // Get filtered data based on selections
    const getFilteredData = () => {
        let filteredBranches = branches;
        let filteredDepartments = departments;
        let filteredEmployees = employees;
        let filteredUsers = users;

        if (selectedCompany) {
            filteredBranches = branches.filter(b => String(b.company_id) === selectedCompany);
            filteredDepartments = departments.filter(d => String(d.company_id) === selectedCompany);
            filteredEmployees = employees.filter(e => String(e.company_id) === selectedCompany);
            filteredUsers = users.filter(u =>
                u.user_roles?.some((ur: any) => String(ur.company_id) === selectedCompany)
            );
        }

        if (selectedBranch) {
            filteredEmployees = filteredEmployees.filter(e => String(e.branch_id) === selectedBranch);
        }

        if (selectedDepartment) {
            filteredEmployees = filteredEmployees.filter(e => String(e.department_id) === selectedDepartment);
        }

        return {
            branches: filteredBranches,
            departments: filteredDepartments,
            employees: filteredEmployees,
            users: filteredUsers
        };
    };

    const filteredData = getFilteredData();

    // Get available branches based on selected company
    const getAvailableBranches = () => {
        if (!selectedCompany) return branches;
        return branches.filter(b => String(b.company_id) === selectedCompany);
    };

    // Get available departments based on selected company
    const getAvailableDepartments = () => {
        if (!selectedCompany) return departments;
        return departments.filter(d => String(d.company_id) === selectedCompany);
    };

    // Module options
    const modules = [
        { id: 'EMS', name: 'Education Management', icon: Building2 }
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mx-auto mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const statCards = [
        {
            label: selectedCompany ? "Company Branches" : "Total Companies",
            value: selectedCompany ? filteredData.branches.length : stats.totalCompanies,
            change: "+12%",
            trend: "up",
            icon: Building2,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            label: selectedBranch ? "Branch Employees" : (selectedCompany ? "Company Employees" : "Total Employees"),
            value: filteredData.employees.length,
            change: "+23%",
            trend: "up",
            icon: Users,
            color: "from-violet-500 to-violet-600",
            bgColor: "bg-violet-50",
            textColor: "text-violet-600"
        },
        {
            label: selectedCompany ? "Company Departments" : "Total Departments",
            value: filteredData.departments.length,
            change: "+8%",
            trend: "up",
            icon: Activity,
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600"
        },
        {
            label: selectedCompany ? "Company Users" : "Global Branches",
            value: selectedCompany ? filteredData.users.length : stats.totalBranches,
            change: "+5%",
            trend: "up",
            icon: Globe,
            color: "from-amber-500 to-amber-600",
            bgColor: "bg-amber-50",
            textColor: "text-amber-600"
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Activity className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">System Live</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Hello, Platform Admin !👋
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Welcoomeeee back!!! Here's what's happening with your platform today.
                        </p>
                    </div>
                    <Link href="/ems/platform-admin/core/companies/create-with-admin">
                        <button className="w-full md:w-auto bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>Add New Company</span>
                        </button>
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filter Overview</h3>
                        <button
                            onClick={clearFilters}
                            disabled={!selectedCompany && !selectedBranch && !selectedDepartment && !selectedModule}
                            className="text-xs font-bold text-slate-500 hover:text-[#0066FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Company Filter */}
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none z-10" />
                            <select
                                value={selectedCompany}
                                onChange={(e) => {
                                    setSelectedCompany(e.target.value);
                                    setSelectedBranch('');
                                    setSelectedDepartment('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Companies</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Branch Filter */}
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none z-10" />
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                disabled={!selectedCompany}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">All Branches</option>
                                {getAvailableBranches().map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none z-10" />
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                disabled={!selectedCompany}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">All Departments</option>
                                {getAvailableDepartments().map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Module Filter */}
                        <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none z-10" />
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Modules</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCompany || selectedBranch || selectedDepartment || selectedModule) && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active:</span>
                            {selectedCompany && (
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg border border-blue-200">
                                    <Building2 className="w-3 h-3" />
                                    {companies.find(c => String(c.id) === selectedCompany)?.name}
                                </span>
                            )}
                            {selectedBranch && (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200">
                                    <MapPin className="w-3 h-3" />
                                    {branches.find(b => String(b.id) === selectedBranch)?.name}
                                </span>
                            )}
                            {selectedDepartment && (
                                <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-lg border border-violet-200">
                                    <Activity className="w-3 h-3" />
                                    {departments.find(d => String(d.id) === selectedDepartment)?.name}
                                </span>
                            )}
                            {selectedModule && (
                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-lg border border-amber-200">
                                    <Zap className="w-3 h-3" />
                                    {modules.find(m => m.id === selectedModule)?.name}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Grid - Mobile First */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statCards.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 hover:border-slate-200 transition-all hover:shadow-lg group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>{stat.change}</span>
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

                {/* Charts Section - Mobile Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* User Distribution Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">User Distribution</h3>
                                <p className="text-xs text-slate-500 font-medium">Platform & Company Admins</p>
                            </div>
                            <BarChart3 className="w-5 h-5 text-slate-400" />
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Platform Admins</span>
                                    <span className="text-sm font-bold text-[#0066FF]">{stats.platformAdmins}</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.platformAdmins / stats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Company Admins</span>
                                    <span className="text-sm font-bold text-emerald-600">{stats.companyAdmins}</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.companyAdmins / stats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Other Users</span>
                                    <span className="text-sm font-bold text-violet-600">{stats.totalUsers - stats.platformAdmins - stats.companyAdmins}</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500"
                                        style={{ width: `${((stats.totalUsers - stats.platformAdmins - stats.companyAdmins) / stats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Status Pie Chart */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Company Status</h3>
                                <p className="text-xs text-slate-500 font-medium">Active vs Total</p>
                            </div>
                            <PieChart className="w-5 h-5 text-slate-400" />
                        </div>

                        {/* Simple Donut Chart */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {/* Background circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#f1f5f9"
                                        strokeWidth="12"
                                    />
                                    {/* Active companies arc */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="12"
                                        strokeDasharray={`${(stats.activeCompanies / stats.totalCompanies) * 251.2} 251.2`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-900">{Math.round((stats.activeCompanies / stats.totalCompanies) * 100)}%</span>
                                    <span className="text-xs font-medium text-slate-500">Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-sm font-semibold text-slate-700">Active</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">{stats.activeCompanies}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <span className="text-sm font-semibold text-slate-700">Inactive</span>
                                </div>
                                <span className="text-sm font-bold text-slate-600">{stats.totalCompanies - stats.activeCompanies}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Companies Table - Mobile Optimized */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Recent Companies</h3>
                                <p className="text-xs text-slate-500 font-medium">Latest registered tenants</p>
                            </div>
                            <Link href="/ems/platform-admin/core/companies">
                                <button className="text-sm font-semibold text-[#0066FF] hover:text-[#0052CC] flex items-center gap-1">
                                    View All
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile: Card View, Desktop: Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Branches</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-bold">
                                                    {company.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-900">{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${company.plan === 'ENTERPRISE' ? 'bg-violet-100 text-violet-700' :
                                                company.plan === 'PRO' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {company.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {company.branches}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${company.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {company.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/ems/platform-admin/core/companies/${company.id}`}>
                                                <button className="text-sm font-semibold text-[#0066FF] hover:text-[#0052CC]">
                                                    View
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {recentCompanies.map((company) => (
                            <div key={company.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-bold text-sm">
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-sm">{company.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{company.branches} branches</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${company.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        {company.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${company.plan === 'ENTERPRISE' ? 'bg-violet-100 text-violet-700' :
                                        company.plan === 'PRO' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {company.plan}
                                    </span>
                                    <Link href={`/ems/platform-admin/core/companies/${company.id}`}>
                                        <button className="text-sm font-semibold text-[#0066FF] hover:text-[#0052CC] flex items-center gap-1">
                                            View
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Organization Explorer - NEW SECTION */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">Organizational Explorer</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Deep-dive into branch-wise departments and employee distribution</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Live View:</span>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Master Cloud</span>
                        </div>
                    </div>

                    <div className="p-0">
                        {!selectedCompany ? (
                            <div className="p-12 text-center">
                                <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-slate-800">Select a Company to explore its structure</h4>
                                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                                    Use the filters above to pick a tenant and see their branches, departments, and personnel distribution.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                {/* Branches Column */}
                                <div className="p-6 bg-slate-50/30">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                        Branches
                                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px]">{filteredData.branches.length}</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {filteredData.branches.map(branch => (
                                            <button
                                                key={branch.id}
                                                onClick={() => setSelectedBranch(String(branch.id))}
                                                className={`w-full text-left p-3 rounded-xl border transition-all ${String(selectedBranch) === String(branch.id)
                                                    ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100'
                                                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="font-bold text-slate-800 text-sm truncate">{branch.name}</div>
                                                <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase">{branch.code}</div>
                                                <div className="flex gap-3 mt-2">
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                                        <Users className="w-2.5 h-2.5" />
                                                        {employees.filter(e => String(e.branch_id) === String(branch.id)).length} Staff
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed View Area */}
                                <div className="lg:col-span-3">
                                    {!selectedBranch ? (
                                        <div className="p-20 text-center">
                                            <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-slate-400">Select a branch to see detailed breakdown</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {/* Branch Stats Mini-Header */}
                                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                                    <div className="text-[10px] font-bold text-blue-500 uppercase">Total Employees</div>
                                                    <div className="text-xl font-bold text-slate-900 mt-1">
                                                        {employees.filter(e => String(e.branch_id) === String(selectedBranch)).length}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100">
                                                    <div className="text-[10px] font-bold text-violet-500 uppercase">Departments</div>
                                                    <div className="text-xl font-bold text-slate-900 mt-1">
                                                        {new Set(employees.filter(e => String(e.branch_id) === String(selectedBranch)).map(e => e.department_id)).size}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                                                    <div className="text-[10px] font-bold text-amber-500 uppercase">Designations</div>
                                                    <div className="text-xl font-bold text-slate-900 mt-1">
                                                        {new Set(employees.filter(e => String(e.branch_id) === String(selectedBranch)).map(e => e.designation_id)).size}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                                    <div className="text-[10px] font-bold text-emerald-500 uppercase">Efficiency</div>
                                                    <div className="text-xl font-bold text-slate-900 mt-1">94%</div>
                                                </div>
                                            </div>

                                            {/* Tables Section */}
                                            <div className="p-6 bg-slate-50/10">
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    Staff Personnel
                                                </h4>
                                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-slate-50 border-b border-slate-200">
                                                            <tr>
                                                                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Employee</th>
                                                                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Department</th>
                                                                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Designation</th>
                                                                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white">
                                                            {employees
                                                                .filter(e => String(e.branch_id) === String(selectedBranch))
                                                                .map(emp => (
                                                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="px-4 py-3">
                                                                            <div className="font-bold text-slate-900">{emp.first_name} {emp.last_name}</div>
                                                                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.employee_code}</div>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                                                {departments.find(d => String(d.id) === String(emp.department_id))?.name || '---'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="text-xs font-medium text-slate-700">
                                                                                {designations.find(d => String(d.id) === String(emp.designation_id))?.name || '---'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">On Duty</span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            {employees.filter(e => String(e.branch_id) === String(selectedBranch)).length === 0 && (
                                                                <tr>
                                                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No employees assigned to this branch yet.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/ems/platform-admin/users" className="group">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-[#0066FF]/30 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">User Management</h3>
                            <p className="text-sm text-slate-500">Manage all platform users</p>
                        </div>
                    </Link>
                    <Link href="/ems/platform-admin/audit-logs" className="group">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-500/30 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Audit Logs</h3>
                            <p className="text-sm text-slate-500">View system activity</p>
                        </div>
                    </Link>
                    <Link href="/ems/platform-admin/settings" className="group">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-violet-500/30 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">System Settings</h3>
                            <p className="text-sm text-slate-500">Configure platform</p>
                        </div>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
