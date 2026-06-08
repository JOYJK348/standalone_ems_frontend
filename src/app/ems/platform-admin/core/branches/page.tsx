"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PlatformDataGrid from "@/components/ui/PlatformDataGrid";
import { platformService } from "@/services/platformService";
import { MapPin, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BranchesPage() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await platformService.getBranches();
            setBranches(data);
        } catch (error) {
            toast.error("Failed to load branches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const columns = [
        {
            header: "Branch",
            accessor: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.code}</p>
                    </div>
                </div>
            )
        },
        { header: "Location", accessor: (item: any) => `${item.city}, ${item.state}` },
        { header: "Type", accessor: (item: any) => <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold uppercase text-slate-600 border border-slate-200">{item.branch_type || 'BRANCH'}</span> },
        {
            header: "Status",
            accessor: (item: any) => (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${item.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/ems/platform-admin/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Branch Management</h1>
                            <p className="text-sm text-slate-500 font-medium">Manage geographic locations and branch details.</p>
                        </div>
                    </div>

                    <button className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5" />
                        <span>Add Branch</span>
                    </button>
                </div>

                <PlatformDataGrid
                    title="Branch Directory"
                    subtitle="Filter and manage branch offices across all entities"
                    data={branches}
                    columns={columns}
                    loading={loading}
                    searchPlaceholder="Search branches by name, city or code..."
                />
            </div>
        </DashboardLayout>
    );
}
