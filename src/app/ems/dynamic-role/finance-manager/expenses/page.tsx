"use client";

import { useState, useEffect } from "react";
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Search,
    Plus,
    Loader2,
    ArrowLeft,
    ArrowRight,
    X,
    Filter,
    Building2,
    TrendingDown,
    Receipt,
    Wallet,
} from "lucide-react";
import api from "@/lib/api";

interface Expense {
    id: number;
    category: string;
    amount: number;
    expense_date: string;
    description: string | null;
    payment_mode: string | null;
    vendor_name: string | null;
    receipt_url: string | null;
    gst_input: number;
    is_recurring: boolean;
    created_at: string;
}

const CATEGORIES = [
    "RENT",
    "SALARY",
    "MARKETING",
    "UTILITIES",
    "MATERIALS",
    "MAINTENANCE",
    "SOFTWARE",
    "TAXES",
    "OTHER",
];
const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD"];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        category: "RENT",
        amount: "",
        expense_date: "",
        description: "",
        payment_mode: "CASH",
        vendor_name: "",
        gst_input: "",
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });
            if (categoryFilter) params.set("category", categoryFilter);
            const res = await api.get(`/ems/expenses?${params}`);
            if (res.data.success) {
                setExpenses(res.data.data.data || []);
                setTotalPages(res.data.data.pagination?.totalPages || 1);
                setTotalCount(res.data.data.pagination?.total || 0);
            }
        } catch {
            toast.error("Failed to load expenses");
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, categoryFilter]);

    const handleCreate = async () => {
        if (!form.amount || !form.expense_date) {
            toast.error("Amount and date are required");
            return;
        }
        try {
            setSubmitting(true);
            const res = await api.post("/ems/expenses", {
                category: form.category,
                amount: parseFloat(form.amount),
                expense_date: form.expense_date,
                description: form.description || null,
                payment_mode: form.payment_mode,
                vendor_name: form.vendor_name || null,
                gst_input: form.gst_input ? parseFloat(form.gst_input) : 0,
            });
            if (res.data.success) {
                toast.success("Expense recorded");
                setShowCreateModal(false);
                setForm({
                    category: "RENT",
                    amount: "",
                    expense_date: "",
                    description: "",
                    payment_mode: "CASH",
                    vendor_name: "",
                    gst_input: "",
                });
                fetchExpenses();
            }
        } catch {
            toast.error("Failed to record expense");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await api.delete(`/ems/expenses?id=${id}`);
            toast.success("Expense deleted");
            fetchExpenses();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const totalThisMonth = expenses
        .filter(
            (e) =>
                new Date(e.expense_date).getMonth() === new Date().getMonth(),
        )
        .reduce((s, e) => s + Number(e.amount), 0);

    const categoryTotals = CATEGORIES.map((cat) => ({
        category: cat,
        total: expenses
            .filter((e) => e.category === cat)
            .reduce((s, e) => s + Number(e.amount), 0),
    })).filter((c) => c.total > 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <FinanceManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Expenses
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Track business expenses
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Expense
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        This Month
                                    </p>
                                    <p className="text-xl font-bold text-gray-900">
                                        ₹{totalThisMonth.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Receipt className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Total Expenses
                                    </p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {totalCount}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        {categoryTotals.slice(0, 2).map((ct, i) => (
                            <Card key={i} className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            {ct.category}
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            ₹{ct.total.toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search expenses..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant={
                                            categoryFilter === ""
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => {
                                            setCategoryFilter("");
                                            setPage(1);
                                        }}
                                    >
                                        All
                                    </Button>
                                    {CATEGORIES.map((c) => (
                                        <Button
                                            key={c}
                                            variant={
                                                categoryFilter === c
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() => {
                                                setCategoryFilter(c);
                                                setPage(1);
                                            }}
                                            className="text-xs"
                                        >
                                            {c}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-500">
                                        Loading expenses...
                                    </span>
                                </div>
                            ) : expenses.length === 0 ? (
                                <div className="text-center py-12">
                                    <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        No expenses found
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Record your first expense
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-100">
                                            <tr>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Date
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Category
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Description
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Vendor
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Amount
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Mode
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {expenses.map((exp) => (
                                                <tr
                                                    key={exp.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 pr-4 text-sm text-gray-600">
                                                        {new Date(
                                                            exp.expense_date,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                            {exp.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-gray-800">
                                                        {exp.description || "—"}
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-gray-600">
                                                        {exp.vendor_name || "—"}
                                                    </td>
                                                    <td className="py-3 pr-4 font-bold text-gray-900">
                                                        ₹
                                                        {Number(
                                                            exp.amount,
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-gray-500">
                                                        {exp.payment_mode ||
                                                            "—"}
                                                    </td>
                                                    <td className="py-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    exp.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        Page {page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() =>
                                                setPage((p) => p - 1)
                                            }
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages}
                                            onClick={() =>
                                                setPage((p) => p + 1)
                                            }
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {showCreateModal && (
                    <div
                        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <div
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Record Expense
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                                            value={form.category}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    category: e.target.value,
                                                }))
                                            }
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Amount (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={form.amount}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    amount: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={form.expense_date}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                expense_date: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                                        rows={2}
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Payment Mode
                                        </label>
                                        <select
                                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                                            value={form.payment_mode}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    payment_mode:
                                                        e.target.value,
                                                }))
                                            }
                                        >
                                            {PAYMENT_MODES.map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Vendor Name
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Vendor"
                                            value={form.vendor_name}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    vendor_name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        GST Input (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={form.gst_input}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                gst_input: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={handleCreate}
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    Record Expense
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </FinanceManagerLayout>
        </div>
    );
}
