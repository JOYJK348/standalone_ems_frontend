"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, Download, History, Loader2, Search, ShieldCheck, Users } from "lucide-react";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Branch { id: string; name: string; code: string; city?: string; state?: string; }
interface Employee { id: string; employee_code?: string; first_name?: string; last_name?: string; email?: string; branch_id?: string; is_active?: boolean; }
interface AuditLog { id: string; action?: string; table_name?: string; performed_by?: string; created_at?: string; }

type ReportType = "TEAM" | "BRANCHES" | "ACTIVITY";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportType>("TEAM");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [br, emp, logs] = await Promise.all([
                platformService.getBranches(),
                platformService.getEmployees(),
                platformService.getAuditLogs()
            ]);
            setBranches(br || []);
            setEmployees(emp || []);
            setAuditLogs(logs || []);
        } catch (error) {
            toast.error("Failed to load tenant reports");
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = useMemo(() => employees.filter((e) =>
        `${e.first_name || ""} ${e.last_name || ""} ${e.employee_code || ""} ${e.email || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [employees, searchTerm]);

    const filteredBranches = useMemo(() => branches.filter((b) =>
        `${b.name || ""} ${b.code || ""} ${b.city || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [branches, searchTerm]);

    const filteredAudit = useMemo(() => auditLogs.filter((l) =>
        `${l.action || ""} ${l.table_name || ""} ${l.performed_by || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [auditLogs, searchTerm]);

    const exportExcel = () => {
        const rows = activeTab === "TEAM"
            ? filteredEmployees.map((e) => ({ Code: e.employee_code, Name: `${e.first_name || ""} ${e.last_name || ""}`, Email: e.email, Status: e.is_active === false ? "Inactive" : "Active" }))
            : activeTab === "BRANCHES"
                ? filteredBranches.map((b) => ({ Code: b.code, Name: b.name, Location: [b.city, b.state].filter(Boolean).join(", "), Staff: employees.filter((e) => String(e.branch_id) === String(b.id)).length }))
                : filteredAudit.map((l) => ({ Time: l.created_at, Action: l.action, Resource: l.table_name, User: l.performed_by }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab);
        XLSX.writeFile(wb, `tenant-${activeTab.toLowerCase()}-report.xlsx`);
    };

    const tabs = [
        { id: "TEAM" as const, label: "Team", icon: Users, count: filteredEmployees.length },
        { id: "BRANCHES" as const, label: "Branches", icon: Building2, count: filteredBranches.length },
        { id: "ACTIVITY" as const, label: "Activity", icon: History, count: filteredAudit.length }
    ];

    const activeRows = activeTab === "TEAM" ? filteredEmployees : activeTab === "BRANCHES" ? filteredBranches : filteredAudit;

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-12">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                            <ShieldCheck className="h-3.5 w-3.5" /> Tenant Reports
                        </div>
                        <h1 className="text-3xl font-black text-slate-950">EMS Tenant Intelligence</h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">Branch, team and activity reporting for this tenant.</p>
                    </div>
                    <button onClick={exportExcel} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
                        <Download className="h-4 w-4" /> Export Excel
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-2xl border p-5 text-left transition ${activeTab === tab.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                            <tab.icon className="mb-4 h-6 w-6 text-blue-600" />
                            <p className="text-sm font-black text-slate-950">{tab.label}</p>
                            <p className="text-2xl font-black text-slate-950">{tab.count}</p>
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search report records..." className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Primary</th>
                                        <th className="px-5 py-4">Secondary</th>
                                        <th className="px-5 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeRows.map((row: any) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4 font-bold text-slate-900">{row.name || `${row.first_name || ""} ${row.last_name || ""}` || row.action}</td>
                                            <td className="px-5 py-4 text-slate-500">{row.email || row.code || row.table_name || "-"}</td>
                                            <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span></td>
                                        </tr>
                                    ))}
                                    {activeRows.length === 0 && (
                                        <tr><td colSpan={3} className="px-5 py-16 text-center font-semibold text-slate-400">No records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}