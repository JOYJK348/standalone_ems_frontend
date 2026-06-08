"use client";

import { useState, useEffect } from "react";
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Bell,
    Loader2,
    CheckCircle,
    Clock,
    AlertTriangle,
    IndianRupee,
    Send,
    Link,
    ArrowLeft,
    ArrowRight,
    Phone,
    User,
    Calendar,
} from "lucide-react";
import api from "@/lib/api";

interface DueReminder {
    id: number;
    student_id: number;
    amount_due: number;
    due_date: string;
    reminder_sent: boolean;
    sent_via: string | null;
    payment_received: boolean;
    late_fee_applied: number;
    students: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
    };
}

export default function DueTrackingPage() {
    const [dues, setDues] = useState<DueReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchDues = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            });
            if (statusFilter) params.set("status", statusFilter);
            const res = await api.get(`/ems/dues?${params}`);
            if (res.data.success) {
                setDues(res.data.data.data || []);
                setTotalPages(res.data.data.pagination?.totalPages || 1);
            }
        } catch {
            toast.error("Failed to load dues");
            setDues([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDues();
    }, [page, statusFilter]);

    const handleSendReminder = async (due: DueReminder) => {
        try {
            setSending(due.id);
            const linkRes = await api.post("/ems/payment-links", {
                student_id: due.student_id,
                amount: due.amount_due + (due.late_fee_applied || 0),
            });
            if (linkRes.data.success) {
                await api.put(`/ems/dues?id=${due.id}`, {
                    reminder_sent: true,
                    sent_via: "WHATSAPP",
                    reminder_date: new Date().toISOString(),
                });
                toast.success("Reminder sent!");
                fetchDues();
            }
        } catch {
            toast.error("Failed to send reminder");
        } finally {
            setSending(null);
        }
    };

    const handleMarkPaid = async (id: number) => {
        try {
            const res = await api.put(`/ems/dues?id=${id}`, {
                payment_received: true,
            });
            if (res.data.success) {
                toast.success("Marked as paid");
                fetchDues();
            }
        } catch {
            toast.error("Failed to update");
        }
    };

    const stats = {
        total: dues.length,
        overdue: dues.filter(
            (d) => new Date(d.due_date) < new Date() && !d.payment_received,
        ).length,
        reminded: dues.filter((d) => d.reminder_sent).length,
        paid: dues.filter((d) => d.payment_received).length,
    };

    const statusBadge = (due: DueReminder) => {
        const isOverdue =
            new Date(due.due_date) < new Date() && !due.payment_received;
        const isPaid = due.payment_received;
        if (isPaid)
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3" /> Paid
                </span>
            );
        if (isOverdue)
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    <AlertTriangle className="h-3 w-3" /> Overdue
                </span>
            );
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                <Clock className="h-3 w-3" /> Due Soon
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
                                Due Tracking
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Track fees, send reminders, collect payments
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                label: "Total Dues",
                                value: stats.total,
                                icon: Bell,
                                color: "blue",
                            },
                            {
                                label: "Overdue",
                                value: stats.overdue,
                                icon: AlertTriangle,
                                color: "red",
                            },
                            {
                                label: "Reminded",
                                value: stats.reminded,
                                icon: Send,
                                color: "yellow",
                            },
                            {
                                label: "Paid",
                                value: stats.paid,
                                icon: CheckCircle,
                                color: "green",
                            },
                        ].map((s, i) => (
                            <div key={i}>
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-lg ${s.color === "red" ? "bg-red-100" : s.color === "yellow" ? "bg-yellow-100" : s.color === "green" ? "bg-green-100" : "bg-blue-100"} flex items-center justify-center`}
                                        >
                                            <s.icon
                                                className={`h-5 w-5 ${s.color === "red" ? "text-red-600" : s.color === "yellow" ? "text-yellow-600" : s.color === "green" ? "text-green-600" : "text-blue-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {s.label}
                                            </p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {s.value}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex gap-2 mb-4">
                                {[
                                    "",
                                    "overdue",
                                    "pending",
                                    "reminded",
                                    "paid",
                                ].map((s) => (
                                    <Button
                                        key={s}
                                        variant={
                                            statusFilter === s
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => {
                                            setStatusFilter(s);
                                            setPage(1);
                                        }}
                                        className="text-xs"
                                    >
                                        {s
                                            ? s.charAt(0).toUpperCase() +
                                              s.slice(1)
                                            : "All"}
                                    </Button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-500">
                                        Loading dues...
                                    </span>
                                </div>
                            ) : dues.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        No dues found
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        All clear! No pending fees.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-100">
                                            <tr>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Student
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Amount
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Due Date
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Status
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Reminder
                                                </th>
                                                <th className="pb-3 text-xs font-bold text-gray-400 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {dues.map((due) => (
                                                <tr
                                                    key={due.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <span className="font-bold text-gray-900">
                                                                    {
                                                                        due
                                                                            .students
                                                                            ?.first_name
                                                                    }{" "}
                                                                    {
                                                                        due
                                                                            .students
                                                                            ?.last_name
                                                                    }
                                                                </span>
                                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                    <Phone className="h-3 w-3" />
                                                                    {
                                                                        due
                                                                            .students
                                                                            ?.phone
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="font-bold text-gray-900">
                                                            ₹
                                                            {Number(
                                                                due.amount_due,
                                                            ).toLocaleString()}
                                                        </span>
                                                        {due.late_fee_applied >
                                                            0 && (
                                                            <span className="ml-1 text-xs text-red-500">
                                                                (+₹
                                                                {
                                                                    due.late_fee_applied
                                                                }{" "}
                                                                late fee)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {new Date(
                                                                    due.due_date,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        {statusBadge(due)}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        {due.reminder_sent ? (
                                                            <span className="text-xs text-green-600">
                                                                ✅{" "}
                                                                {due.sent_via ||
                                                                    "Sent"}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                Not sent
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleSendReminder(
                                                                        due,
                                                                    )
                                                                }
                                                                disabled={
                                                                    sending ===
                                                                        due.id ||
                                                                    due.payment_received
                                                                }
                                                                title="Send Reminder"
                                                            >
                                                                {sending ===
                                                                due.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Send className="h-4 w-4 text-blue-600" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleMarkPaid(
                                                                        due.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    due.payment_received
                                                                }
                                                                title="Mark as Paid"
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        </div>
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
            </FinanceManagerLayout>
        </div>
    );
}
