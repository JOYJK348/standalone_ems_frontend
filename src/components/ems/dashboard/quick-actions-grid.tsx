"use client";

import { motion } from "framer-motion";
import {
    FileText,
    BookOpen,
    MessageSquare,
    Award,
    Calendar,
    ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: number;
    color: string;
}

const actions: QuickAction[] = [
    {
        id: "assignments",
        label: "Assignments",
        icon: FileText,
        href: "/ems/student/assignments",
        badge: 3,
        color: "",
    },
    {
        id: "materials",
        label: "Materials",
        icon: BookOpen,
        href: "/ems/student/courses",
        color: "",
    },
    {
        id: "doubts",
        label: "Doubts",
        icon: MessageSquare,
        href: "/ems/student/doubts",
        badge: 2,
        color: "",
    },
    {
        id: "certificates",
        label: "Certificates",
        icon: Award,
        href: "#",
        color: "",
    },
    {
        id: "attendance",
        label: "Attendance",
        icon: Calendar,
        href: "/ems/student/attendance",
        color: "",
    },
    {
        id: "tests",
        label: "Tests",
        icon: ClipboardCheck,
        href: "/ems/student/assessments",
        badge: 1,
        color: "",
    },
];

export function QuickActionsGrid() {
    return (
        <div className="mb-6 px-4 sm:px-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href={action.href}>
                                <Button
                                    variant="outline"
                                    className="w-full h-20 sm:h-24 flex flex-col items-center justify-center gap-2 relative"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium">{action.label}</span>
                                    {action.badge && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                            {action.badge}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
