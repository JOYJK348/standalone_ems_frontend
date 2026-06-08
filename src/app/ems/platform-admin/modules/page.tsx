"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Package,
    Loader2,
    Search,
    CheckCircle2,
    XCircle,
    Settings,
    AlertCircle,
    Save
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface CompanyModuleStatus {
    id: number;
    name: string;
    code: string;
    modules: string[];
    plan: string;
}

const ALL_MODULES = [
    { id: 'EMS', label: 'EMS Core', icon: 'EDU', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { id: 'LMS', label: 'LMS', icon: 'LMS', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    { id: 'ATTENDANCE', label: 'Attendance', icon: 'ATT', color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-100' },
    { id: 'LIVE_CLASSES', label: 'Live Classes', icon: 'LIVE', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { id: 'ASSESSMENTS', label: 'Assessments', icon: 'TEST', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100' },
    { id: 'MATERIALS', label: 'Materials', icon: 'MAT', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100' },
];

import { useSearchParams } from "next/navigation";

export default function ModulesManagementPage() {
    const searchParams = useSearchParams();
    const initialCompanyId = searchParams.get('companyId');

    const [companies, setCompanies] = useState<CompanyModuleStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await platformService.getCompanies();
            const mapped = data.map((c: any) => {
                let mods = c.enabled_modules || [];
                if (typeof mods === 'string') {
                    try { mods = JSON.parse(mods); } catch { mods = []; }
                }
                return {
                    id: c.id,
                    name: c.name,
                    code: c.company_code || c.code,
                    modules: Array.isArray(mods) ? mods : [],
                    plan: c.subscription_plan || 'TRIAL'
                };
            });
            setCompanies(mapped);

            if (initialCompanyId) {
                const targetCompany = mapped.find((c: any) => String(c.id) === String(initialCompanyId));
                if (targetCompany) {
                    setSearchTerm(targetCompany.name);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load module data");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleModule = async (companyId: number, moduleId: string, currentModules: string[]) => {
        const toggleId = `${companyId}-${moduleId}`;
        setToggling(toggleId);

        try {
            const isEnabled = currentModules.includes(moduleId);
            let newModules;

            if (isEnabled) {
                newModules = currentModules.filter(m => m !== moduleId);
            } else {
                newModules = [...currentModules, moduleId];
            }

            // Optimistic Update
            setCompanies(prev => prev.map(c =>
                c.id === companyId ? { ...c, modules: newModules } : c
            ));

            // API Call
            // Note: Sending as array, assuming backend handles JSON string conversion if needed
            await platformService.updateCompany(companyId.toString(), {
                enabled_modules: newModules
            });

            const action = isEnabled ? "disabled" : "enabled";
            toast.success(`Module ${action} successfully`);

        } catch (error) {
            console.error(error);
            toast.error("Failed to update module");
            // Revert on error
            loadData();
        } finally {
            setToggling(null);
        }
    };

    const filtered = companies.filter(c =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate module stats
    const moduleStats = ALL_MODULES.map(module => ({
        ...module,
        activeCount: companies.filter(c => c.modules.includes(module.id)).length,
        percentage: companies.length > 0
            ? Math.round((companies.filter(c => c.modules.includes(module.id)).length / companies.length) * 100)
            : 0
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <Package className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Module Control</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            EMS Module Matrix
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Directly toggle EMS features for any tenant below
                        </p>
                    </div>
                </div>

                {/* Module Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {moduleStats.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${module.bgColor} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                    {module.icon}
                                </div>
                                <span className="text-xs font-semibold text-emerald-600">{module.percentage}%</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                                {module.activeCount}
                            </h3>
                            <p className="text-xs font-medium text-slate-500">
                                {module.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by company name or code..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Companies List */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0066FF] mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading module status...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                            {ALL_MODULES.map(m => (
                                                <th key={m.id} className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    <div className="flex flex-col items-center gap-1 group cursor-help" title={`Toggle ${m.label} for specific companies below`}>
                                                        <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{m.icon}</span>
                                                        <span>{m.label}</span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map(company => (
                                            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-bold">
                                                            {company.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{company.name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{company.plan} TIER</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {ALL_MODULES.map(m => {
                                                    const isEnabled = company.modules.includes(m.id);
                                                    const isloading = toggling === `${company.id}-${m.id}`;

                                                    return (
                                                        <td key={m.id} className="px-4 py-4 text-center">
                                                            <button
                                                                onClick={() => handleToggleModule(company.id, m.id, company.modules)}
                                                                disabled={isloading}
                                                                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 border-2 ${isloading ? 'scale-90 opacity-70 cursor-wait' : 'hover:scale-110 active:scale-95'
                                                                    } ${isEnabled
                                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                                                                        : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-slate-300'
                                                                    }`}
                                                                title={isEnabled ? `Disable ${m.label}` : `Enable ${m.label}`}
                                                            >
                                                                {isloading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : isEnabled ? (
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                ) : (
                                                                    <XCircle className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/ems/platform-admin/core/companies/${company.id}`}>
                                                        <button className="text-sm font-semibold text-slate-400 hover:text-[#0066FF] transition-colors p-2 hover:bg-slate-100 rounded-lg">
                                                            <Settings className="w-5 h-5" />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {filtered.map((company) => (
                                <div key={company.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-bold text-lg">
                                                {company.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{company.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{company.plan} TIER</p>
                                            </div>
                                        </div>
                                        <Link href={`/ems/platform-admin/core/companies/${company.id}`}>
                                            <button className="p-2 text-slate-400 hover:text-[#0066FF] hover:bg-slate-50 rounded-lg transition-colors">
                                                <Settings className="w-6 h-6" />
                                            </button>
                                        </Link>
                                    </div>

                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Tap to toggle modules
                                    </p>

                                    <div className="grid grid-cols-3 gap-2">
                                        {ALL_MODULES.map(module => {
                                            const isEnabled = company.modules.includes(module.id);
                                            const isloading = toggling === `${company.id}-${module.id}`;

                                            return (
                                                <button
                                                    key={module.id}
                                                    onClick={() => handleToggleModule(company.id, module.id, company.modules)}
                                                    disabled={isloading}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${isEnabled
                                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                                        : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    {isloading && (
                                                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                                            <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                                                        </div>
                                                    )}
                                                    <span className="text-2xl filter drop-shadow-sm">{module.icon}</span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isEnabled ? 'text-emerald-700' : 'text-slate-500'
                                                        }`}>
                                                        {module.label}
                                                    </span>
                                                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                                                        }`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No companies found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your search</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
