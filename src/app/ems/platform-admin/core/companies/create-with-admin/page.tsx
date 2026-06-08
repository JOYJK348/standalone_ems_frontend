"use client";

import React, { useState, useEffect } from "react";
import {
    Building2,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Crown,
    Zap,
    Rocket,
    Star,
    Check,
    Globe,
    Mail,
    Phone,
    MapPin,
    Shield,
    Settings2,
    Database,
    X
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { platformService } from "@/services/platformService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomPlanBuilder from "@/components/platform/CustomPlanBuilder";
import ImageUpload from "@/components/ui/ImageUpload";

// SUBSCRIPTION_PLANS constant removed in favor of dynamic state

export default function CreateCompany() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatingCode, setGeneratingCode] = useState(false);

    // Dynamic Plans State
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const [formData, setFormData] = useState({
        company: {
            name: "",
            code: "",
            legal_name: "",
            email: "",
            phone: "",
            website: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            country: "India",
            postal_code: "",
            tax_id: "",
            pan_number: "",
            registration_number: "",
            subscription_plan: "TRIAL", // Default
            subscription_template_id: null as string | null, // Added for dynamic templates
            max_users: undefined,
            max_branches: undefined,
            max_departments: undefined, // specific limits if needed
            max_designations: undefined
        },
        admin: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    // Custom Plan Builder State
    const [customPlanConfig, setCustomPlanConfig] = useState<any>(null);
    const [menuRegistry, setMenuRegistry] = useState<any>(null);
    const [loadingMenus, setLoadingMenus] = useState(false);

    // Auto-generate code handled by debounced effect on name change


    // Fetch Subscription Templates
    useEffect(() => {
        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const templates = await platformService.getSubscriptionTemplates();

                // Map templates to UI format
                const mappedPlans = templates
                    .filter((t: any) => t.is_active && t.is_published) // Only show active & published
                    .map((t: any) => {
                        // Determine styling based on code/base_plan
                        let icon = Star;
                        let color = "from-indigo-500 to-indigo-600";
                        const code = t.code?.toUpperCase() || "";
                        const base = t.base_plan?.toUpperCase() || "";

                        if (code.includes('TRIAL') || base === 'TRIAL') {
                            icon = Zap;
                            color = "from-slate-500 to-slate-600";
                        } else if (code.includes('BASIC') || base === 'BASIC') {
                            icon = Star;
                            color = "from-blue-500 to-blue-600";
                        } else if (code.includes('STANDARD') || base === 'STANDARD') {
                            icon = Crown;
                            color = "from-violet-500 to-violet-600";
                        } else if (code.includes('ENTERPRISE') || base === 'ENTERPRISE') {
                            icon = Rocket;
                            color = "from-emerald-500 to-emerald-600";
                        }

                        return {
                            id: t.base_plan || t.code, // Use base_plan for ID to match backend logic, or code
                            template_id: t.id, // Store actual template ID
                            name: t.display_name,
                            price: t.monthly_price === 0 ? "Free" : `₹${Math.round(t.monthly_price).toLocaleString('en-IN')}`,
                            yearly_price: t.yearly_price ? `₹${Math.round(t.yearly_price).toLocaleString('en-IN')}` : null,
                            period: t.monthly_price === 0 ? t.trial_days + " days" : "per month",
                            description: t.description,
                            max_users: t.max_users ?? 0,
                            max_branches: t.max_branches ?? 0,
                            enabled_modules: t.enabled_modules || [],
                            icon: icon,
                            color: color,
                            popular: code.includes('STANDARD'),
                            // Filter out user/branch count strings from features array to avoid duplication with technical limits
                            features: (t.features || []).filter((f: string) =>
                                !f.toLowerCase().includes('user') &&
                                !f.toLowerCase().includes('branch')
                            )
                        };
                    });

                // Sort by price (Free first)
                mappedPlans.sort((a: any, b: any) => {
                    const priceA = a.price === "Free" ? 0 : parseFloat(a.price.replace(/[^\d.]/g, ''));
                    const priceB = b.price === "Free" ? 0 : parseFloat(b.price.replace(/[^\d.]/g, ''));
                    return priceA - priceB;
                });

                // Add Custom Plan Option
                mappedPlans.push({
                    id: "CUSTOM",
                    template_id: null,
                    name: "Custom Plan",
                    price: "Custom",
                    yearly_price: null,
                    period: "pricing",
                    description: "Configure exactly what you need",
                    icon: Settings2,
                    color: "from-amber-500 to-orange-600",
                    max_users: 0,
                    max_branches: 0,
                    enabled_modules: [],
                    features: ["Select specific modules", "Choose menus & sub-menus", "Set custom limits", "Tailored access control", "Flexible pricing"]
                });

                setPlans(mappedPlans);

                // Set default plan if needed
                if (mappedPlans.length > 0 && formData.company.subscription_plan === "TRIAL") {
                    // Start with the first plan (usually Trial)
                    const firstPlan = mappedPlans[0];
                    setFormData(prev => ({
                        ...prev,
                        company: {
                            ...prev.company,
                            subscription_plan: firstPlan.id,
                            subscription_template_id: firstPlan.template_id
                        }
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch plans", error);
                toast.error("Failed to load subscription plans");
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchPlans();
    }, []);

    // Load menu registry when CUSTOM plan is selected
    useEffect(() => {
        if (formData.company.subscription_plan === 'CUSTOM' && !menuRegistry) {
            loadMenuRegistry();
        }
    }, [formData.company.subscription_plan]);

    const loadMenuRegistry = async () => {
        try {
            setLoadingMenus(true);
            const data = await platformService.getMenuRegistry();
            setMenuRegistry(data);
        } catch (error) {
            console.error('Failed to load menu registry:', error);
            toast.error('Failed to load menu configuration');
        } finally {
            setLoadingMenus(false);
        }
    };

    const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [isManualCode, setIsManualCode] = useState(false);


    // 🚀 Professional Initials-Based Sequential ID Generator
    // Example: "Joy Solutions Private Limited" -> JSPL-001
    const generateSmartCode = async (name: string, force = false) => {
        if (!name || name.length < 2) return;
        if (!force && isManualCode) return; // Skip auto-generation if user manually edited the code

        try {
            setGeneratingCode(true);
            const companies = await platformService.getCompanies();

            // 1. Generate Prefix: Get initials of important words
            const ignoreWords = ['AND', 'OF', 'THE', 'A', 'FOR', 'WITH', 'IN', '&'];
            const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
            const words = cleanName.split(/\s+/).filter(w => w.length > 0 && !ignoreWords.includes(w.toUpperCase()));

            let prefix = "";
            if (words.length >= 2) {
                // Take 1st letter of each word
                prefix = words.map(w => w[0]).join('').substring(0, 6).toUpperCase();
            } else if (words.length === 1) {
                // Single word: take first 4 letters
                prefix = words[0].substring(0, 4).toUpperCase();
            } else {
                prefix = "CORP";
            }

            // 2. Scan DB for existing sequence for THIS prefix
            // We look for patterns like PREFIX-001, PREFIX-002
            let nextNum = 1;
            const prefixWithDash = `${prefix}-`;

            const existingNums = (companies || [])
                .filter((c: any) => {
                    const code = String(c.code || '').toUpperCase();
                    return code.startsWith(prefixWithDash);
                })
                .map((c: any) => {
                    const code = String(c.code || '').toUpperCase();
                    const parts = code.split('-');
                    const numPart = parts[parts.length - 1];
                    const n = parseInt(numPart);
                    return isNaN(n) ? 0 : n;
                })
                .filter((n: number) => n > 0);

            if (existingNums.length > 0) {
                nextNum = Math.max(...existingNums) + 1;
            }

            // 3. Format: PREFIX-001
            const finalCode = `${prefix}-${String(nextNum).padStart(3, '0')}`;

            setFormData(prev => ({
                ...prev,
                company: { ...prev.company, code: finalCode }
            }));
            setCodeStatus('available');

        } catch (error) {
            console.error("Failed to generate smart code", error);
        } finally {
            setGeneratingCode(false);
        }
    };

    // Debounced auto-generation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.company.name && !isManualCode) {
                generateSmartCode(formData.company.name);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.company.name, isManualCode]);

    const checkCodeAvailability = async (code: string) => {
        if (!code || code.length < 2) {
            setCodeStatus('idle');
            return;
        }

        try {
            setCodeStatus('checking');
            const companies = await platformService.getCompanies();
            const isTaken = companies.some((c: any) => String(c.code || '').toUpperCase() === code.toUpperCase());
            setCodeStatus(isTaken ? 'taken' : 'available');
        } catch (e) {
            setCodeStatus('idle');
        }
    };

    const handlePlanSelect = (plan: any) => {
        setFormData(prev => ({
            ...prev,
            company: {
                ...prev.company,
                subscription_plan: plan.id,
                subscription_template_id: plan.template_id
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Prepare payload
            const isCustomPlan = formData.company.subscription_plan === 'CUSTOM';

            const payload = {
                ...formData,
                company: {
                    ...formData.company,
                    country: formData.company.country || 'India',
                    // For custom plans, include the config; otherwise let backend use plan defaults
                    enabled_modules: isCustomPlan && customPlanConfig ? customPlanConfig.enabled_modules : undefined,
                    allowed_menu_ids: isCustomPlan && customPlanConfig ? customPlanConfig.allowed_menu_ids : undefined,
                    max_users: isCustomPlan && customPlanConfig ? customPlanConfig.max_users : undefined,
                    max_branches: isCustomPlan && customPlanConfig ? customPlanConfig.max_branches : undefined,
                    max_departments: isCustomPlan && customPlanConfig ? customPlanConfig.max_departments : undefined,
                    max_designations: isCustomPlan && customPlanConfig ? customPlanConfig.max_designations : undefined
                }
            };

            await platformService.registerEnterpriseWithAdmin(payload);
            toast.success("Company created successfully!", {
                description: `${formData.company.name} is now active on the platform.`
            });
            router.push("/ems/platform-admin/core/companies");
        } catch (error: any) {
            toast.error("Failed to create company", {
                description: error.response?.data?.error?.message || "Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) {
            // For custom plan, require at least one module to be selected
            if (formData.company.subscription_plan === 'CUSTOM') {
                return customPlanConfig && customPlanConfig.enabled_modules.length > 0;
            }
            return formData.company.subscription_plan;
        }
        if (currentStep === 2) return formData.company.name && formData.company.code && formData.company.email;
        if (currentStep === 3) return formData.admin.firstName && formData.admin.email && formData.admin.password;
        return false;
    };

    const steps = [
        { number: 1, title: "Choose Plan", icon: Crown },
        { number: 2, title: "Company Info", icon: Building2 },
        { number: 3, title: "Admin Setup", icon: Shield }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/ems/platform-admin/core/companies" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0066FF] transition-colors mb-3">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Companies</span>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Add New Company
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Create a new organization and set up the admin account
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 -z-10 hidden md:block">
                            <div
                                className="h-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>

                        {steps.map((step, idx) => (
                            <div key={step.number} className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep >= step.number
                                    ? 'bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <step.icon className="w-5 h-5" />
                                    )}
                                </div>
                                <p className={`text-xs md:text-sm font-semibold mt-2 ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                    {step.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {/* Step 1: Choose Plan */}
                    {currentStep === 1 && (
                        <div className="p-6 md:p-8">
                            <div className="mb-8">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                                    Choose Your Subscription Plan
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Select the plan that best fits your organization's needs
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {loadingPlans ? (
                                    // Loading Skeletons
                                    [1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-96 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse" />
                                    ))
                                ) : (
                                    plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => handlePlanSelect(plan)}
                                            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all hover:shadow-lg flex flex-col ${formData.company.subscription_plan === plan.id
                                                ? 'border-[#0066FF] shadow-lg shadow-[#0066FF]/10'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <span className="bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                        POPULAR
                                                    </span>
                                                </div>
                                            )}

                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                                <plan.icon className="w-6 h-6 text-white" />
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                                            <div className="mb-3">
                                                <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                                                {plan.period && (
                                                    <span className="text-sm text-slate-500 ml-1">/{plan.period}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 mb-4 min-h-[40px] leading-relaxed">{plan.description}</p>

                                            {plan.id !== 'CUSTOM' && (
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Users</p>
                                                        <p className="text-sm font-bold text-slate-700">{plan.max_users === 0 ? 'Unlimited' : plan.max_users}</p>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Branches</p>
                                                        <p className="text-sm font-bold text-slate-700">{plan.max_branches === 0 ? 'Unlimited' : plan.max_branches}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <ul className="space-y-2 mb-4 flex-1">
                                                {/* Core Modules Tags */}
                                                {plan.id !== 'CUSTOM' && plan.enabled_modules && plan.enabled_modules.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {plan.enabled_modules.slice(0, 3).map((mod: string) => (
                                                            <span key={mod} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                                                                {mod}
                                                            </span>
                                                        ))}
                                                        {plan.enabled_modules.length > 3 && (
                                                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1 py-0.5 rounded-full">
                                                                +{plan.enabled_modules.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {(plan.features || []).map((feature: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {plan.yearly_price && (
                                                <div className="pt-3 border-t border-slate-100 mt-auto">
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        OR {plan.yearly_price} Yearly
                                                    </p>
                                                </div>
                                            )}

                                            {formData.company.subscription_plan === plan.id && (
                                                <div className="absolute top-4 right-4 animate-scale-in">
                                                    <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Custom Plan Configuration */}
                            {formData.company.subscription_plan === 'CUSTOM' && (
                                <div className="mt-8 border-t border-slate-100 pt-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <Settings2 className="w-5 h-5 text-amber-500" />
                                        Configure Your Custom Plan
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">
                                        Select the modules, menus, and limits for this company
                                    </p>

                                    {loadingMenus ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                            <span className="ml-3 text-slate-600">Loading menu configuration...</span>
                                        </div>
                                    ) : menuRegistry ? (
                                        <CustomPlanBuilder
                                            modules={menuRegistry.modules || []}
                                            coreMenus={menuRegistry.coreMenus || []}
                                            onConfigChange={(config) => setCustomPlanConfig(config)}
                                            initialConfig={customPlanConfig || undefined}
                                        />
                                    ) : (
                                        <div className="text-center py-12 text-slate-500">
                                            <p>Failed to load menu configuration.</p>
                                            <button
                                                onClick={loadMenuRegistry}
                                                className="mt-2 text-sm text-blue-600 hover:underline"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Company Information */}
                    {currentStep === 2 && (
                        <div className="p-6 md:p-8">
                            <div className="mb-8">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                                    Company Information
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Enter your organization's details
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Company Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., Acme Corporation"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.name}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-3.5 h-3.5 text-[#0066FF]" />
                                            <span>Company Code *</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); generateSmartCode(formData.company.name, true); }}
                                            className="text-[10px] text-[#0066FF] hover:bg-blue-50 px-2 py-1 rounded-md font-bold transition-colors flex items-center gap-1 border border-blue-100"
                                            disabled={generatingCode || !formData.company.name}
                                        >
                                            <Zap className="w-3 h-3" />
                                            Smart Generate
                                        </button>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. DIPL"
                                            className={`w-full bg-slate-50 border ${codeStatus === 'taken' ? 'border-red-300 ring-2 ring-red-50' : codeStatus === 'available' ? 'border-emerald-300 ring-2 ring-emerald-50' : 'border-slate-200'} rounded-xl py-4 px-5 text-base font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-[#0066FF]/10 focus:border-[#0066FF] transition-all uppercase placeholder:font-normal placeholder:tracking-normal`}
                                            value={formData.company.code}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                setIsManualCode(true); // Flag as manual edit
                                                setFormData({ ...formData, company: { ...formData.company, code: val } });
                                                checkCodeAvailability(val);
                                            }}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {generatingCode || codeStatus === 'checking' ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                                            ) : codeStatus === 'available' ? (
                                                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-scale-in">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Verified Unique
                                                </div>
                                            ) : codeStatus === 'taken' ? (
                                                <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-shake">
                                                    <X className="w-3.5 h-3.5" />
                                                    Already Exists
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">System Identity: Permanent & Non-Reusable</p>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Legal Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full registered business name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.legal_name}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, legal_name: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        Email Address *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="contact@company.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.email}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, email: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 ..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.phone}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, phone: e.target.value } })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5" />
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://www.company.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.website}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, website: e.target.value } })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Street address, building, floor"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.address_line1}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, address_line1: e.target.value } })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Address Line 2</label>
                                    <input
                                        type="text"
                                        placeholder="Apartment, suite, unit, etc."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.address_line2}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, address_line2: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">City</label>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.city}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, city: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">State</label>
                                    <input
                                        type="text"
                                        placeholder="State"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.state}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, state: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Postal Code</label>
                                    <input
                                        type="text"
                                        placeholder="Postal code"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.postal_code}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, postal_code: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Country</label>
                                    <input
                                        type="text"
                                        placeholder="Country"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.country}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, country: e.target.value } })}
                                    />
                                </div>

                                <div className="md:col-span-2 border-t border-slate-100 my-2 pt-4">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4">Registration & Tax Details</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">GSTIN / Tax ID</label>
                                    <input
                                        type="text"
                                        placeholder="GST Number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.tax_id}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, tax_id: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">PAN Number</label>
                                    <input
                                        type="text"
                                        placeholder="PAN Number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.pan_number}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, pan_number: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Registration Number</label>
                                    <input
                                        type="text"
                                        placeholder="Company Registration No."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                        value={formData.company.registration_number}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, registration_number: e.target.value } })}
                                    />
                                </div>

                                <div className="md:col-span-2 border-t border-slate-100 my-2 pt-4">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4">Branding & Appearance</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUpload
                                        label="Company Logo"
                                        value={(formData.company as any).branding?.logo_url || ''}
                                        onChange={(url) => setFormData({
                                            ...formData,
                                            company: {
                                                ...formData.company,
                                                branding: { ...((formData.company as any).branding || {}), logo_url: url }
                                            } as any
                                        })}
                                    />

                                    <ImageUpload
                                        label="Favicon"
                                        value={(formData.company as any).branding?.favicon_url || ''}
                                        onChange={(url) => setFormData({
                                            ...formData,
                                            company: {
                                                ...formData.company,
                                                branding: { ...((formData.company as any).branding || {}), favicon_url: url }
                                            } as any
                                        })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                                            value={(formData.company as any).branding?.primary_color || '#0066FF'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                company: {
                                                    ...formData.company,
                                                    branding: { ...((formData.company as any).branding || {}), primary_color: e.target.value }
                                                } as any
                                            })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="#0066FF"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all uppercase"
                                            value={(formData.company as any).branding?.primary_color || '#0066FF'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                company: {
                                                    ...formData.company,
                                                    branding: { ...((formData.company as any).branding || {}), primary_color: e.target.value }
                                                } as any
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Secondary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                                            value={(formData.company as any).branding?.secondary_color || '#0052CC'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                company: {
                                                    ...formData.company,
                                                    branding: { ...((formData.company as any).branding || {}), secondary_color: e.target.value }
                                                } as any
                                            })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="#0052CC"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all uppercase"
                                            value={(formData.company as any).branding?.secondary_color || '#0052CC'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                company: {
                                                    ...formData.company,
                                                    branding: { ...((formData.company as any).branding || {}), secondary_color: e.target.value }
                                                } as any
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Accent Color (Highlights)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer"
                                            value={(formData.company as any).branding?.accent_color || '#00C853'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                company: {
                                                    ...formData.company,
                                                    branding: { ...((formData.company as any).branding || {}), accent_color: e.target.value }
                                                } as any
                                            })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="#00C853"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all uppercase"
                                            value={(formData.company as any).branding?.accent_color || '#00C853'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                company: {
                                                    ...formData.company,
                                                    branding: { ...((formData.company as any).branding || {}), accent_color: e.target.value }
                                                } as any
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Admin Setup */}
                    {currentStep === 3 && (
                        <div className="p-6 md:p-8">
                            <div className="mb-8">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                                    Admin Account Setup
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Create the primary administrator account for this company
                                </p>
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl p-8 text-white mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Company Administrator</h3>
                                            <p className="text-xs text-white/80">Full access to all company features</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">First Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                            value={formData.admin.firstName}
                                            onChange={(e) => setFormData({ ...formData, admin: { ...formData.admin, firstName: e.target.value } })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">Last Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                            value={formData.admin.lastName}
                                            onChange={(e) => setFormData({ ...formData, admin: { ...formData.admin, lastName: e.target.value } })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="admin@company.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                            value={formData.admin.email}
                                            onChange={(e) => setFormData({ ...formData, admin: { ...formData.admin, email: e.target.value } })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-semibold text-slate-700">Password *</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="Create a strong password"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                                            value={formData.admin.password}
                                            onChange={(e) => setFormData({ ...formData, admin: { ...formData.admin, password: e.target.value } })}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Minimum 8 characters recommended</p>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <p className="text-xs text-blue-900 leading-relaxed">
                                        <strong>Note:</strong> This user will have full administrative access to manage all aspects of {formData.company.name || "the company"}, including users, branches, and settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-6 py-3 rounded-xl font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden md:inline">Previous</span>
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={!canProceed()}
                            className="px-6 md:px-8 py-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                        >
                            <span>Continue</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className="px-6 md:px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Create Company</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
