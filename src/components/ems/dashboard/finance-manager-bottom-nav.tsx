"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, FileText, CreditCard, BarChart3, Wallet, Receipt, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allNavItems = [
    { href: "/ems/dynamic-role/finance-manager/dashboard", icon: LayoutDashboard, label: "Dashboard", menuId: "ems.dashboard" },
    { href: "/ems/dynamic-role/finance-manager/invoices", icon: FileText, label: "Invoices", menuId: "ems.finance.invoices" },
    { href: "/ems/dynamic-role/finance-manager/payments", icon: CreditCard, label: "Payments", menuId: "ems.finance.payments" },
    { href: "/ems/dynamic-role/finance-manager/expenses", icon: Receipt, label: "Expenses", menuId: "ems.finance.expenses" },
    { href: "/ems/dynamic-role/finance-manager/due-tracking", icon: Bell, label: "Dues", menuId: "ems.finance.due_tracking" },
    { href: "/ems/dynamic-role/finance-manager/fees", icon: Wallet, label: "Fees", menuId: "ems.finance.fees" },
];

export function FinanceManagerBottomNav() {
    const pathname = usePathname();
    const navItems = allNavItems;

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
                        (item.href !== "/ems/dynamic-role/finance-manager/dashboard" && pathname?.startsWith(item.href));

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
                                        layoutId="financeBottomNavIndicator"
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
