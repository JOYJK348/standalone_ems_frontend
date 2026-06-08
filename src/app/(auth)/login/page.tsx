"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Building2, GraduationCap } from "lucide-react";
import Cookie from "js-cookie";

import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const getDashboardPath = (roleName: string) => {
        switch (roleName) {
            case "PLATFORM_ADMIN":
                return "/ems/platform-admin/dashboard";
            case "TENANT_ADMIN":
            case "COMPANY_ADMIN":
                return "/ems/tenant-admin/dashboard";
            case "ACADEMIC_COORDINATOR":
                return "/ems/academic-manager/dashboard";
            case "FINANCE_MANAGER":
                return "/ems/dynamic-role/finance-manager/dashboard";
            case "HR_MANAGER":
            case "HRMS_ADMIN":
                return "/ems/dynamic-role/hr-manager/dashboard";
            case "PLACEMENT_OFFICER":
                return "/ems/dynamic-role/placement-officer/dashboard";
            case "ACADEMIC_MANAGER":
            case "BRANCH_ADMIN":
                return "/ems/dynamic-role/dashboard";
            case "TUTOR":
                return "/ems/tutor/dashboard";
            case "STUDENT":
                return "/ems/student/dashboard";
            default:
                return "/ems/academic-manager/dashboard";
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            if (!data.success) {
                throw new Error(data.error?.message || "Login failed");
            }

            const { user, tokens } = data.data;
            if (!user || !tokens) throw new Error("Invalid response from server");

            const roles = user.roles || user.user_roles || [];
            const primaryRole = Array.isArray(roles) && roles.length > 0
                ? (roles[0].roles || roles[0])
                : { name: "GUEST", level: 0 };

            if (primaryRole.name === "STUDENT") {
                setError("Students must login at /ems/student/login");
                toast.error("Wrong Login Page", {
                    description: "Students must use the dedicated student login page"
                });
                setIsLoading(false);
                return;
            }

            const selectedRole = {
                ...primaryRole,
                company_id: roles[0]?.company_id,
                branch_id: roles[0]?.branch_id
            };

            const displayName = user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.display_name || "User";

            const cookieOptions = { expires: 1, path: '/', sameSite: 'Lax' as const };
            Cookie.set("access_token", tokens.accessToken, cookieOptions);
            Cookie.set("user_role", selectedRole.name || "GUEST", cookieOptions);
            Cookie.set("user_role_level", (selectedRole.level ?? 0).toString(), cookieOptions);
            Cookie.set("user_display_name", displayName, cookieOptions);

            if (selectedRole.company_id) {
                Cookie.set("x-company-id", selectedRole.company_id.toString(), cookieOptions);
            } else {
                Cookie.remove("x-company-id", { path: '/' });
            }

            if (selectedRole.branch_id) {
                Cookie.set("x-branch-id", selectedRole.branch_id.toString(), cookieOptions);
            } else {
                Cookie.remove("x-branch-id", { path: '/' });
            }

            setUser({
                id: user.id.toString(),
                email: user.email,
                display_name: displayName,
                role: {
                    name: selectedRole.name || "GUEST",
                    level: selectedRole.level ?? 0
                },
                company_id: selectedRole.company_id?.toString(),
                branch_id: selectedRole.branch_id
            });

            toast.success("Welcome back!", {
                description: `Signed in as ${displayName}`
            });

            router.push(getDashboardPath(selectedRole.name));
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || err.message || "An unexpected error occurred during login";
            setError(errorMessage);
            toast.error("Login Failed", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-md animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 transition-transform hover:scale-105 duration-300">
                        <GraduationCap className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Durkkas EMS</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest">Education Management System</p>
                </div>

                <div className="premium-glass rounded-3xl p-8 md:p-10">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-primary">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm mt-1">Please enter your credentials to access your academy portal.</p>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-primary/70 ml-1">WORK EMAIL</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    className="input-premium pl-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-primary/70 uppercase">Password</label>
                                <Link href="/forgot-password" className="text-xs font-medium text-accent hover:underline decoration-2 underline-offset-4 pointer-events-none opacity-50">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="input-premium pl-11 pr-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full h-12 text-base font-semibold transition-all hover:translate-y-[-2px] shadow-lg shadow-primary/20"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Sign In to EMS"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border flex flex-col items-center">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-tighter">
                            <Building2 className="w-3 h-3" />
                            <span>Multi-Tenant Academy Platform</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-xs text-muted-foreground">
                    &copy; 2026 Durkkas Innovations. All rights reserved.
                </p>
            </div>
        </div>
    );
}
