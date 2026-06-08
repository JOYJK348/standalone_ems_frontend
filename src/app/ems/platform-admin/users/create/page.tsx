"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Save, Loader2, ShieldCheck, Mail, Lock, User, AtSign, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';
import { platformService } from '@/services/platformService';
import { toast } from 'sonner';

export default function CreateUserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedRole = searchParams.get('role_type');

    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    // Auth Scope
    const [scope, setScope] = useState<any>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: '',
        branch_id: ''
    });

    useEffect(() => {
        loadDependencies();
    }, []);

    const loadDependencies = async () => {
        try {
            const [me, rolesData, branchesData] = await Promise.all([
                platformService.getMe(),
                platformService.getRoles(),
                platformService.getBranches()
            ]);

            setScope(me.scope);
            setBranches(branchesData);

            // Filter Roles based on RBAC
            // Company Admin (4) can only see Level < 4 roles
            const myLevel = me.scope.role_level;
            const availableRoles = rolesData.filter((r: any) => r.level < myLevel);
            setRoles(availableRoles);

            if (preSelectedRole) {
                // Try to find role by name or mapped type
                // Mapping FRONTEND param to BACKEND role namne
                // BRANCH_ADMIN -> BRANCH_ADMIN (Roles DB Name)
                const target = availableRoles.find((r: any) => r.name === preSelectedRole);
                if (target) {
                    setFormData(prev => ({ ...prev, role_id: target.id }));
                }
            }
        } catch (error) {
            console.error("Failed to load dependencies", error);
            toast.error("Failed to load form data");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Basic Validation
            if (!formData.email || !formData.password || !formData.role_id) {
                toast.error("Please fill all required fields");
                return;
            }

            await platformService.createUser({
                ...formData,
                display_name: `${formData.first_name} ${formData.last_name}`,
                company_id: scope?.company_id
            });
            toast.success("User created successfully!");
            router.push('/ems/platform-admin/dashboard');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message || "Failed to create user";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New User</h1>
                        <p className="text-slate-500 font-medium">Add a new administrator or employee to your organization.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_40px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="p-8 md:p-10 space-y-8">

                        {/* Section: Account Credentials */}
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Account Credentials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium"
                                            placeholder="user@company.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Initial Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Personal Info */}
                        <div className="border-t border-slate-50 pt-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <User className="w-4 h-4" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                        placeholder="John"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                        placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Access Control */}
                        <div className="border-t border-slate-50 pt-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Role & Permissions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assign Role</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                            value={formData.role_id}
                                            onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a Role...</option>
                                            {roles.map((role: any) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name} (Level {role.level})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronLeft className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 -rotate-90 pointer-events-none" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold px-1">
                                        * Only roles lower than your current level ({scope?.role_level}) are visible.
                                    </p>
                                </div>

                                {/* Branch Selection - Optional based on role, but good to have */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assign Branch (Optional)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                            value={formData.branch_id}
                                            onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                        >
                                            <option value="">Global / Head Office</option>
                                            {branches.map((branch: any) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <MapPin className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                        <Link href="/ems/platform-admin/dashboard">
                            <button type="button" className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Creating User...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
