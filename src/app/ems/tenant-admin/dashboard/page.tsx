"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    Building2,
    Users,
    MapPin,
    TrendingUp,
    Loader2,
    UserPlus,
    Building,
    Layers,
    Settings as SettingsIcon,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Crown,
    TrendingDown,
    AlertCircle,
    Zap,
    Lock,
    Sparkles,
    AlertTriangle,
    ArrowRight,
    CalendarClock,
    Shield,
    BarChart3,
    Briefcase,
    Phone,
    MessageCircle,
    Mail,
    Star,
    Gift,
    ChevronRight,
    Package,
    Infinity,
    ShieldCheck
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";

interface Usage {
    users: number;
    employees: number;
    branches: number;
    departments: number;
    designations: number;
}

interface KPIStat {
    label: string;
    value: string | number;
    subtext: string;
    icon: any;
    color: string;
    bgColor: string;
    limit?: number;
    current?: number;
}

interface Company {
    id: string;
    name: string;
    code: string;
    email: string;
    subscription_plan?: string;
    subscription_status?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    max_users?: number;
    max_employees?: number;
    max_branches?: number;
    enabled_modules?: string[] | string;
    trial_started_at?: string;
    trial_expired?: boolean;
    is_active?: boolean;
}

interface BranchDetail {
    id: string;
    name: string;
    code: string;
    totalEmployees: number;
    departments: number;
}

const MODULE_INFO: Record<string, { name: string; icon: any; color: string; bgColor: string }> = {
    'EMS': { name: 'EMS Core', icon: Package, color: 'text-slate-600', bgColor: 'bg-slate-100' },    'ATTENDANCE': { name: 'Attendance', icon: Clock, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },    'LMS': { name: 'Learning Content', icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-100' },};

const PLAN_INFO: Record<string, {
    displayName: string;
    price: string;
    gradient: string;
    icon: any;
    supportType: string;
    supportIcon: any;
}> = {
    'TRIAL': {
        displayName: 'Trial Plan',
        price: 'Free for 30 days',
        gradient: 'from-slate-600 to-slate-700',
        icon: Gift,
        supportType: 'Email Support',
        supportIcon: Mail
    },
    'BASIC': {
        displayName: 'Basic Plan',
        price: '₹2,999/month',
        gradient: 'from-blue-600 to-blue-700',
        icon: Zap,
        supportType: 'Email Support',
        supportIcon: Mail
    },
    'STANDARD': {
        displayName: 'Standard Plan',
        price: '₹5,999/month',
        gradient: 'from-violet-600 to-violet-700',
        icon: Star,
        supportType: 'Priority Support',
        supportIcon: MessageCircle
    },
    'ENTERPRISE': {
        displayName: 'Enterprise Plan',
        price: '₹14,999/month',
        gradient: 'from-amber-500 to-amber-600',
        icon: Crown,
        supportType: '24/7 Phone Support',
        supportIcon: Phone
    },
};

const ALL_MODULES = ['EMS', 'LMS', 'ATTENDANCE', 'LIVE_CLASSES', 'ASSESSMENTS', 'MATERIALS'];

export default function CompanyAdminDashboard() {
    const [company, setCompany] = useState<Company | null>(null);
    const [branchSummaries, setBranchSummaries] = useState<BranchDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [myModules, setMyModules] = useState<string[]>([]);
    const [usage, setUsage] = useState<Usage>({ users: 0, employees: 0, branches: 0, departments: 0, designations: 0 });
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
    const [isTrialExpired, setIsTrialExpired] = useState(false);

    // Dynamic Feature Access
    const {
        enabledModules: subModules,
        company: subCompany,
        limits: subLimits,
        isLoading: isAccessLoading
    } = useFeatureAccess();

    useEffect(() => {
        if (!isAccessLoading && subCompany?.id !== undefined) {
            loadDashboardData(subCompany.id);
        }
    }, [isAccessLoading, subCompany?.id]);

    const loadDashboardData = async (targetCompanyId?: number) => {
        try {
            setLoading(true);

            const [branchesData, employeesData, departmentsData, designationsData, usageData] = await Promise.all([
                platformService.getBranches(),
                platformService.getEmployees(),
                platformService.getDepartments(),
                platformService.getDesignations(),
                platformService.getCompanyUsage(targetCompanyId?.toString())
            ]);

            console.log('[Dashboard] Loaded Data:', {
                targetCompanyId,
                branches: branchesData?.length,
                employees: employeesData?.length,
                usageData
            });

            // Dynamic Company Branding from Feature Access
            const currentCompany: Company = {
                id: String(subCompany?.id || 0),
                name: subCompany?.name || 'Workspace',
                subscription_plan: subCompany?.subscriptionPlan || 'TRIAL',
                subscription_status: subCompany?.subscriptionStatus || 'ACTIVE',
                ...usageData?.company // Blend with usage data if available
            };
            setCompany(currentCompany);

            // Use unified usage data from API with Self-Healing Fallback
            // If usage API says 0 but we fetched real items, trust the items
            const currentUsage: Usage = {
                users: usageData?.active_users || 0,
                employees: (usageData?.active_employees && usageData.active_employees > 0) ? usageData.active_employees : (employeesData?.length || usageData?.active_employees || 0),
                branches: (usageData?.active_branches && usageData.active_branches > 0) ? usageData.active_branches : (branchesData?.length || usageData?.active_branches || 0),
                departments: (usageData?.active_departments && usageData.active_departments > 0) ? usageData.active_departments : (departmentsData?.length || usageData?.active_departments || 0),
                designations: (usageData?.active_designations && usageData.active_designations > 0) ? usageData.active_designations : (designationsData?.length || usageData?.active_designations || 0)
            };
            setUsage(currentUsage);

            // Sync company record with latest usage limits for UI consistency
            if (currentCompany && usageData) {
                currentCompany.max_users = usageData.max_users ?? currentCompany.max_users;
                currentCompany.max_branches = usageData.max_branches ?? currentCompany.max_branches;
                currentCompany.max_employees = usageData.max_employees ?? currentCompany.max_employees;
            }

            // Parse Modules from company's enabled_modules field
            let activeModules: string[] = [];
            if (currentCompany?.enabled_modules) {
                if (Array.isArray(currentCompany.enabled_modules)) {
                    activeModules = currentCompany.enabled_modules;
                } else if (typeof currentCompany.enabled_modules === 'string') {
                    try { activeModules = JSON.parse(currentCompany.enabled_modules); } catch (e) { }
                }
            }
            setMyModules(activeModules);

            // Calculate Trial Days Left
            const planName = subCompany?.subscriptionPlan || 'TRIAL';
            if (planName === 'TRIAL' && usageData?.company?.subscription_start_date) {
                const startDate = new Date(usageData.company.subscription_start_date);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 30);
                const now = new Date();
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                setTrialDaysLeft(daysLeft);
                setIsTrialExpired(daysLeft <= 0 || currentCompany?.trial_expired === true);
            }

            // Get limits from company record - account for 0 (unlimited)
            const maxBranches = currentCompany?.max_branches !== undefined ? currentCompany.max_branches : 1;
            const maxUsers = currentCompany?.max_users !== undefined ? currentCompany.max_users : 10;

            // Prepare Branch Summaries
            const summaries: BranchDetail[] = branchesData.map((b: any) => {
                const branchEmployees = employeesData.filter((e: any) => String(e.branch_id) === String(b.id));
                const branchDepts = new Set(branchEmployees.map((e: any) => e.department_id)).size;
                return {
                    id: b.id,
                    name: b.name,
                    code: b.code,
                    totalEmployees: branchEmployees.length,
                    departments: branchDepts,
                };
            });
            setBranchSummaries(summaries);

            // Prepared summaries remain static in state as they are data-driven
            setBranchSummaries(summaries);

        } catch (error) {
            console.error("Dashboard error", error);
            toast.error("Failed to load dashboard metrics");
        } finally {
            setLoading(false);
        }
    };

    // 🚀 NEW: Reactive Stats Generation (Always Synced with Subscription Context)
    const stats = useMemo<KPIStat[]>(() => {
        if (!usage || !subLimits) return [];

        return [
            {
                label: "Branches",
                value: usage.branches,
                subtext: subLimits.maxBranches === 0 ? "Unlimited" : `of ${subLimits.maxBranches} allowed`,
                icon: MapPin,
                color: "text-blue-600",
                bgColor: "bg-blue-50",
                limit: subLimits.maxBranches || -1,
                current: usage.branches
            },
            {
                label: "Employees",
                value: usage.employees,
                subtext: subLimits.maxEmployees === 0 ? "Unlimited Team" : `of ${subLimits.maxEmployees} slots`,
                icon: Briefcase,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
                limit: subLimits.maxEmployees || -1,
                current: usage.employees
            },
            {
                label: "Departments",
                value: usage.departments,
                subtext: subLimits.maxDepartments === 0 ? "Unlimited" : `Max ${subLimits.maxDepartments} allowed`,
                icon: Layers,
                color: "text-violet-600",
                bgColor: "bg-violet-50",
                limit: subLimits.maxDepartments || -1,
                current: usage.departments
            },
            {
                label: "Designations",
                value: usage.designations,
                subtext: subLimits.maxDesignations === 0 ? "Unlimited" : `Max ${subLimits.maxDesignations} roles`,
                icon: ShieldCheck,
                color: "text-amber-600",
                bgColor: "bg-amber-50",
                limit: subLimits.maxDesignations || -1,
                current: usage.designations
            },
            {
                label: "Reports",
                value: "Active",
                subtext: "Operational Intelligence",
                icon: BarChart3,
                color: "text-rose-600",
                bgColor: "bg-rose-50"
            }
        ];
    }, [usage, subLimits]);

    const getUsagePercentage = (current: number, max: number): number => {
        if (max === 0 || max === -1) return 0; // Unlimited
        return Math.min(100, Math.round((current / max) * 100));
    };

    const isLimitReached = (current: number, max: number): boolean => {
        if (max === 0 || max === -1) return false; // Unlimited
        return current >= max;
    };

    const quickActions = [
        {
            label: "Add Branch",
            icon: Building,
            href: "/ems/tenant-admin/branches",
            color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
            disabled: company?.max_branches && company.max_branches > 0 && usage.branches >= company.max_branches,
            module: 'EMS'
        },
        {
            label: "Access Control",
            icon: UserPlus,
            href: "/ems/tenant-admin/access",
            color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
            disabled: false,
            module: 'EMS'
        },
        {
            label: "Departments",
            icon: Layers,
            href: "/ems/tenant-admin/settings?tab=DEPARTMENTS",
            color: "bg-violet-50 text-violet-600 hover:bg-violet-100",
            disabled: false,
            module: 'EMS'
        },
        {
            label: "Settings",
            icon: SettingsIcon,
            href: "/ems/tenant-admin/settings",
            color: "bg-slate-50 text-slate-600 hover:bg-slate-100",
            disabled: false
        }
    ].filter(action => !action.module || subModules.includes(action.module as any));

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Loading your workspace...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const planName = subCompany?.subscriptionPlan || company?.subscription_plan || 'TRIAL';
    const planInfo = PLAN_INFO[planName] || {
        displayName: planName === 'CUSTOM' ? 'Custom Enterprise' : 'Active Plan',
        price: 'Billed per selection',
        gradient: planName === 'CUSTOM' ? 'from-[#409891] to-[#2a6d68]' : 'from-[#0066FF] to-[#0052CC]',
        icon: planName === 'CUSTOM' ? Sparkles : Crown,
        supportType: 'Priority Support',
        supportIcon: MessageCircle
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12 px-4 md:px-0">

                {/* Trial Expired Banner */}
                {isTrialExpired && (
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Your Trial Has Expired</h3>
                                <p className="text-rose-100 text-sm">Upgrade now to continue using all features without interruption.</p>
                            </div>
                        </div>
                        <Link href="/ems/tenant-admin/subscription">
                            <button className="w-full md:w-auto bg-white text-rose-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                Upgrade Now
                            </button>
                        </Link>
                    </div>
                )}

                {/* Trial Warning Banner (< 7 days left) */}
                {!isTrialExpired && trialDaysLeft !== null && trialDaysLeft <= 7 && trialDaysLeft > 0 && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <CalendarClock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{trialDaysLeft} Days Left in Your Trial</h3>
                                <p className="text-amber-100 text-sm">Upgrade before your trial ends to avoid any service interruption.</p>
                            </div>
                        </div>
                        <Link href="/ems/tenant-admin/subscription">
                            <button className="w-full md:w-auto bg-white text-amber-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                                <Crown className="w-4 h-4" />
                                View Plans
                            </button>
                        </Link>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{company?.name || 'Company'} Workspace</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                                Welcome Back! 👋
                            </h1>
                            <button
                                onClick={() => loadDashboardData(subCompany?.id)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                                title="Refresh Dashboard Stats"
                            >
                                <svg className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Managing <span className="font-bold text-slate-900">{usage.branches}</span> location{usage.branches !== 1 ? 's' : ''} with <span className="font-bold text-slate-900">{usage.employees}</span> team members
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/ems/tenant-admin/access">
                            <button
                                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-600/25 hover:scale-105 active:scale-95"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Add Employee</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════
                    YOUR PLAN SECTION - Comprehensive Plan Details
                ═══════════════════════════════════════════════════════════════════ */}
                <div className={`bg-gradient-to-br ${planInfo.gradient} rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden`}>
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                    <div className="relative z-10">
                        {/* Header Row */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <planInfo.icon className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Your Plan
                                        </span>
                                        {company?.subscription_status === 'ACTIVE' && (
                                            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
                                                Active
                                            </span>
                                        )}
                                        {trialDaysLeft !== null && trialDaysLeft > 0 && (
                                            <span className="px-3 py-1 bg-amber-500/30 text-amber-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {trialDaysLeft} Days Left
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                                        {planInfo.displayName}
                                    </h2>
                                    <p className="text-lg font-bold text-white/80">{planInfo.price}</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/ems/tenant-admin/subscription">
                                    <button className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg">
                                        {planName === 'ENTERPRISE' ? (
                                            <>
                                                <SettingsIcon className="w-4 h-4" />
                                                Manage Plan
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                Upgrade Plan
                                            </>
                                        )}
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Plan Limits Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-white/60" />
                                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Users</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl md:text-3xl font-black">{usage.users}</span>
                                    <span className="text-sm text-white/60 mb-1">
                                        / {(subLimits?.maxUsers === 0 || subLimits?.maxUsers === undefined) ? '∞' : subLimits.maxUsers}
                                    </span>
                                </div>
                                {subLimits?.maxUsers && subLimits.maxUsers > 0 && (
                                    <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${getUsagePercentage(usage.users, subLimits.maxUsers) >= 100 ? 'bg-rose-400' : getUsagePercentage(usage.users, subLimits.maxUsers) >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                            style={{ width: `${Math.min(100, getUsagePercentage(usage.users, subLimits.maxUsers))}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4 text-white/60" />
                                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Branches</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl md:text-3xl font-black">{usage.branches}</span>
                                    <span className="text-sm text-white/60 mb-1">
                                        / {(subLimits?.maxBranches === 0 || subLimits?.maxBranches === undefined) ? '∞' : subLimits.maxBranches}
                                    </span>
                                </div>
                                {subLimits?.maxBranches && subLimits.maxBranches > 0 && (
                                    <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${getUsagePercentage(usage.branches, subLimits.maxBranches) >= 100 ? 'bg-rose-400' : getUsagePercentage(usage.branches, subLimits.maxBranches) >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                            style={{ width: `${Math.min(100, getUsagePercentage(usage.branches, subLimits.maxBranches))}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Briefcase className="w-4 h-4 text-white/60" />
                                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Employees</span>
                                </div>
                                <span className="text-2xl md:text-3xl font-black">{usage.employees}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <planInfo.supportIcon className="w-4 h-4 text-white/60" />
                                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Support</span>
                                </div>
                                <span className="text-sm md:text-base font-bold">{planInfo.supportType}</span>
                            </div>
                        </div>

                        {/* Modules Access */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Module Access
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {ALL_MODULES.map((mod) => {
                                    const info = MODULE_INFO[mod] || { name: mod, icon: Package, color: 'text-slate-600', bgColor: 'bg-slate-100' };
                                    const isEnabled = subModules.includes(mod as any);
                                    const IconComponent = info.icon;

                                    return (
                                        <div
                                            key={mod}
                                            className={`relative p-4 rounded-xl border transition-all ${isEnabled
                                                ? 'bg-white/20 border-white/30 backdrop-blur-sm'
                                                : 'bg-black/10 border-white/10 opacity-50'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center text-center gap-2">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-white/20' : 'bg-white/10'}`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-bold leading-tight">{info.name}</span>
                                            </div>
                                            {isEnabled ? (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center">
                                                    <Lock className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    {stats
                        .filter((stat: KPIStat) => {
                            if (stat.label === "Employees" || stat.label === "Departments" || stat.label === "Designations" || stat.label === "Reports") return subModules.includes('EMS' as any) || subModules.includes('LMS' as any);
                            return true;
                        })
                        .map((stat: KPIStat, idx: number) => {
                            const currentMax = stat.label === "Branches" ? subLimits?.maxBranches :
                                stat.label === "Employees" ? subLimits?.maxEmployees :
                                    stat.label === "Departments" ? subLimits?.maxDepartments :
                                        stat.label === "Designations" ? subLimits?.maxDesignations : 0;
                            const percentage = currentMax ? getUsagePercentage(stat.current || 0, currentMax) : 0;
                            const limitReached = currentMax ? isLimitReached(stat.current || 0, currentMax) : false;

                            return (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-2xl p-5 md:p-6 border ${limitReached ? 'border-rose-200' : 'border-slate-100'} hover:border-slate-200 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden`}
                                >
                                    {limitReached && (
                                        <div className="absolute top-3 right-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-600">
                                                <AlertCircle className="w-3 h-3" />
                                                LIMIT
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                                        {stat.value}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        {stat.label}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {stat.subtext}
                                    </p>

                                    {/* Usage Progress Bar */}
                                    {(stat.limit !== undefined && stat.limit > 0) && (
                                        <div className="mt-4">
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${percentage >= 100 ? 'bg-rose-500' :
                                                        percentage >= 80 ? 'bg-amber-500' :
                                                            'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, percentage)}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1.5 text-right">{percentage}% used</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {quickActions.map((action) => (
                            <Link key={action.label} href={action.disabled ? "#" : action.href}>
                                <div className={`relative overflow-hidden p-5 md:p-6 rounded-xl transition-all cursor-pointer group ${action.disabled
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                    : action.color
                                    }`}>
                                    {action.disabled && (
                                        <div className="absolute top-2 right-2">
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                                        <div className={`p-3 rounded-xl shadow-sm transition-transform ${action.disabled ? 'bg-slate-200' : 'bg-white group-hover:scale-110'}`}>
                                            <action.icon className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <span className="text-xs md:text-sm font-bold">{action.label}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Branch Overview - Only for HR/CORE subscribers */}
                {subModules.includes('CORE') && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-900">Branch Overview</h2>
                                <p className="text-xs text-slate-500 mt-1">Monitor all your locations</p>
                            </div>
                            <Link href="/ems/tenant-admin/branches">
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    View All
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Employees</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Departments</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {branchSummaries.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                                                        {b.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{b.name}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{b.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-700">{b.totalEmployees}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-700">{b.departments}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {branchSummaries.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-slate-400">No branches yet</p>
                                                <Link href="/ems/tenant-admin/branches">
                                                    <button className="mt-2 text-blue-600 font-semibold text-xs hover:underline">
                                                        Add First Branch
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {branchSummaries.map((b) => (
                                <div key={b.id} className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {b.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 text-sm">{b.name}</h4>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{b.code}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            Active
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-700">{b.totalEmployees} Staff</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Layers className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-700">{b.departments} Depts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {branchSummaries.length === 0 && (
                                <div className="p-8 text-center">
                                    <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-400">No branches yet</p>
                                    <Link href="/ems/tenant-admin/branches">
                                        <button className="mt-2 text-blue-600 font-semibold text-xs hover:underline">
                                            Add First Branch
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Upgrade CTA (if not Enterprise) */}
                {planName !== 'ENTERPRISE' && (
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6 md:p-8 border border-violet-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-violet-200 rounded-xl">
                                <Sparkles className="w-6 h-6 text-violet-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-violet-900 text-lg mb-1">Unlock More Features</h4>
                                <p className="text-sm text-violet-700 max-w-lg">
                                    Upgrade to unlock unlimited users, more branches, and premium EMS modules like live classes and assessments.
                                </p>
                            </div>
                        </div>
                        <Link href="/ems/tenant-admin/subscription">
                            <button className="w-full md:w-auto bg-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
                                Compare Plans
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
