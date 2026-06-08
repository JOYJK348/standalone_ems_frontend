"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ActivitySquare, Loader2, Search, ArrowUpRight,
    Users, Database, GitBranch, AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface UsageStat {
    id: number;
    name: string;
    code: string;

    usersUsed: number;
    usersMax: number;

    branchesUsed: number;
    branchesMax: number;

    storageUsed: string; // Placeholder "12GB"
    storageMax: string;  // Placeholder "50GB"
}

export default function LimitsUsagePage() {
    const [stats, setStats] = useState<UsageStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [companies, branches, employees] = await Promise.all([
                platformService.getCompanies(),
                platformService.getBranches(),
                platformService.getEmployees()
            ]);

            const mapped = companies.map((c: any) => {
                const companyEmployees = employees.filter((e: any) => e.company_id === c.id).length;
                const companyBranches = branches.filter((b: any) => b.company_id === c.id).length;

                return {
                    id: c.id,
                    name: c.name,
                    code: c.company_code,
                    usersUsed: companyEmployees,
                    usersMax: c.max_users || 10,
                    branchesUsed: companyBranches,
                    branchesMax: c.max_branches || 1,
                    storageUsed: "2.4 GB", // Hardcoded for now
                    storageMax: "10 GB"
                };
            });
            setStats(mapped);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load usage data");
        } finally {
            setLoading(false);
        }
    };

    const filtered = stats.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to render bars
    const UsageBar = ({ used, max, colorClass }: { used: number, max: number, colorClass: string }) => {
        const pct = Math.min((used / max) * 100, 100);
        const isNearLimit = pct > 80;

        return (
            <div className="w-full min-w-[140px]">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1.5 text-slate-400 tracking-wider">
                    <span>{used} Used</span>
                    <span>{max} Max</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-rose-500' : colorClass}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {isNearLimit && (
                    <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-rose-500">
                        <AlertTriangle className="w-3 h-3" />
                        Near Limit
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-100">
                            <ActivitySquare className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Utilization</h1>
                            <p className="text-sm text-slate-500 font-medium">Infrastructure limits and consumption monitoring</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-6">Enterprise</th>
                                        <th className="px-8 py-6">User Seats</th>
                                        <th className="px-8 py-6">Branch Slots</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map(stat => (
                                        <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500">
                                                        {stat.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{stat.name}</p>
                                                        <p className="text-[10px] uppercase font-black text-slate-400">{stat.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <UsageBar used={stat.usersUsed} max={stat.usersMax} colorClass="bg-emerald-500" />
                                            </td>
                                            <td className="px-8 py-6">
                                                <UsageBar used={stat.branchesUsed} max={stat.branchesMax} colorClass="bg-indigo-500" />
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    href={`/ems/platform-admin/core/companies/${stat.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                                >
                                                    Adjust Limit <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
