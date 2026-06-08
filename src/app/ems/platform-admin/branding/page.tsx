"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Palette,
    Image as ImageIcon,
    Upload,
    Globe,
    Monitor,
    Save,
    RefreshCcw,
    ShieldCheck,
    Camera,
    CheckCircle2,
    Info,
    Mail,
    Building2,
    Loader2,
    Trash2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { platformService } from "@/services/platformService";

interface BrandingData {
    platform_name: string;
    tagline: string;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    secondary_color: string;
    copyright_text: string;
    support_url: string;
}

export default function PlatformBranding() {
    const [activeTab, setActiveTab] = useState<"CORE" | "COMPANIES" | "EMAILS">("CORE");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [branding, setBranding] = useState<BrandingData>({
        platform_name: "Durkkas ERP",
        tagline: "Advanced Enterprise Architecture",
        logo_url: null,
        favicon_url: null,
        primary_color: "#0066FF",
        secondary_color: "#0052CC",
        copyright_text: "© 2026 Durkkas Academy. All Rights Reserved.",
        support_url: "https://support.durkkas.com"
    });

    const [companyBranding, setCompanyBranding] = useState<any>({
        logo_url: null,
        favicon_url: null,
        primary_color: "#0066FF"
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const companyLogoRef = useRef<HTMLInputElement>(null);
    const companyFaviconRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            loadCompanyBranding(selectedCompany);
        }
    }, [selectedCompany]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load companies
            const companiesData = await platformService.getCompanies();
            setCompanies(companiesData || []);

            // Load platform branding
            try {
                const brandingData = await platformService.getPlatformBranding();
                if (brandingData && Object.keys(brandingData).length > 0) {
                    setBranding(prev => ({
                        ...prev,
                        ...brandingData
                    }));
                }
            } catch (e) {
                // Branding not set yet, use defaults
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCompanyBranding = async (companyId: string) => {
        try {
            const data = await platformService.getCompanyBranding(companyId);
            if (data && Object.keys(data).length > 0) {
                setCompanyBranding(data);
            } else {
                setCompanyBranding({
                    logo_url: null,
                    favicon_url: null,
                    primary_color: "#0066FF"
                });
            }
        } catch (e) {
            setCompanyBranding({
                logo_url: null,
                favicon_url: null,
                primary_color: "#0066FF"
            });
        }
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'favicon', isCompany: boolean = false) => {
        if (!file) return;

        // Validate file type
        const validTypes = type === 'logo'
            ? ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
            : ['image/x-icon', 'image/png', 'image/jpeg'];

        if (!validTypes.includes(file.type)) {
            toast.error(`Invalid file type for ${type}. Please upload ${type === 'logo' ? 'PNG, JPEG, SVG, or WebP' : 'ICO, PNG, or JPEG'}`);
            return;
        }

        // Validate file size (max 2MB for logo, 500KB for favicon)
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 500 * 1024;
        if (file.size > maxSize) {
            toast.error(`File too large. Maximum size is ${type === 'logo' ? '2MB' : '500KB'}`);
            return;
        }

        // Create preview URL (in real implementation, upload to storage and get URL)
        const previewUrl = URL.createObjectURL(file);

        if (isCompany) {
            setCompanyBranding((prev: any) => ({
                ...prev,
                [`${type}_url`]: previewUrl
            }));
            toast.success(`Company ${type} uploaded successfully`);
        } else {
            setBranding(prev => ({
                ...prev,
                [`${type}_url`]: previewUrl
            }));
            toast.success(`Platform ${type} uploaded successfully`);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await platformService.updatePlatformBranding(branding);
            toast.success("Platform branding updated successfully", {
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to update branding");
        } finally {
            setSaving(false);
        }
    };

    const handleCompanySave = async () => {
        if (!selectedCompany) {
            toast.error("Please select a company");
            return;
        }

        setSaving(true);
        try {
            await platformService.updateCompanyBranding(selectedCompany, companyBranding);
            toast.success("Company branding updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update company branding");
        } finally {
            setSaving(false);
        }
    };

    const removeImage = (type: 'logo' | 'favicon', isCompany: boolean = false) => {
        if (isCompany) {
            setCompanyBranding((prev: any) => ({
                ...prev,
                [`${type}_url`]: null
            }));
        } else {
            setBranding(prev => ({
                ...prev,
                [`${type}_url`]: null
            }));
        }
        toast.info(`${type} removed`);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-3">
                            <Palette className="w-3.5 h-3.5 text-violet-600" />
                            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Branding Manager</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                            Platform Branding
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 font-medium">
                            Manage platform and company logos, favicons, and visual identity
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm inline-flex gap-2">
                    {[
                        { id: "CORE", label: "Platform Assets", icon: Globe },
                        { id: "COMPANIES", label: "Company Branding", icon: Building2 },
                        { id: "EMAILS", label: "Email Templates", icon: Mail }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 md:px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                    ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Platform Assets Tab */}
                {activeTab === "CORE" && (
                    <div className="space-y-6">
                        {/* Platform Info */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-[#0066FF]" />
                                Platform Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Name</label>
                                    <input
                                        type="text"
                                        value={branding.platform_name}
                                        onChange={(e) => setBranding(prev => ({ ...prev, platform_name: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tagline</label>
                                    <input
                                        type="text"
                                        value={branding.tagline}
                                        onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Copyright Text</label>
                                    <input
                                        type="text"
                                        value={branding.copyright_text}
                                        onChange={(e) => setBranding(prev => ({ ...prev, copyright_text: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support URL</label>
                                    <input
                                        type="text"
                                        value={branding.support_url}
                                        onChange={(e) => setBranding(prev => ({ ...prev, support_url: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logo & Favicon Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Logo Upload */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-blue-600" />
                                    Platform Logo
                                </h3>

                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                />

                                {branding.logo_url ? (
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <img
                                                src={branding.logo_url}
                                                alt="Platform Logo"
                                                className="w-full h-48 object-contain bg-slate-50 rounded-xl border-2 border-slate-200"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    <Upload className="w-5 h-5 text-slate-700" />
                                                </button>
                                                <button
                                                    onClick={() => removeImage('logo')}
                                                    className="p-2 bg-white rounded-lg hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5 text-rose-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 text-center">Hover to change or remove</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => logoInputRef.current?.click()}
                                        className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#0066FF] hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#0066FF]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-700">Upload Logo</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPEG, SVG, WebP (Max 2MB)</p>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Favicon Upload */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-emerald-600" />
                                    Favicon
                                </h3>

                                <input
                                    ref={faviconInputRef}
                                    type="file"
                                    accept="image/x-icon,image/png,image/jpeg"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                                />

                                {branding.favicon_url ? (
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="w-full h-48 bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-center">
                                                <img
                                                    src={branding.favicon_url}
                                                    alt="Favicon"
                                                    className="w-16 h-16 object-contain"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => faviconInputRef.current?.click()}
                                                    className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    <Upload className="w-5 h-5 text-slate-700" />
                                                </button>
                                                <button
                                                    onClick={() => removeImage('favicon')}
                                                    className="p-2 bg-white rounded-lg hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5 text-rose-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 text-center">32x32px recommended</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => faviconInputRef.current?.click()}
                                        className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                            <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-700">Upload Favicon</p>
                                            <p className="text-xs text-slate-400 mt-1">ICO, PNG (Max 500KB)</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Color Scheme */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-violet-600" />
                                Color Scheme
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Color</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={branding.primary_color}
                                            onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                                            className="w-16 h-12 rounded-xl border-2 border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={branding.primary_color}
                                            onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secondary Color</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={branding.secondary_color}
                                            onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                                            className="w-16 h-12 rounded-xl border-2 border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={branding.secondary_color}
                                            onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Platform Branding
                            </button>
                        </div>
                    </div>
                )}

                {/* Company Branding Tab */}
                {activeTab === "COMPANIES" && (
                    <div className="space-y-6">
                        {/* Company Selector */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#0066FF]" />
                                Select Company
                            </h3>
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 appearance-none cursor-pointer"
                            >
                                <option value="">Select a company...</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedCompany && (
                            <>
                                {/* Company Logo & Favicon */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Logo */}
                                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                        <h3 className="text-base font-bold text-slate-900 mb-4">Company Logo</h3>

                                        <input
                                            ref={companyLogoRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo', true)}
                                        />

                                        {companyBranding.logo_url ? (
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    <img
                                                        src={companyBranding.logo_url}
                                                        alt="Company Logo"
                                                        className="w-full h-48 object-contain bg-slate-50 rounded-xl border-2 border-slate-200"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => companyLogoRef.current?.click()}
                                                            className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Upload className="w-5 h-5 text-slate-700" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeImage('logo', true)}
                                                            className="p-2 bg-white rounded-lg hover:bg-rose-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5 text-rose-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => companyLogoRef.current?.click()}
                                                className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#0066FF] hover:bg-blue-50/50 transition-all group"
                                            >
                                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#0066FF]" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-slate-700">Upload Company Logo</p>
                                                    <p className="text-xs text-slate-400 mt-1">PNG, JPEG, SVG (Max 2MB)</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Company Favicon */}
                                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                        <h3 className="text-base font-bold text-slate-900 mb-4">Company Favicon</h3>

                                        <input
                                            ref={companyFaviconRef}
                                            type="file"
                                            accept="image/x-icon,image/png,image/jpeg"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon', true)}
                                        />

                                        {companyBranding.favicon_url ? (
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    <div className="w-full h-48 bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-center">
                                                        <img
                                                            src={companyBranding.favicon_url}
                                                            alt="Company Favicon"
                                                            className="w-16 h-16 object-contain"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => companyFaviconRef.current?.click()}
                                                            className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Upload className="w-5 h-5 text-slate-700" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeImage('favicon', true)}
                                                            className="p-2 bg-white rounded-lg hover:bg-rose-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5 text-rose-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => companyFaviconRef.current?.click()}
                                                className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                                            >
                                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                                    <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-slate-700">Upload Favicon</p>
                                                    <p className="text-xs text-slate-400 mt-1">ICO, PNG (Max 500KB)</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Save Company Branding */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCompanySave}
                                        disabled={saving}
                                        className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0066FF] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#0066FF]/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Company Branding
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Email Templates Tab */}
                {activeTab === "EMAILS" && (
                    <div className="bg-white rounded-2xl p-16 border border-slate-100 shadow-sm text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Email Templates</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Email template customization will be available in the next update.
                        </p>
                    </div>
                )}

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-2xl p-6 md:p-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1">CDN Deployment</h3>
                            <p className="text-sm text-white/80">
                                All branding assets are stored in database and served from CDN. Changes are tracked in audit logs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
