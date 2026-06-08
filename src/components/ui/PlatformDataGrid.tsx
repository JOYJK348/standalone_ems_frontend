"use client";

import React, { useState } from "react";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    sortable?: boolean;
}

interface PlatformDataGridProps<T> {
    title: string;
    subtitle?: string;
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    filterOptions?: {
        label: string;
        key: keyof T;
        options: string[];
    }[];
    searchPlaceholder?: string;
}

export default function PlatformDataGrid<T>({
    title,
    subtitle,
    data,
    columns,
    loading,
    onEdit,
    onDelete,
    filterOptions,
    searchPlaceholder = "Search..."
}: PlatformDataGridProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Filter Logic
    const filteredData = data.filter((item: any) => {
        const matchesSearch = Object.values(item).some(
            val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
            if (value === "ALL") return true;
            return item[key] === value;
        });

        return matchesSearch && matchesFilters;
    });

    // Sort Logic
    const sortedData = [...filteredData].sort((a: any, b: any) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        const aVal = a[key]?.toString().toLowerCase() || "";
        const bVal = b[key]?.toString().toLowerCase() || "";

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
            {/* Header & Filters */}
            <div className="p-6 border-b border-slate-100 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64 outline-none"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>

                        {filterOptions?.map(opt => (
                            <select
                                key={opt.label}
                                value={filters[opt.key as string] || "ALL"}
                                onChange={(e) => setFilters({ ...filters, [opt.key as string]: e.target.value })}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                                <option value="ALL">All {opt.label}</option>
                                {opt.options.map(o => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-blue-600' : ''}`}
                                    onClick={() => col.sortable && typeof col.accessor === 'string' && handleSort(col.accessor as string)}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && <ArrowUpDown className="w-3 h-3" />}
                                    </div>
                                </th>
                            ))}
                            {(onEdit || onDelete) && <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}><td colSpan={columns.length + 1} className="px-6 py-8"><div className="h-6 bg-slate-50 rounded-lg animate-pulse" /></td></tr>
                            ))
                        ) : sortedData.length === 0 ? (
                            <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 text-sm">No records found matching your criteria.</td></tr>
                        ) : (
                            sortedData.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                    {columns.map((col, idy) => (
                                        <td key={idy} className="px-6 py-4 text-sm font-medium text-slate-700">
                                            {typeof col.accessor === 'function' ? col.accessor(item) : (item as any)[col.accessor]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {onEdit && (
                                                    <button onClick={() => onEdit(item)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => onDelete(item)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase">
                    Showing {sortedData.length} of {data.length} entries
                </p>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold">1</button>
                    </div>
                    <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-not-allowed">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
