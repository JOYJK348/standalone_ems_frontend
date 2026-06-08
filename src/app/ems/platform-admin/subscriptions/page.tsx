"use client";

import React, { useState, useEffect } from "react";
import {
    CreditCard,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    IndianRupee,
    Shield,
    Zap,
    Building,
    Users,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    Activity,
    Package,
    ArrowUpRight,
    TrendingUp,
    Globe,
    Loader2,
    Settings,
    Layers
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import CustomPlanBuilder from "@/components/platform/CustomPlanBuilder";

interface SubscriptionTemplate {
    id: string;
    code: string;
    name: string;
    display_name: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    features: string[]; // Marketing features

    // Technical Config
    max_users: number;
    max_employees: number;
    max_branches: number;
    max_departments: number;
    max_designations: number;
    enabled_modules: string[];
    allowed_menu_ids: number[];

    is_active: boolean;
    is_published: boolean;
}

export default function SubscriptionManagement() {
    const [templates, setTemplates] = useState<SubscriptionTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Menu Registry for Builder
    const [menuRegistry, setMenuRegistry] = useState<any>(null);
    const [isLoadingMenus, setIsLoadingMenus] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<SubscriptionTemplate | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'config'>('details');

    const [formData, setFormData] = useState<Partial<SubscriptionTemplate>>({
        code: "",
        name: "", // Internal name
        display_name: "",
        description: "",
        monthly_price: 0,
        yearly_price: 0,
        features: [], // Marketing list
        max_users: 10,
        max_branches: 1,
        max_employees: 10,
        max_departments: 5,
        max_designations: 5,
        enabled_modules: [],
        allowed_menu_ids: [],
        is_active: true,
        is_published: true
    });

    // Feature Tag State
    const [newFeature, setNewFeature] = useState("");

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await platformService.getSubscriptionTemplates();
            setTemplates(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load subscription tiers");
        } finally {
            setIsLoading(false);
        }
    };

    const loadMenuRegistry = async () => {
        if (menuRegistry) return;
        setIsLoadingMenus(true);
        try {
            const data = await platformService.getMenuRegistry();
            setMenuRegistry(data);
        } catch (error) {
            console.error("Failed to load menu registry", error);
        } finally {
            setIsLoadingMenus(false);
        }
    };

    useEffect(() => {
        loadTemplates();
        loadMenuRegistry();
    }, []);

    const handleOpenModal = (template?: SubscriptionTemplate) => {
        setActiveTab('details');
        if (template) {
            setEditingTemplate(template);
            setFormData({
                ...template,
                // Ensure arrays are initialized
                features: template.features || [],
                enabled_modules: template.enabled_modules || [],
                allowed_menu_ids: template.allowed_menu_ids || []
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                code: `PLAN-${Date.now()}`, // Auto-generate code
                name: "",
                display_name: "",
                description: "",
                monthly_price: 0,
                yearly_price: 0,
                features: ["Standard Support"],
                max_users: 10,
                max_branches: 1,
                max_employees: 10,
                max_departments: 5,
                max_designations: 5,
                enabled_modules: ["CORE", "HR"],
                allowed_menu_ids: [],
                is_active: true,
                is_published: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        const currentFeatures = formData.features || [];
        if (currentFeatures.includes(newFeature.trim())) {
            toast.error("Feature already exists");
            return;
        }
        setFormData({ ...formData, features: [...currentFeatures, newFeature.trim()] });
        setNewFeature("");
    };

    const handleRemoveFeature = (index: number) => {
        const currentFeatures = [...(formData.features || [])];
        currentFeatures.splice(index, 1);
        setFormData({ ...formData, features: currentFeatures });
    };

    const handleConfigChange = (config: any) => {
        setFormData(prev => ({
            ...prev,
            enabled_modules: config.enabled_modules,
            allowed_menu_ids: config.allowed_menu_ids,
            max_users: config.max_users,
            max_branches: config.max_branches,
            max_departments: config.max_departments,
            max_designations: config.max_designations
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate
            if (!formData.name || !formData.display_name) {
                toast.error("Please fill in basic plan details first.");
                setActiveTab('details');
                return;
            }

            if (editingTemplate) {
                await platformService.updateSubscriptionTemplate(editingTemplate.id, formData);
                toast.success("Plan updated successfully");
            } else {
                await platformService.createSubscriptionTemplate(formData);
                toast.success("New plan created");
            }
            handleCloseModal();
            loadTemplates();
        } catch (error: any) {
            toast.error(error.message || "Failed to save plan");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this plan? This cannot be undone.")) return;
        try {
            await platformService.deleteSubscriptionTemplate(id);
            toast.success("Plan deleted");
            loadTemplates();
        } catch (error) {
            toast.error("Failed to delete plan. It might be in use.");
        }
    };

    const formatINR = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const filteredTemplates = templates.filter(p =>
        (p.display_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-3">
                            <CreditCard className="w-3.5 h-3.5 text-[#0066FF]" />
                            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Revenue & Tiers</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Subscription Tiers
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Manage enterprise plans, access control, and service limits
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#0066FF]/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Plan</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Active Plans", value: templates.filter(p => p.is_active).length, icon: Package, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
                        { label: "Pricing Model", value: "INR / Mo", icon: IndianRupee, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
                        { label: "Total Tiers", value: templates.length, icon: Activity, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-50", textColor: "text-violet-600" },
                        { label: "Published", value: templates.filter(p => p.is_published).length, icon: Globe, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50", textColor: "text-amber-600" },
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

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by plan name..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Plan Cards Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[400px] bg-white rounded-3xl border border-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No Subscription Plans Found</h3>
                        <p className="text-slate-500 text-sm mt-1">Create your first plan to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm p-6 md:p-8 flex flex-col relative group hover:border-[#0066FF]/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
                            >
                                {/* Actions */}
                                <div className="absolute top-6 right-6 flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(plan)}
                                        className="p-2 text-slate-400 hover:text-[#0066FF] hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">{plan.display_name}</h3>
                                        {!plan.is_active && (
                                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase rounded-md border border-rose-100">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CODE: {plan.code}</p>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6 pb-6 border-b border-slate-50">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-slate-900 tracking-tighter">{formatINR(plan.monthly_price)}</span>
                                        <span className="text-slate-400 font-semibold text-sm">/mo</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-emerald-600 mt-1 uppercase">OR {formatINR(plan.yearly_price)} Yearly</p>
                                </div>

                                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium line-clamp-2 min-h-[40px]">
                                    {plan.description || "No description provided."}
                                </p>

                                {/* Limits Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Users</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{plan.max_users === 0 ? 'Unlimited' : plan.max_users}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Building className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Branches</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{plan.max_branches === 0 ? 'Unlimited' : plan.max_branches}</p>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-slate-50 pt-4">
                                    <div className="flex flex-wrap gap-1">
                                        {(plan.enabled_modules || []).slice(0, 4).map(mod => (
                                            <span key={mod} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-bold">
                                                {mod}
                                            </span>
                                        ))}
                                        {(plan.enabled_modules?.length || 0) > 4 && (
                                            <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-500 rounded-md font-bold">
                                                +{(plan.enabled_modules?.length || 0) - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Management Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modal-up border border-slate-100 flex flex-col">
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {editingTemplate ? 'Edit Subscription Tier' : 'Create New Tier'}
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm">Configure pricing, limits, and capabilities.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleCloseModal}
                                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="px-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex space-x-6">
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'details' ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Layers className="w-4 h-4" />
                                        Plan Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('config')}
                                        className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'config' ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Technical Configuration
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8">
                                {activeTab === 'details' ? (
                                    <div className="space-y-6">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Standard 2024"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Marketing Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Growth Excellence"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                                    value={formData.display_name}
                                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Plan Code (Unique)</label>
                                                <input
                                                    type="text"
                                                    disabled={!!editingTemplate}
                                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm font-mono text-slate-500 focus:outline-none"
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Brief Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="Description..."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Pricing Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Monthly (₹)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 text-[#0066FF]"
                                                    value={formData.monthly_price}
                                                    onChange={(e) => setFormData({ ...formData, monthly_price: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Yearly (₹)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 text-[#0066FF]"
                                                    value={formData.yearly_price}
                                                    onChange={(e) => setFormData({ ...formData, yearly_price: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        {/* Feature Tags */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Marketing Features List</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Priority Support"
                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                                    value={newFeature}
                                                    onChange={(e) => setNewFeature(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddFeature}
                                                    className="px-6 bg-[#0066FF] text-white rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-all"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {(formData.features || []).map((feature, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#0066FF]/5 border border-[#0066FF]/10 rounded-lg text-[11px] font-bold text-[#0066FF]"
                                                    >
                                                        <span>{feature}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFeature(idx)}
                                                            className="hover:text-rose-600 transition-colors"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status Toggles */}
                                        <div className="flex gap-6 py-4 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                                className="flex items-center gap-3"
                                            >
                                                <div className={`w-10 h-5 rounded-full relative transition-all ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-5.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'left-0.5'}`} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 uppercase">Active</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                                                className="flex items-center gap-3"
                                            >
                                                <div className={`w-10 h-5 rounded-full relative transition-all ${formData.is_published ? 'bg-[#0066FF]' : 'bg-slate-300'}`}>
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? 'left-5.5' : 'left-0.5'}`} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 uppercase">Publicly Listed</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-sm mb-4">
                                            <strong>Technical Configuration:</strong> Define exactly which modules and menus are accessible to companies on this plan.
                                        </div>

                                        {isLoadingMenus ? (
                                            <div className="flex justify-center py-12">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
                                            </div>
                                        ) : menuRegistry ? (
                                            <CustomPlanBuilder
                                                modules={menuRegistry.modules}
                                                coreMenus={menuRegistry.coreMenus}
                                                onConfigChange={handleConfigChange}
                                                initialConfig={{
                                                    enabled_modules: formData.enabled_modules || [],
                                                    allowed_menu_ids: formData.allowed_menu_ids || [],
                                                    max_users: formData.max_users || 10,
                                                    max_branches: formData.max_branches || 1,
                                                    max_departments: formData.max_departments || 5,
                                                    max_designations: formData.max_designations || 5
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center py-8 text-rose-500">
                                                Failed to load menu registry.
                                                <button onClick={loadMenuRegistry} className="ml-2 underline">Retry</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="sticky bottom-0 bg-white p-4 border-t border-slate-100 mt-6 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-[#0066FF] text-white font-bold rounded-xl hover:bg-[#0052CC] shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Save Plan
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
