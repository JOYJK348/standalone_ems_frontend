"use client";

import { useState, useEffect } from "react";
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Search,
    CreditCard,
    Plus,
    Loader2,
    ArrowLeft,
    ArrowRight,
    X,
    CheckCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

interface Payment {
    id: number;
    student_id: number;
    amount_paid: number;
    payment_method: string;
    payment_date: string;
    payment_status: string;
    receipt_number: string;
    transaction_id: string | null;
    remarks: string | null;
    students: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    } | null;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);

    const [form, setForm] = useState({
        student_id: "",
        amount_paid: "",
        payment_method: "CASH",
        transaction_id: "",
        remarks: "",
    });

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });
            if (search) params.set("search", search);
            const res = await api.get(`/ems/payments?${params}`);
            if (res.data.success) {
                setPayments(res.data.data.data || []);
                setTotalPages(res.data.data.pagination?.totalPages || 1);
            }
        } catch (err) {
            toast.error("Failed to load payments");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get("/ems/students?limit=200");
            if (res.data.success) setStudents(res.data.data || []);
        } catch {}
    };

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const openCreateModal = () => {
        fetchStudents();
        setShowCreateModal(true);
    };

    const handleCreate = async () => {
        if (!form.student_id || !form.amount_paid) {
            toast.error("Student and amount are required");
            return;
        }
        try {
            setSubmitting(true);
            const res = await api.post("/ems/payments", {
                student_id: parseInt(form.student_id),
                amount_paid: parseFloat(form.amount_paid),
                payment_method: form.payment_method,
                transaction_id: form.transaction_id || null,
                remarks: form.remarks || null,
            });
            if (res.data.success) {
                toast.success("Payment recorded successfully");
                setShowCreateModal(false);
                setForm({
                    student_id: "",
                    amount_paid: "",
                    payment_method: "CASH",
                    transaction_id: "",
                    remarks: "",
                });
                fetchPayments();
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to record payment",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const statusBadge = (status: string) => {
        const isCompleted = status === "COMPLETED";
        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
                {isCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                ) : (
                    <Clock className="h-3 w-3" />
                )}
                {isCompleted ? "Completed" : "Pending"}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <FinanceManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Payments
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Record and track student payments
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Record Payment
                        </Button>
                    </div>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex gap-3 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search payments..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && setPage(1)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                                    <span className="ml-3 text-gray-500">
                                        Loading payments...
                                    </span>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        No payments recorded yet
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Record your first payment to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-100">
                                            <tr>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Receipt #
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Student
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Amount
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Method
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Date
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {payments.map((pmt) => (
                                                <tr
                                                    key={pmt.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 pr-4">
                                                        <span className="font-bold text-gray-900">
                                                            {pmt.receipt_number}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {pmt.students
                                                                ? `${pmt.students.first_name} ${pmt.students.last_name}`
                                                                : `Student #${pmt.student_id}`}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="font-bold text-gray-900">
                                                            ₹
                                                            {Number(
                                                                pmt.amount_paid,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="text-sm text-gray-600">
                                                            {pmt.payment_method}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(
                                                                pmt.payment_date,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        {statusBadge(
                                                            pmt.payment_status,
                                                        )}
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
                                    Record Payment
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Student
                                    </label>
                                    <select
                                        value={form.student_id}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                student_id: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select student</option>
                                        {students.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.first_name} {s.last_name}
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
                                        placeholder="Enter amount"
                                        value={form.amount_paid}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                amount_paid: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={form.payment_method}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                payment_method: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>
                                        <option value="CHEQUE">Cheque</option>
                                        <option value="ONLINE">
                                            Online Payment
                                        </option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Transaction ID
                                    </label>
                                    <Input
                                        placeholder="Optional transaction reference"
                                        value={form.transaction_id}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                transaction_id: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Remarks
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        rows={2}
                                        placeholder="Optional remarks"
                                        value={form.remarks}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                remarks: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={handleCreate}
                                    disabled={submitting}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CreditCard className="h-4 w-4 mr-2" />
                                    )}
                                    Record Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </FinanceManagerLayout>
        </div>
    );
}
