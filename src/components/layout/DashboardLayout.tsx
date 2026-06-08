"use client";

import React, { useEffect, useMemo, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ArrowLeft, Bell, Building2, CreditCard, FileText, GraduationCap,
    History, LayoutDashboard, LogOut, Menu, Monitor, Palette, Settings,
    ShieldCheck, UserCircle, Users2, Users, X, Box, SlidersHorizontal, MapPin
} from "lucide-react";
import Cookie from "js-cookie";
import { Toaster } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import DynamicSidebar from "./DynamicSidebar";

const platformNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/ems/platform-admin/dashboard" },
    { id: "companies", label: "Companies", icon: Building2, href: "/ems/platform-admin/core/companies" },
    { id: "users", label: "Users", icon: Users2, href: "/ems/platform-admin/users" },
    { id: "modules", label: "EMS Modules", icon: Box, href: "/ems/platform-admin/modules" },
    { id: "admins", label: "Admins", icon: ShieldCheck, href: "/ems/platform-admin/admins" },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard, href: "/ems/platform-admin/subscriptions" },
    { id: "settings", label: "Settings", icon: Monitor, href: "/ems/platform-admin/settings" },
    { id: "audit", label: "Audit Logs", icon: History, href: "/ems/platform-admin/audit-logs" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/ems/platform-admin/notifications" },
    { id: "branding", label: "Branding", icon: Palette, href: "/ems/platform-admin/branding" },
    { id: "reports", label: "Reports", icon: FileText, href: "/ems/platform-admin/reports" },
    { id: "profile", label: "Profile", icon: UserCircle, href: "/ems/platform-admin/profile" }
];

const tenantNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/ems/tenant-admin/dashboard" },
    { id: "branches", label: "Branches", icon: MapPin, href: "/ems/tenant-admin/branches" },
    { id: "employees", label: "Employees", icon: Users, href: "/ems/tenant-admin/employees" },
    { id: "access", label: "Access Control", icon: ShieldCheck, href: "/ems/tenant-admin/access" },
    { id: "roles", label: "Roles", icon: Users2, href: "/ems/tenant-admin/roles" },
    { id: "settings", label: "Settings", icon: Settings, href: "/ems/tenant-admin/settings" },
    { id: "menu", label: "Menu Access", icon: SlidersHorizontal, href: "/ems/tenant-admin/settings/menu-access" },
    { id: "subscription", label: "Subscription", icon: CreditCard, href: "/ems/tenant-admin/subscription" },
    { id: "reports", label: "Reports", icon: FileText, href: "/ems/tenant-admin/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/ems/tenant-admin/notifications" },
    { id: "profile", label: "Profile", icon: UserCircle, href: "/ems/tenant-admin/profile" }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [userMenuIds, setUserMenuIds] = useState<string[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuFetchDone, setMenuFetchDone] = useState(false);
    const { user, setUser, logout } = useAuthStore();
    const isPlatform = pathname.startsWith("/ems/platform-admin");
    const isEmsRoute = pathname.startsWith("/ems/") && !isPlatform;

    const homeHref = isPlatform ? "/ems/platform-admin/dashboard" :
                     isEmsRoute ? "/ems/dashboard" : "/ems/tenant-admin/dashboard";
    const roleLabel = isPlatform ? "Platform Admin" :
                      isEmsRoute ? "" : "Tenant Admin";

    useEffect(() => {
        setHasMounted(true);

        const roleLevel = parseInt(Cookie.get("user_role_level") || "0", 10);
        if (roleLevel >= 5) {
            if (Cookie.get("x-company-id") || Cookie.get("x-branch-id")) {
                Cookie.remove("x-company-id", { path: '/' });
                Cookie.remove("x-branch-id", { path: '/' });
            }
        }

        if (!user) {
            const roleName = Cookie.get("user_role");
            const roleLevel = parseInt(Cookie.get("user_role_level") || (isPlatform ? "5" : "4"), 10);
            const displayName = Cookie.get("user_display_name");
            setUser({
                id: "local-admin",
                email: "",
                display_name: displayName || roleLabel,
                role: { name: roleName || (isPlatform ? "PLATFORM_ADMIN" : "TENANT_ADMIN"), level: roleLevel || (isPlatform ? 5 : 4) }
            });
        }
    }, [isPlatform, roleLabel, setUser, user]);

    useEffect(() => {
        if (isPlatform) { setMenuLoading(false); setMenuFetchDone(true); return; }
        const fetchMenus = async () => {
            try {
                const token = Cookie.get("access_token");
                if (!token) { setMenuLoading(false); setMenuFetchDone(true); return; }
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
                const res = await fetch(`${baseUrl}/ems/my-menus`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setUserMenuIds(data.data.menuIds || []);
            } catch (err) {
                console.error('[DashboardLayout] Menu fetch failed:', err);
            } finally {
                setMenuLoading(false);
                setMenuFetchDone(true);
            }
        };
        fetchMenus();
    }, [isPlatform]);

    const title = useMemo(() => {
        const last = pathname.split("/").filter(Boolean).pop() || "dashboard";
        return last.replace(/-/g, " ");
    }, [pathname]);

    const handleLogout = useCallback(() => {
        logout();
        ["access_token","refresh_token","x-company-id","x-branch-id","user_role","user_role_level","user_display_name"].forEach(k => Cookie.remove(k, { path: "/" }));
        router.push("/login");
    }, [logout, router]);

    const platformSidebar = (
        <aside className="flex h-full w-72 flex-col bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <Link href={homeHref} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-base font-black leading-none">EMS Control</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Platform Admin</p>
                    </div>
                </Link>
                <button className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {platformNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link key={item.id} href={item.href} onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                isActive ? "bg-white text-slate-950" : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-3">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );

    const tenantFallbackSidebar = (
        <aside className="flex h-full w-72 flex-col bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <Link href={homeHref} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-base font-black leading-none">Tenant Workspace</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Tenant Admin</p>
                    </div>
                </Link>
                <button className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {tenantNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link key={item.id} href={item.href} onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                isActive ? "bg-white text-slate-950" : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-3">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );

    const isTenantAdmin = pathname.startsWith("/ems/tenant-admin");

    const sidebarContent = (() => {
        if (isPlatform) return platformSidebar;
        if (isTenantAdmin) return tenantFallbackSidebar;
        if (menuFetchDone && userMenuIds.length > 0) {
            return (
                <DynamicSidebar
                    userMenuIds={userMenuIds}
                    loading={false}
                    roleLabel=""
                    brandLabel="Agaran EMS"
                    onClose={() => setIsSidebarOpen(false)}
                />
            );
        }
        if (menuFetchDone && userMenuIds.length === 0) return tenantFallbackSidebar;
        return (
            <aside className="flex h-full w-72 flex-col bg-slate-950">
                <div className="flex items-center justify-center flex-1">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
            </aside>
        );
    })();

    const sidebarVisible = isPlatform || isTenantAdmin || (menuFetchDone && userMenuIds.length > 0) || (menuFetchDone && userMenuIds.length === 0);

    if (!hasMounted) return <div className="min-h-screen bg-slate-50" />;

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster richColors position="top-right" />
            {sidebarVisible && (
                <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebarContent}</div>
            )}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <div className="h-full" onClick={(e) => e.stopPropagation()}>{sidebarContent}</div>
                </div>
            )}
            <main className={`min-h-screen ${sidebarVisible ? 'lg:pl-72' : ''}`}>
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
                    <div className="flex items-center gap-3">
                        {sidebarVisible && (
                            <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                                <Menu className="h-5 w-5" />
                            </button>
                        )}
                        {pathname !== homeHref && (
                            <button className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:inline-flex" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Standalone EMS</p>
                            <h1 className="text-sm font-black capitalize text-slate-950 md:text-base">{title}</h1>
                        </div>
                    </div>
                    <Link href="/ems/tenant-admin/profile" className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <UserCircle className="h-5 w-5 text-blue-600" />
                        <span className="hidden sm:inline">{user?.display_name || roleLabel || "User"}</span>
                    </Link>
                </header>
                <div className="p-4 md:p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}