"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
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
    Plus,
    Edit3,
    Trash2,
    UserCircle,
    X,
    ShieldAlert,
    BriefcaseIcon
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    employee_code: string;
    company_id: string;
    branch_id?: string;
    department_id: string;
    designation_id: string;
    employment_type: string;
    date_of_joining: string;
    is_active: boolean;
    created_at: string;
    company?: any;
    department?: any;
    designation?: any;
    branch?: any;
}

export default function EmployeesPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'ALL' | 'COMPANY' | 'BRANCH'>('ALL');

    // Filter states
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedDesignation, setSelectedDesignation] = useState<string>('');

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        employee_code: '', company_id: '', department_id: '',
        designation_id: '', employment_type: 'FULL_TIME',
        date_of_joining: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch all required data
            const [empData, compData, deptData, desigData, branchData] = await Promise.all([
                platformService.getEmployees(),
                platformService.getCompanies(),
                platformService.getDepartments(),
                platformService.getDesignations(),
                platformService.getBranches()
            ]);

            setCompanies(compData || []);
            setDepartments(deptData || []);
            setDesignations(desigData || []);
            setBranches(branchData || []);

            // Enrich employee data
            const enrichedEmployees = (empData || []).map((emp: any) => ({
                ...emp,
                company: compData?.find((c: any) => String(c.id) === String(emp.company_id)),
                department: deptData?.find((d: any) => String(d.id) === String(emp.department_id)),
                designation: desigData?.find((d: any) => String(d.id) === String(emp.designation_id)),
                branch: branchData?.find((b: any) => String(b.id) === String(emp.branch_id))
            }));

            setEmployees(enrichedEmployees);

        } catch (error) {
            console.error("Employee data error", error);
            toast.error("Failed to sync employee metrics");
        } finally {
            setLoading(false);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCompany('');
        setSelectedBranch('');
        setSelectedDepartment('');
        setSelectedDesignation('');
        setSearchTerm('');
    };

    // Filter based on search and active tab
    const getFilteredEmployees = () => {
        let list = employees;

        // Tab filtering logic
        if (activeTab === 'COMPANY') {
            list = employees.filter(e => !e.branch);
        } else if (activeTab === 'BRANCH') {
            list = employees.filter(e => e.branch);
        }

        // Company filter
        if (selectedCompany) {
            list = list.filter(e => String(e.company_id) === selectedCompany);
        }

        // Branch filter
        if (selectedBranch) {
            list = list.filter(e => String(e.branch_id) === selectedBranch);
        }

        // Department filter
        if (selectedDepartment) {
            list = list.filter(e => String(e.department_id) === selectedDepartment);
        }

        // Designation filter
        if (selectedDesignation) {
            list = list.filter(e => String(e.designation_id) === selectedDesignation);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(e =>
                (e.first_name?.toLowerCase() || "").includes(term) ||
                (e.last_name?.toLowerCase() || "").includes(term) ||
                (e.email?.toLowerCase() || "").includes(term) ||
                (e.employee_code?.toLowerCase() || "").includes(term) ||
                (e.company?.name?.toLowerCase() || "").includes(term) ||
                (e.department?.name?.toLowerCase() || "").includes(term) ||
                (e.branch?.name?.toLowerCase() || "").includes(term)
            );
        }

        return list;
    };

    const filteredEmployees = getFilteredEmployees();

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

    // Get available designations based on selected company
    const getAvailableDesignations = () => {
        if (!selectedCompany) return designations;
        return designations.filter(d => String(d.company_id) === selectedCompany);
    };

    const stats = {
        total: filteredEmployees.length,
        active: filteredEmployees.filter(e => e.is_active).length,
        departments: departments.length,
        designations: designations.length
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    const resetForm = () => {
        setFormData({
            first_name: '', last_name: '', email: '', phone: '',
            employee_code: '', company_id: '', department_id: '',
            designation_id: '', employment_type: 'FULL_TIME',
            date_of_joining: new Date().toISOString().split('T')[0]
        });
        setSelectedEmployee(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            await platformService.createEmployee(formData);
            toast.success("Employee inducted successfully");
            setIsCreateModalOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error("Failed to induct employee");
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;
        try {
            setUpdating(true);
            await platformService.updateEmployee(selectedEmployee.id, formData);
            toast.success("Profile recalibrated successfully");
            setIsEditModalOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEmployee || !deleteReason) return;
        try {
            setDeleting(true);
            await platformService.deleteEmployee(selectedEmployee.id, deleteReason);
            toast.success("Profile archived successfully");
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            loadData();
        } catch (error) {
            toast.error("Termination protocol failed");
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (emp: any) => {
        setSelectedEmployee(emp);
        setFormData({
            ...emp,
            company_id: emp.company_id?.toString() || '',
            department_id: emp.department_id?.toString() || '',
            designation_id: emp.designation_id?.toString() || ''
        });
        setIsEditModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Users className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Human Capital</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Talent Ecosystem
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Master registry of organizational human capital and structural mapping
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                            className="flex-1 md:flex-none bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Induct Talent</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Workforce", value: stats.total, icon: Users, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
                        { label: "Operational", value: stats.active, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
                        { label: "Departments", value: stats.departments, icon: Building, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-50", textColor: "text-violet-600" },
                        { label: "Designations", value: stats.designations, icon: Briefcase, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50", textColor: "text-amber-600" },
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
                        { id: 'ALL', label: 'All Personnel', count: stats.total },
                        { id: 'COMPANY', label: 'Regional Hub', count: employees.filter(e => !e.branch).length },
                        { id: 'BRANCH', label: 'Node Specific', count: employees.filter(e => e.branch).length }
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
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code, email, branch, or department..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {/* Company Filter */}
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                            <select
                                value={selectedCompany}
                                onChange={(e) => {
                                    setSelectedCompany(e.target.value);
                                    setSelectedBranch('');
                                    setSelectedDepartment('');
                                    setSelectedDesignation('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all appearance-none cursor-pointer"
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
                                disabled={!selectedCompany && branches.length > 10}
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
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none z-10" />
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Departments</option>
                                {getAvailableDepartments().map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Designation Filter */}
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none z-10" />
                            <select
                                value={selectedDesignation}
                                onChange={(e) => setSelectedDesignation(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Designations</option>
                                {getAvailableDesignations().map(d => (
                                    <option key={d.id} value={d.id}>{d.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            disabled={!selectedCompany && !selectedBranch && !selectedDepartment && !selectedDesignation && !searchTerm}
                            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl py-2.5 px-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCompany || selectedBranch || selectedDepartment || selectedDesignation) && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>
                            {selectedCompany && (
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg border border-blue-200">
                                    <Building2 className="w-3 h-3" />
                                    {companies.find(c => String(c.id) === selectedCompany)?.name}
                                    <button onClick={() => setSelectedCompany('')} className="hover:text-blue-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {selectedBranch && (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200">
                                    <MapPin className="w-3 h-3" />
                                    {branches.find(b => String(b.id) === selectedBranch)?.name}
                                    <button onClick={() => setSelectedBranch('')} className="hover:text-emerald-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {selectedDepartment && (
                                <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-lg border border-violet-200">
                                    <Building className="w-3 h-3" />
                                    {departments.find(d => String(d.id) === selectedDepartment)?.name}
                                    <button onClick={() => setSelectedDepartment('')} className="hover:text-violet-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {selectedDesignation && (
                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-lg border border-amber-200">
                                    <Briefcase className="w-3 h-3" />
                                    {designations.find(d => String(d.id) === selectedDesignation)?.title}
                                    <button onClick={() => setSelectedDesignation('')} className="hover:text-amber-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Table Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Mapping talent data...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Identity</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Structural Mapping</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Pulse</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Identification Tags</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEmployees.map((emp) => (
                                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white font-bold text-xs">
                                                            {(emp.first_name || 'U').charAt(0)}{(emp.last_name || 'N').charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900 leading-tight">
                                                                {emp.first_name || 'Unknown'} {emp.last_name || 'User'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium"> {emp.email} </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                            <Briefcase className="w-3.5 h-3.5 text-[#0066FF] opacity-60" />
                                                            {emp.designation?.title || 'Registered Unit'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                            <Building2 className="w-3 h-3" />
                                                            {emp.company?.name || 'Central'}
                                                        </div>
                                                        {emp.branch && (
                                                            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
                                                                <MapPin className="w-3 h-3" />
                                                                {emp.branch.name}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                            <Building className="w-3 h-3" />
                                                            {emp.department?.name || 'Core'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${emp.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                                {emp.is_active ? 'Active' : 'Archived'}
                                                            </span>
                                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                                {emp.employment_type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                                            <Calendar className="w-3 h-3" /> Joined {formatDate(emp.date_of_joining)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <code className="text-xs font-mono font-bold text-[#0066FF] bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit">
                                                            {emp.employee_code}
                                                        </code>
                                                        <span className="text-[10px] text-slate-400">UID: {String(emp.id).substring(0, 8).toUpperCase()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(emp)}
                                                            className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#0066FF] hover:bg-blue-50 transition-all shadow-sm"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedEmployee(emp); setIsDeleteModalOpen(true); }}
                                                            className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-slate-400">
                                                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                                    <p className="font-semibold">No personnel found</p>
                                                    <p className="text-sm mt-1">Try adjusting your mapping parameters</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredEmployees.map((emp) => (
                                <div key={emp.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white font-bold text-sm">
                                                {(emp.first_name || 'U').charAt(0)}{(emp.last_name || 'N').charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                                    {emp.first_name} {emp.last_name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${emp.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                        {emp.is_active ? 'Active' : 'Archived'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{emp.employee_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(emp)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-[#0066FF]"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => { setSelectedEmployee(emp); setIsDeleteModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <BriefcaseIcon className="w-4 h-4 text-blue-500 shrink-0" />
                                            <span className="text-slate-800 font-bold truncate">{emp.designation?.title || 'GENERAL'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{emp.company?.name || 'Central Hub'}</span>
                                        </div>
                                        {emp.branch && (
                                            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{emp.branch.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{emp.department?.name || 'Core'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{emp.email}</span>
                                        </div>
                                        {emp.phone && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{emp.phone}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                                <Calendar className="w-3 h-3" />
                                                Joined {formatDate(emp.date_of_joining)}
                                            </div>
                                            <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {emp.employment_type?.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Induct Talent Modal */}
                {(isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-8 py-6 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <UserCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight uppercase">{isEditModalOpen ? 'Recalibrate Profile' : 'Induct Talent'}</h2>
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">Configuring personnel structural mapping</p>
                                    </div>
                                </div>
                                <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Parent Enterprise</label>
                                        <select
                                            required
                                            value={formData.company_id}
                                            onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                            className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all border-none shadow-sm"
                                        >
                                            <option value="">Select Company Hub</option>
                                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Identity Name</label>
                                        <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Legacy Name</label>
                                        <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Personnel Email</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Protocol</label>
                                        <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identification Code</label>
                                        <input type="text" required value={formData.employee_code} onChange={e => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-mono font-bold text-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none" placeholder="EMP-001" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Engagement Date</label>
                                        <input type="date" required value={formData.date_of_joining} onChange={e => setFormData({ ...formData, date_of_joining: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Functional Unit (Dept)</label>
                                        <select
                                            required
                                            value={formData.department_id}
                                            onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                                            className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.filter(d => !formData.company_id || String(d.company_id) === String(formData.company_id)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Functional Designation</label>
                                        <select
                                            required
                                            value={formData.designation_id}
                                            onChange={e => setFormData({ ...formData, designation_id: e.target.value })}
                                            className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm border-none"
                                        >
                                            <option value="">Select Designation</option>
                                            {designations.filter(d => !formData.company_id || String(d.company_id) === String(formData.company_id)).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-50 flex gap-4">
                                    <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Dismiss</button>
                                    <button type="submit" disabled={creating || updating} className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                        {creating || updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Archive Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-slate-900">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-8 ring-rose-50">
                                    <Trash2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Archive Record?</h2>
                                <p className="text-slate-500 text-sm font-medium mt-3 px-6 italic leading-relaxed">
                                    Inactivating <span className="text-slate-900 font-bold">"{selectedEmployee?.first_name} {selectedEmployee?.last_name}"</span>.
                                    This will suspend system access for this profile.
                                </p>

                                <div className="mt-8 text-left space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Protocol Reason</label>
                                    <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full h-24 rounded-2xl bg-slate-50 border-none p-5 text-sm font-bold focus:ring-4 focus:ring-rose-100 outline-none resize-none shadow-inner" placeholder="Reason for record archival..." />
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Abort</button>
                                    <button onClick={handleDelete} disabled={!deleteReason || deleting} className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Archive'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-[#0066FF] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm md:text-base uppercase tracking-tight">Personnel Security Protocol</h4>
                        <p className="text-sm text-blue-800/80 font-medium mt-1 leading-normal">
                            Modification of employee records triggers a security event in the audit trail. Archiving a profile immediately revokes all associated system credentials across the network node.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

