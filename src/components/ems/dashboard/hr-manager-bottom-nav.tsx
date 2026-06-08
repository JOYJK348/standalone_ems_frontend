"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard, Users, GraduationCap, UserPlus, CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cookie from "js-cookie";

const allNavItems = [
    { href: "/ems/dynamic-role/hr-manager/dashboard", icon: LayoutDashboard, label: "Dashboard", menuId: "ems.dashboard" },
    { href: "/ems/dynamic-role/hr-manager/tutors", icon: GraduationCap, label: "Tutors", menuId: "ems.hr.tutors" },
    { href: "/ems/dynamic-role/hr-manager/enrollments", icon: UserPlus, label: "Enrollments", menuId: "ems.hr.enrollments" },
    { href: "/ems/dynamic-role/hr-manager/attendance", icon: CheckSquare, label: "Attendance", menuId: "ems.hr.attendance" },
    { href: "/ems/dynamic-role/hr-manager/bulk-import", icon: Users, label: "Bulk Import", menuId: "ems.hr.bulk_import" },
];

export function HRManagerBottomNav() {
    const pathname = usePathname();
    const [userMenuIds, setUserMenuIds] = useState<string[]>([]);

    useEffect(() => {
        const token = Cookie.get("access_token");
        if (token) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
            fetch(`${baseUrl}/ems/my-menus`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => { if (data.success) setUserMenuIds(data.data.menuIds || []); })
                .catch(() => {});
        }
    }, []);

    const navItems = userMenuIds.length === 0
        ? allNavItems
        : allNavItems.filter(n => userMenuIds.includes(n.menuId));

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom"
        >
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        (item.href !== "/ems/dynamic-role/hr-manager/dashboard" && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                                isActive ? "text-blue-600" : "text-gray-500"
                            )}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="relative"
                            >
                                <Icon className="h-5 w-5" />
                                {isActive && (
                                    <motion.div
                                        layoutId="hrBottomNavIndicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}
