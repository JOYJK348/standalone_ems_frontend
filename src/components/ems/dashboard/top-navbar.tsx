"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    User,
    Search,
    BookOpen,
    LogOut,
    FileText,
    ClipboardCheck,
    MessageSquare,
    TrendingUp,
    Calendar,
    LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationPanel from "@/components/notifications/NotificationPanel";

export function TopNavbar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [showSearch, setShowSearch] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const quickActions = [
        { label: "Dashboard", href: "/ems/student/dashboard", icon: LayoutDashboard },
        { label: "My Courses", href: "/ems/student/courses", icon: BookOpen },
        { label: "Assignments", href: "/ems/student/assignments", icon: FileText },
        { label: "Assessments", href: "/ems/student/assessments", icon: ClipboardCheck },
        { label: "Doubts", href: "/ems/student/doubts", icon: MessageSquare },
        { label: "Progress", href: "/ems/student/progress", icon: TrendingUp },
        { label: "Attendance", href: "/ems/student/attendance", icon: Calendar },
    ];

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Professional Polling: Fetch notifications every 30 seconds
        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
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
                    <Link href="/ems/student/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                DURKKAS EMS
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search courses, materials..."
                                className="w-full h-9 pl-9 text-sm border-gray-300 focus:border-blue-600 focus:ring-blue-600"
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
                                    if (!showNotifications) fetchNotifications();
                                }}
                            >
                                <Bell className="h-5 w-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
                                )}
                            </Button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2">
                                        <NotificationPanel onClose={() => setShowNotifications(false)} />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Menu */}
                        <div className="relative" ref={profileMenuRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            </Button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                                    >
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{user?.display_name || "Student"}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="py-2">
                                            <div className="px-3 py-1.5">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                                            </div>
                                            {quickActions.map((action) => {
                                                const Icon = action.icon;
                                                return (
                                                    <Link
                                                        key={action.href}
                                                        href={action.href}
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                                    >
                                                        <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                                        <span className="font-medium">{action.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Profile Link */}
                                        <div className="border-t border-gray-200 py-1">
                                            <Link
                                                href="/ems/student/profile"
                                                onClick={() => setShowProfileMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">My Profile</span>
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-200 py-1">
                                            <Link
                                                href="/ems/student/login"
                                                onClick={() => setShowProfileMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="font-medium">Logout</span>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

                {/* Mobile Search Bar */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden pb-3 border-t border-gray-200"
                        >
                            <div className="relative pt-3">
                                <Search className="absolute left-3 top-6 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search courses, materials..."
                                    className="w-full h-9 pl-9 text-sm"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </nav>
    );
}
