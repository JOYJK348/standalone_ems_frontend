"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    User,
    Search,
    LogOut,
    LayoutDashboard,
    Users,
    GraduationCap,
    UserPlus,
    CheckSquare,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import Cookie from "js-cookie";

const menuIdMap: Record<string, string> = {
    "/ems/dynamic-role/hr-manager/dashboard": "ems.dashboard",
    "/ems/dynamic-role/hr-manager/tutors": "ems.hr.tutors",
    "/ems/dynamic-role/hr-manager/enrollments": "ems.hr.enrollments",
    "/ems/dynamic-role/hr-manager/attendance": "ems.hr.attendance",
    "/ems/dynamic-role/hr-manager/bulk-import": "ems.hr.bulk_import",
};

const allQuickActions = [
    {
        label: "Dashboard",
        href: "/ems/dynamic-role/hr-manager/dashboard",
        icon: LayoutDashboard,
        menuId: "ems.dashboard",
    },
    {
        label: "Tutors",
        href: "/ems/dynamic-role/hr-manager/tutors",
        icon: GraduationCap,
        menuId: "ems.hr.tutors",
    },
    {
        label: "Enrollments",
        href: "/ems/dynamic-role/hr-manager/enrollments",
        icon: UserPlus,
        menuId: "ems.hr.enrollments",
    },
    {
        label: "Attendance",
        href: "/ems/dynamic-role/hr-manager/attendance",
        icon: CheckSquare,
        menuId: "ems.hr.attendance",
    },
    {
        label: "Bulk Import",
        href: "/ems/dynamic-role/hr-manager/bulk-import",
        icon: Users,
        menuId: "ems.hr.bulk_import",
    },
];

export function HRManagerTopNavbar() {
    const pathname = usePathname();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [showSearch, setShowSearch] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [userMenuIds, setUserMenuIds] = useState<string[]>([]);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const quickActions =
        userMenuIds.length === 0
            ? allQuickActions
            : allQuickActions.filter((a) => userMenuIds.includes(a.menuId));

    useEffect(() => {
        const token = Cookie.get("access_token");
        if (token) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            fetch(`${baseUrl}/ems/my-menus`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.success) setUserMenuIds(data.data.menuIds || []);
                })
                .catch(() => {});
        }

        fetchNotifications();
        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        function handleClickOutside(event: MouseEvent) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setShowProfileMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            clearInterval(pollInterval);
        };
    }, []);

    return (
        <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/ems/dynamic-role/hr-manager/dashboard"
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                                HR Manager
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search tutors, students, enrollments..."
                                className="w-full h-9 pl-9 text-sm border-gray-300 focus:border-teal-600 focus:ring-teal-600"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Mobile Search Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-9 w-9"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search className="h-5 w-5 text-gray-600" />
                        </Button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 relative"
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications)
                                        fetchNotifications();
                                }}
                            >
                                <Bell className="h-5 w-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2">
                                    <NotificationPanel
                                        onClose={() =>
                                            setShowNotifications(false)
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative" ref={profileMenuRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() =>
                                    setShowProfileMenu(!showProfileMenu)
                                }
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            </Button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-900">
                                            HR Manager
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            hr.manager@Agaran.com
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="py-2">
                                        <div className="px-3 py-1.5">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Quick Actions
                                            </p>
                                        </div>
                                        {quickActions.map((action) => {
                                            const Icon = action.icon;
                                            return (
                                                <Link
                                                    key={action.href}
                                                    href={action.href}
                                                    onClick={() =>
                                                        setShowProfileMenu(
                                                            false,
                                                        )
                                                    }
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                                                >
                                                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-teal-600" />
                                                    <span className="font-medium">
                                                        {action.label}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {/* Settings Link */}
                                    <div className="border-t border-gray-200 py-1">
                                        <Link
                                            href="/ems/dynamic-role/hr-manager/settings"
                                            onClick={() =>
                                                setShowProfileMenu(false)
                                            }
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">
                                                Settings
                                            </span>
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-200 py-1">
                                        <Link
                                            href="/login"
                                            onClick={() =>
                                                setShowProfileMenu(false)
                                            }
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span className="font-medium">
                                                Logout
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showSearch && (
                    <div className="md:hidden pb-3 border-t border-gray-200">
                        <div className="relative pt-3">
                            <Search className="absolute left-3 top-6 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search tutors, students, enrollments..."
                                className="w-full h-9 pl-9 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
