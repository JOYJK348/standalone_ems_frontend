"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Building2,
    Users,
    MapPin,
    Briefcase,
    LayoutGrid,
    Search,
    Filter,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Loader2,
    Building,
    Phone,
    Mail,
    Calendar,
    ArrowUpRight,
    SearchCode,
    Smartphone,
    Globe,
    CreditCard,
    Activity
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import Link from "next/link";

export default function CompanyDetailView() {
    const params = useParams();
    const companyId = params.id as string;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANCHES' | 'DEPARTMENTS' | 'EMPLOYEES' | 'DESIGNATIONS'>('OVERVIEW');
    const [searchTerm, setSearchTerm] = useState("");

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({});

    useEffect(() => {
        if (companyId) {
            loadCompanyData();
        }
    }, [companyId]);

    const loadCompanyData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Company Metadata
            const companyData = await platformService.getCompany(companyId);
            setCompany(companyData);
            setEditFormData({
                name: companyData.name,
                company_code: companyData.company_code || companyData.code,
                subscription_plan: companyData.subscription_plan,
                is_active: companyData.is_active
            });

            // 2. Fetch All Resources
            const [allBranches, allDepts, allEmps, allDesigs] = await Promise.all([
                platformService.getBranches(),
                platformService.getDepartments(),
                platformService.getEmployees(),
                platformService.getDesignations()
            ]);

            // 3. Filter by Company ID
            setBranches(allBranches.filter((b: any) => String(b.company_id) === String(companyId)));
            setDepartments(allDepts.filter((d: any) => {
                if (d.company_id) return String(d.company_id) === String(companyId);
                const branch = allBranches.find((b: any) => String(b.id) === String(d.branch_id));
                return branch && String(branch.company_id) === String(companyId);
            }));
            setEmployees(allEmps.filter((e: any) => String(e.company_id) === String(companyId)));
            setDesignations(allDesigs.filter((d: any) => String(d.company_id) === String(companyId)));

        } catch (error) {
            console.error("Failed to load company details", error);
            toast.error("Could not load company specific data");
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = () => {
        try {
            const exportData = {
                company,
                branches,
                departments,
                employees: employees.map(e => ({
                    ...e,
                    designation: designations.find(d => String(d.id) === String(e.designation_id))?.title
                }))
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${company.name.replace(/\s+/g, '_')}_Blueprint_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Enterprise blueprint exported", {
                description: "JSON package generated successfully."
            });
        } catch (error) {
            toast.error("Export failed");
        }
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await platformService.updateCompany(companyId, editFormData);
            toast.success("Blueprint recalibrated", {
                description: "Company parameters updated successfully."
            });
            setIsEditModalOpen(false);
            loadCompanyData();
        } catch (error: any) {
            toast.error("Sync Failed", {
                description: error.message || "Could not update company blueprint."
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-[#0066FF] animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Profiling Enterprise Data...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!company) return null;

    const TabButton = ({ id, label, icon: Icon, count }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2.5 px-6 py-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === id
                ? 'border-[#0066FF] text-[#0066FF] bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
        >
            <Icon className={`w-4 h-4 ${activeTab === id ? 'text-[#0066FF]' : 'text-slate-400'}`} />
            {label}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${activeTab === id ? 'bg-[#0066FF] text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
            </span>
        </button>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <Link href="/ems/platform-admin/core/companies" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#0066FF] transition-all font-bold text-xs uppercase tracking-widest w-fit group">
                        <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#0066FF]/30 group-hover:bg-blue-50">
                            <ArrowLeft className="w-3 h-3" />
                        </div>
                        Back to Registry
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/20 font-bold text-2xl md:text-3xl">
                                {company.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{company.name}</h1>
                                <div className="flex items-center flex-wrap gap-2 mt-2">
                                    <div className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                        <SearchCode className="w-3 h-3" />
                                        {company.company_code || company.code}
                                    </div>
                                    <div className={`px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border ${company.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${company.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        {company.is_active ? 'Operational' : 'Restricted'}
                                    </div>
                                    {company.subscription_plan && (
                                        <div className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                            <CreditCard className="w-3 h-3" />
                                            {company.subscription_plan} TIER
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportData}
                                className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Export Data
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Edit Blueprint
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - Modern & Responsive */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex overflow-x-auto hide-scrollbar">
                    <TabButton id="OVERVIEW" label="Executive Summery" icon={LayoutGrid} count={4} />
                    <TabButton id="BRANCHES" label="Node Network" icon={MapPin} count={branches.length} />
                    <TabButton id="DEPARTMENTS" label="Functional Units" icon={Building} count={departments.length} />
                    <TabButton id="EMPLOYEES" label="Human Capital" icon={Users} count={employees.length} />
                    <TabButton id="DESIGNATIONS" label="Job Hierarchy" icon={Briefcase} count={designations.length} />
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'OVERVIEW' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: "Nodes (Branches)", value: branches.length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
                                { label: "Workforce", value: employees.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { label: "Departments", value: departments.length, icon: Building, color: "text-violet-600", bg: "bg-violet-50" },
                                { label: "Job Designations", value: designations.length, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 leading-none">{item.value}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{item.label}</p>
                                </div>
                            ))}

                            {/* Detailed Metadata Card */}
                            <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-[#0066FF]" />
                                        Primary Configuration
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entity Reference</span>
                                                <span className="text-sm font-semibold text-slate-700">{company.name}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Identifier</span>
                                                <span className="text-sm font-mono text-slate-600">{company.id}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operational Cluster</span>
                                                <span className="text-sm font-semibold text-slate-700">{company.subscription_plan || 'N/A'} Cluster</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Creation Horizon</span>
                                                <span className="text-sm font-semibold text-slate-700">{new Date(company.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                                    <Globe className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                                    <h3 className="text-lg font-bold mb-4 relative z-10">Quick Actions</h3>
                                    <div className="space-y-3 relative z-10">
                                        <button
                                            onClick={() => router.push(`/ems/platform-admin/modules?companyId=${companyId}`)}
                                            className="w-full bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all"
                                        >
                                            Manage Modules <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/ems/platform-admin/audit-logs?companyId=${companyId}`)}
                                            className="w-full bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all"
                                        >
                                            Security Logs <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toast.info("Billing integration in progress")}
                                            className="w-full bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all"
                                        >
                                            Billing History <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LIST TABLES */}
                    {activeTab !== 'OVERVIEW' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Filter Bar within Tab */}
                            <div className="p-4 md:p-6 border-b border-slate-50 flex items-center bg-slate-50/50">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={`Filter ${activeTab.toLowerCase()}...`}
                                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {activeTab === 'BRANCHES' && (
                                                <>
                                                    <th className="px-6 py-4">Node Identity</th>
                                                    <th className="px-6 py-4">Geographic Scope</th>
                                                    <th className="px-6 py-4 text-center">Protocol Status</th>
                                                </>
                                            )}
                                            {activeTab === 'DEPARTMENTS' && (
                                                <>
                                                    <th className="px-6 py-4">Unit Identification</th>
                                                    <th className="px-6 py-4">Assigned Node</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </>
                                            )}
                                            {activeTab === 'EMPLOYEES' && (
                                                <>
                                                    <th className="px-6 py-4">Identity & Credentials</th>
                                                    <th className="px-6 py-4">Assignment Scope</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </>
                                            )}
                                            {activeTab === 'DESIGNATIONS' && (
                                                <>
                                                    <th className="px-6 py-4">Role Title</th>
                                                    <th className="px-6 py-4">Protocol Level</th>
                                                    <th className="px-6 py-4">Global Reach</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* Dynamic Body Rendering */}
                                        {activeTab === 'BRANCHES' && branches
                                            .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((branch) => (
                                                <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{branch.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{branch.company_code || branch.code}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                                <Globe className="w-3.5 h-3.5 opacity-50" />
                                                                {branch.city}, {branch.state}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                                                <Phone className="w-3 h-3 opacity-50" />
                                                                {branch.phone || 'No Data'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold border ${branch.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {branch.is_active ? 'ACTIVE' : 'LOCKED'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}

                                        {activeTab === 'DEPARTMENTS' && departments
                                            .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((dept) => {
                                                const parentBranch = branches.find(b => String(b.id) === String(dept.branch_id));
                                                return (
                                                    <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{dept.name}</p>
                                                                <p className="text-[10px] uppercase font-bold text-slate-400">{dept.code || 'NO-REF'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                            {parentBranch ? parentBranch.name : 'Central Unit'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold border ${dept.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                                {dept.is_active ? 'READY' : 'OFFLINE'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                        {activeTab === 'EMPLOYEES' && employees
                                            .filter(e => (e.first_name + ' ' + e.last_name).toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((emp) => {
                                                const empBranch = branches.find(b => String(b.id) === String(emp.branch_id));
                                                const empDept = departments.find(d => String(d.id) === String(emp.department_id));
                                                return (
                                                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                                    {emp.first_name.charAt(0)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <p className="text-sm font-bold text-slate-900 leading-tight">{emp.first_name} {emp.last_name}</p>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <span className="text-[10px] font-bold text-slate-400">{emp.employee_code}</span>
                                                                        <span className="text-slate-300">|</span>
                                                                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[120px]">{emp.email}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-700">{emp.designation?.title || 'Registered Unit'}</span>
                                                                <span className="text-[10px] text-[#0066FF] font-semibold">{empBranch?.name || 'Global'} / {empDept?.name || 'Central'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold border ${emp.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                                {emp.is_active ? 'VERIFIED' : 'PENDING'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                        {activeTab === 'DESIGNATIONS' && designations
                                            .filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((desig) => (
                                                <tr key={desig.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{desig.title}</p>
                                                            <p className="text-[10px] uppercase font-bold text-slate-400">{desig.code || 'AUTO-KEY'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            Tier {desig.level}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Institutional</span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State Handler */}
                {!loading && activeTab !== 'OVERVIEW' && (
                    <div className="hidden lg:block">
                        {(activeTab === 'BRANCHES' && branches.length === 0) ||
                            (activeTab === 'DEPARTMENTS' && departments.length === 0) ||
                            (activeTab === 'EMPLOYEES' && employees.length === 0) ||
                            (activeTab === 'DESIGNATIONS' && designations.length === 0) ? (
                            <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center">
                                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No entries mapped</h3>
                                <p className="text-sm text-slate-500">Infrastructure data has not been correlated for this sector.</p>
                            </div>
                        ) : null}
                    </div>
                )}
                {/* Edit Company Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Regulate Blueprint</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Calibrating {company.name}</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSave} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enterprise Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[#0066FF]/10 focus:border-[#0066FF] transition-all"
                                            value={editFormData.name || ''}
                                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Code</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#0066FF]/10 focus:border-[#0066FF] transition-all font-mono"
                                                value={editFormData.company_code || ''}
                                                onChange={e => setEditFormData({ ...editFormData, company_code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Operational Tier</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#0066FF]/10 focus:border-[#0066FF] transition-all appearance-none cursor-pointer"
                                                value={editFormData.subscription_plan || ''}
                                                onChange={e => setEditFormData({ ...editFormData, subscription_plan: e.target.value })}
                                            >
                                                <option value="TRIAL">TRIAL</option>
                                                <option value="STANDARD">STANDARD</option>
                                                <option value="PREMIUM">PREMIUM</option>
                                                <option value="ENTERPRISE">ENTERPRISE</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editFormData.is_active ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                                <Activity className={`w-5 h-5 ${editFormData.is_active ? 'text-emerald-500' : 'text-rose-500'}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Infrastructure Pipeline</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{editFormData.is_active ? 'Operational' : 'Suspended'}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditFormData({ ...editFormData, is_active: !editFormData.is_active })}
                                            className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${editFormData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${editFormData.is_active ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Syncing...
                                            </>
                                        ) : (
                                            <>Sync Parameters</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

