"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    FileText,
    ClipboardCheck,
    MessageSquare,
    TrendingUp,
    Calendar,
    LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/ems/student/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/ems/student/courses", icon: BookOpen, label: "Courses" },
    { href: "/ems/student/assignments", icon: FileText, label: "Assignments" },
    { href: "/ems/student/assessments", icon: ClipboardCheck, label: "Tests" },
    { href: "/ems/student/attendance", icon: Calendar, label: "Attendance" },
];

export function BottomNav() {
    const pathname = usePathname();

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
                        (item.href !== "/ems/student/dashboard" && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                                isActive ? "text-primary" : "text-gray-500"
                            )}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="relative"
                            >
                                <Icon className="h-5 w-5" />
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
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
