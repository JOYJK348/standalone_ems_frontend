"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    MapPin,
    Mail,
    Phone,
    Loader2,
    Save,
    CheckCircle2,
    Shield,
    Users,
    CalendarCheck,
    Wallet,
    Handshake,
    GraduationCap,
    CircleDollarSign,
    Check,
    ChevronDown,
    ChevronRight,
    Crown,
    Settings2,
    User,
    Lock,
    Zap,
    Fingerprint,
    Globe,
    Building,
    Layers,
    Key,
    Plus,
    X,
    UserPlus,
    ShieldCheck
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";

interface Menu {
    id: number;
    menu_key: string;
    menu_name: string;
    display_name: string;
    icon?: string;
    children?: Menu[];
}

interface Module {
    key: string;
    name: string;
    description: string;
    menus: Menu[];
}

interface BranchAdmin {
    id: string;
    type: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
    EMS: GraduationCap,
    LMS: GraduationCap,
    ATTENDANCE: Shield,
    LIVE_CLASSES: GraduationCap,
    ASSESSMENTS: Shield,
    MATERIALS: GraduationCap
};

const ALL_ADMIN_TYPES = [
    { id: 'BRANCH_ADMIN', name: 'Branch Admin', description: 'Full branch access', module: 'EMS' },
    { id: 'ACADEMIC_MANAGER', name: 'Academic Manager', description: 'Courses, batches and learning workflow', module: 'LMS' },
    { id: 'TUTOR', name: 'Tutor Coordinator', description: 'Tutor and learner support', module: 'LMS' },
    { id: 'BACKOFFICE_ADMIN', name: 'Back Office Admin', description: 'Operations management', module: 'EMS' }
];

export default function CreateBranchPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { enabledModules, accessibleMenuIds, isPlatformAdmin } = useFeatureAccess();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingModules, setLoadingModules] = useState(true);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        branch_type: "BRANCH",
        is_head_office: false,
        email: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        country: "India",
        postal_code: ""
    });

    // Module Configuration State
    const [modules, setModules] = useState<Module[]>([]);
    const [coreMenus, setCoreMenus] = useState<Menu[]>([]);
    const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
    const [selectedMenus, setSelectedMenus] = useState<Set<number>>(new Set());
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Branch Admins
    const [branchAdmins, setBranchAdmins] = useState<BranchAdmin[]>([]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState<BranchAdmin>({
        id: '',
        type: 'BRANCH_ADMIN',
        email: '',
        firstName: '',
        lastName: '',
        password: ''
    });

    // 🚀 NEW: Reactive Filtering for Modules (Handles race condition with context)
    const displayedModules = useMemo(() => {
        if (!modules || modules.length === 0) return [];

        // 1. Filter modules based on company's subscription
        let filtered = isPlatformAdmin
            ? modules
            : modules.filter((mod: Module) => {
                // Show module if it's in the enabled list OR if it's a CORE module
                return enabledModules.includes(mod.key as any);
            });

        // 2. For branch creation, Company Admins should see ALL subscribed modules
        // Don't filter by accessibleMenuIds here - that's for the user's own access
        // When creating a branch, they're configuring what the BRANCH can access

        return filtered;
    }, [modules, enabledModules, isPlatformAdmin]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoadingModules(true);

            // Load menu registry
            const menuData = await platformService.getMenuRegistry();
            if (menuData) {
                setModules(menuData.modules || []);
                setCoreMenus(menuData.coreMenus || []);
            }

            // Generate next branch code
            const branches = await platformService.getBranches();
            let nextNum = 1;
            const prefix = "BR";
            if (branches && branches.length > 0) {
                const existingNums = branches
                    .map((b: any) => {
                        const match = b.code?.match(/(\d+)$/);
                        return match ? parseInt(match[0]) : 0;
                    })
                    .filter((n: number) => !isNaN(n));
                if (existingNums.length > 0) {
                    nextNum = Math.max(...existingNums) + 1;
                }
            }
            setFormData(prev => ({ ...prev, code: `${prefix}-${String(nextNum).padStart(3, '0')}` }));

        } catch (error) {
            console.error("Failed to load initial data", error);
            toast.error("Failed to load configuration");
        } finally {
            setLoadingModules(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Module toggle
    const toggleModule = (moduleKey: string) => {
        const newSelected = new Set(selectedModules);
        const module = modules.find(m => m.key === moduleKey);

        if (newSelected.has(moduleKey)) {
            newSelected.delete(moduleKey);
            if (module) {
                const removeMenuIds = (menus: Menu[]) => {
                    menus.forEach(menu => {
                        selectedMenus.delete(menu.id);
                        if (menu.children) removeMenuIds(menu.children);
                    });
                };
                removeMenuIds(module.menus);
                setSelectedMenus(new Set(selectedMenus));
            }
        } else {
            newSelected.add(moduleKey);
            if (module) {
                const addMenuIds = (menus: Menu[]) => {
                    menus.forEach(menu => {
                        selectedMenus.add(menu.id);
                        if (menu.children) addMenuIds(menu.children);
                    });
                };
                addMenuIds(module.menus);
                setSelectedMenus(new Set(selectedMenus));
            }
        }
        setSelectedModules(newSelected);
    };

    const toggleMenu = (menuId: number, moduleKey: string) => {
        const newSelected = new Set(selectedMenus);
        if (newSelected.has(menuId)) {
            newSelected.delete(menuId);
        } else {
            newSelected.add(menuId);
            if (!selectedModules.has(moduleKey)) {
                setSelectedModules(new Set([...selectedModules, moduleKey]));
            }
        }
        setSelectedMenus(newSelected);
    };

    const toggleExpanded = (moduleKey: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleKey)) newExpanded.delete(moduleKey);
        else newExpanded.add(moduleKey);
        setExpandedModules(newExpanded);
    };

    const addBranchAdmin = () => {
        if (!newAdmin.email || !newAdmin.firstName || !newAdmin.password || newAdmin.password.length < 8) {
            toast.error("Please complete all required fields (min 8 char password)");
            return;
        }
        setBranchAdmins(prev => [...prev, { ...newAdmin, id: Date.now().toString() }]);
        setNewAdmin({ id: '', type: 'BRANCH_ADMIN', email: '', firstName: '', lastName: '', password: '' });
        setShowAddAdmin(false);
        toast.success("Admin added to branch configuration");
    };

    const removeBranchAdmin = (id: string) => {
        setBranchAdmins(prev => prev.filter(a => a.id !== id));
    };

    const renderMenuTree = (menus: Menu[], moduleKey: string, depth = 0) => {
        return menus.map(menu => (
            <div key={menu.id} style={{ marginLeft: depth * 16 }}>
                <label className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-xl cursor-pointer group transition-all">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedMenus.has(menu.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                        {selectedMenus.has(menu.id) && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedMenus.has(menu.id)} onChange={() => toggleMenu(menu.id, moduleKey)} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{menu.display_name || menu.menu_name}</span>
                </label>
                {menu.children && menu.children.length > 0 && (
                    <div className="ml-4 border-l-2 border-slate-100">
                        {renderMenuTree(menu.children, moduleKey, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                enabled_modules: Array.from(selectedModules),
                allowed_menu_ids: Array.from(selectedMenus),
                admins: branchAdmins.map(a => ({
                    type: a.type,
                    email: a.email,
                    first_name: a.firstName,
                    last_name: a.lastName,
                    password: a.password
                }))
            };

            await platformService.createBranch(payload);
            toast.success("Branch created successfully", {
                description: `${formData.name} is now operational`
            });
            router.push("/ems/tenant-admin/branches");
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || "Branch creation failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) return formData.name && formData.code && formData.city;
        if (currentStep === 2) return selectedModules.size > 0;
        if (currentStep === 3) return true;
        return false;
    };

    const steps = [
        { number: 1, title: "Branch Identity", icon: Building2 },
        { number: 2, title: "Module Access", icon: Layers },
        { number: 3, title: "Branch Admins", icon: Shield }
    ];

    if (loadingModules) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto pb-24 px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex items-start gap-4">
                        <Link
                            href="/ems/tenant-admin/branches"
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Provision New Branch</h1>
                            <p className="text-slate-500 font-medium mt-1">Configure operational unit with module access</p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 mb-8 shadow-sm">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 -z-10 hidden md:block">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>

                        {steps.map(step => (
                            <div key={step.number} className="flex flex-col items-center flex-1">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${currentStep >= step.number
                                    ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle2 size={24} />
                                    ) : (
                                        <step.icon size={22} />
                                    )}
                                </div>
                                <p className={`text-xs font-black uppercase tracking-widest mt-3 ${currentStep >= step.number ? 'text-blue-700' : 'text-slate-400'}`}>
                                    {step.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content Area */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

                    {/* STEP 1: Branch Identity */}
                    {currentStep === 1 && (
                        <div className="p-8 md:p-12">
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Branch Identity & Location</h2>
                                <p className="text-slate-500 font-medium">Define the core identity and physical attributes</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left: Core Info */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Name *</label>
                                        <input
                                            name="name" value={formData.name} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                            placeholder="e.g., Chennai Central Office"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Code</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    name="code" value={formData.code} readOnly
                                                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 pl-11 pr-5 text-sm font-black text-blue-600 uppercase font-mono cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Type</label>
                                            <select
                                                name="branch_type" value={formData.branch_type} onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="BRANCH">Standard Branch</option>
                                                <option value="WAREHOUSE">Warehouse</option>
                                                <option value="OFFICE">Office</option>
                                                <option value="STORE">Retail Store</option>
                                                <option value="FACTORY">Factory</option>
                                            </select>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group hover:border-amber-200 transition-all">
                                        <input
                                            type="checkbox"
                                            name="is_head_office"
                                            checked={formData.is_head_office}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-amber-500 border-2 rounded-lg focus:ring-amber-500"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Crown size={16} className="text-amber-500" /> Mark as Head Office
                                            </p>
                                            <p className="text-xs text-slate-500">Primary headquarters for this company</p>
                                        </div>
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    name="email" value={formData.email} onChange={handleChange}
                                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-11 pr-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="branch@company.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    name="phone" value={formData.phone} onChange={handleChange}
                                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-11 pr-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="+91 000 000 0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Location */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address Line 1</label>
                                        <textarea
                                            name="address_line1" value={formData.address_line1} onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                                            rows={2}
                                            placeholder="Street address..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City *</label>
                                            <input
                                                name="city" value={formData.city} onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                placeholder="Chennai"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                                            <input
                                                name="state" value={formData.state} onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                placeholder="Tamil Nadu"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Country</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    name="country" value={formData.country} onChange={handleChange}
                                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-11 pr-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postal Code</label>
                                            <input
                                                name="postal_code" value={formData.postal_code} onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold font-mono focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                placeholder="600001"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Module Access */}
                    {currentStep === 2 && (
                        <div className="p-8 md:p-12">
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Module Access Configuration</h2>
                                <p className="text-slate-500 font-medium">Select which modules and menus this branch can access</p>

                                {/* Debug Info */}
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-blue-900 mb-1">Your Subscription Modules:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {enabledModules.length > 0 ? (
                                                    enabledModules.map(mod => (
                                                        <span key={mod} className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">
                                                            {mod}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-blue-600">No modules enabled</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">
                                                Showing {displayedModules.length} of {modules.length} total modules
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                                        >
                                            🔄 Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Module Grid */}
                            <div className="mb-8">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">1</span>
                                    Select Modules
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {displayedModules.map((mod: Module) => {
                                        const Icon = MODULE_ICONS[mod.key] || Users;
                                        const isSelected = selectedModules.has(mod.key);
                                        return (
                                            <div
                                                key={mod.key}
                                                onClick={() => toggleModule(mod.key)}
                                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>
                                                        {isSelected && <Check size={14} className="stroke-[3]" />}
                                                    </div>
                                                </div>
                                                <p className={`text-sm font-black ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{mod.name}</p>
                                                <p className="text-[11px] text-slate-500 mt-1">{mod.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Menu Access */}
                            {selectedModules.size > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">2</span>
                                        Configure Menu Access
                                    </h3>
                                    <div className="space-y-4">
                                        {displayedModules.filter((mod: Module) => selectedModules.has(mod.key)).map((mod: Module) => {
                                            const Icon = MODULE_ICONS[mod.key] || Users;
                                            const isExpanded = expandedModules.has(mod.key);
                                            return (
                                                <div key={mod.key} className="border border-slate-200 rounded-2xl overflow-hidden">
                                                    <div
                                                        onClick={() => toggleExpanded(mod.key)}
                                                        className="flex items-center justify-between p-5 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-all"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                                            <Icon className="w-5 h-5 text-blue-600" />
                                                            <span className="font-bold text-slate-800">{mod.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {mod.menus.filter(m => selectedMenus.has(m.id)).length} / {mod.menus.length} menus
                                                        </span>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="p-5 bg-white border-t border-slate-100">
                                                            {renderMenuTree(mod.menus, mod.key)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Branch Admins */}
                    {currentStep === 3 && (
                        <div className="p-8 md:p-12">
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Branch Administration</h2>
                                <p className="text-slate-500 font-medium">Assign specialized admins to manage this branch</p>
                            </div>

                            {/* Add Admin Button */}
                            {!showAddAdmin && (
                                <button
                                    onClick={() => setShowAddAdmin(true)}
                                    className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-3 mb-8"
                                >
                                    <UserPlus size={20} />
                                    <span className="font-bold">Add Branch Administrator</span>
                                </button>
                            )}

                            {/* Add Admin Form */}
                            {showAddAdmin && (
                                <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-slate-900">New Administrator</h3>
                                        <button onClick={() => setShowAddAdmin(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Type *</label>
                                            <select
                                                value={newAdmin.type}
                                                onChange={(e) => setNewAdmin(prev => ({ ...prev, type: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                {ALL_ADMIN_TYPES
                                                    .filter(t => t.module === 'CORE' || enabledModules.includes(t.module as any))
                                                    .map(t => (
                                                        <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email *</label>
                                            <input
                                                type="email"
                                                value={newAdmin.email}
                                                onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                placeholder="admin@branch.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name *</label>
                                            <input
                                                value={newAdmin.firstName}
                                                onChange={(e) => setNewAdmin(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                                            <input
                                                value={newAdmin.lastName}
                                                onChange={(e) => setNewAdmin(prev => ({ ...prev, lastName: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                placeholder="Doe"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Password *</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="password"
                                                    value={newAdmin.password}
                                                    onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-11 pr-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 pl-1">Min 8 characters. User will be prompted to change on first login.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={addBranchAdmin}
                                        disabled={!newAdmin.email || !newAdmin.firstName || !newAdmin.password || newAdmin.password.length < 8}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={18} /> Add Administrator
                                    </button>
                                </div>
                            )}

                            {/* Added Admins List */}
                            {branchAdmins.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Configured Administrators ({branchAdmins.length})</h4>
                                    {branchAdmins.map(admin => (
                                        <div key={admin.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-xl flex items-center justify-center font-black">
                                                    {admin.firstName[0]}{admin.lastName?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{admin.firstName} {admin.lastName}</p>
                                                    <p className="text-xs text-slate-500">{admin.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                                    {ALL_ADMIN_TYPES.find((t: any) => t.id === admin.type)?.name || admin.type}
                                                </span>
                                                <button onClick={() => removeBranchAdmin(admin.id)} className="p-2 text-slate-400 hover:text-rose-600">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {branchAdmins.length === 0 && !showAddAdmin && (
                                <div className="text-center py-16 text-slate-400">
                                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-bold">No administrators configured</p>
                                    <p className="text-sm">You can add specific role-based admins for this branch</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            disabled={currentStep === 1}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <ArrowLeft size={18} /> Previous
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                disabled={!canProceed()}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Provision Branch
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
