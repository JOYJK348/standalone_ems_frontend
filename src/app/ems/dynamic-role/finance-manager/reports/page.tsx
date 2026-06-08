"use client";

import { useState, useEffect } from "react";
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Loader2,
    Download,
    DollarSign,
    FileText,
    CreditCard,
    AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

interface SummaryReport {
    totalRevenue: number;
    totalPayments: number;
    pendingCount: number;
    paidCount: number;
    overdueCount: number;
    outstandingBalance: number;
}

interface MonthlyData {
    month: string;
    revenue: number;
    collections: number;
    label: string;
}

interface InvoiceStatus {
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<
        "summary" | "monthly" | "invoice_status"
    >("summary");
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<SummaryReport | null>(null);
    const [monthly, setMonthly] = useState<MonthlyData[]>([]);
    const [statusData, setStatusData] = useState<InvoiceStatus | null>(null);

    const fetchReport = async (type: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/ems/reports?type=${type}`);
            if (res.data.success) {
                if (type === "summary") setSummary(res.data.data);
                else if (type === "monthly")
                    setMonthly(res.data.data.monthly || []);
                else if (type === "invoice_status")
                    setStatusData(res.data.data.statuses);
            }
        } catch (err) {
            toast.error("Failed to load report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(activeTab);
    }, [activeTab]);

    const summaryCards = summary
        ? [
              {
                  label: "Total Revenue",
                  value: `₹${summary.totalRevenue.toLocaleString()}`,
                  icon: DollarSign,
                  bg: "bg-blue-100",
                  text: "text-blue-600",
              },
              {
                  label: "Total Collections",
                  value: `₹${summary.totalPayments.toLocaleString()}`,
                  icon: CreditCard,
                  bg: "bg-green-100",
                  text: "text-green-600",
              },
              {
                  label: "Outstanding",
                  value: `₹${summary.outstandingBalance.toLocaleString()}`,
                  icon: AlertTriangle,
                  bg: "bg-red-100",
                  text: "text-red-600",
              },
              {
                  label: "Paid Invoices",
                  value: summary.paidCount.toString(),
                  icon: FileText,
                  bg: "bg-purple-100",
                  text: "text-purple-600",
              },
          ]
        : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <FinanceManagerLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Financial Reports
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View revenue, collections, and invoice analytics
                        </p>
                    </div>

                    <div className="flex gap-2 mb-6">
                        {(
                            ["summary", "monthly", "invoice_status"] as const
                        ).map((tab) => (
                            <Button
                                key={tab}
                                variant={
                                    activeTab === tab ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setActiveTab(tab)}
                                className="capitalize"
                            >
                                {tab === "summary" && (
                                    <BarChart3 className="h-4 w-4 mr-1.5" />
                                )}
                                {tab === "monthly" && (
                                    <TrendingUp className="h-4 w-4 mr-1.5" />
                                )}
                                {tab === "invoice_status" && (
                                    <PieChart className="h-4 w-4 mr-1.5" />
                                )}
                                {tab === "summary"
                                    ? "Summary"
                                    : tab === "monthly"
                                      ? "Monthly Trend"
                                      : "Invoice Status"}
                            </Button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-500">
                                Generating report...
                            </span>
                        </div>
                    ) : (
                        <>
                            {activeTab === "summary" && summary && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {summaryCards.map((c, i) => (
                                            <div key={i}>
                                                <Card className="border-0 shadow-sm">
                                                    <CardContent className="p-5 flex items-center gap-4">
                                                        <div
                                                            className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}
                                                        >
                                                            <c.icon
                                                                className={`h-6 w-6 ${c.text}`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                {c.label}
                                                            </p>
                                                            <p className="text-xl font-bold text-gray-900">
                                                                {c.value}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>

                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">
                                                Invoice Breakdown
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    {
                                                        label: "Pending",
                                                        value: summary.pendingCount,
                                                        color: "bg-yellow-400",
                                                    },
                                                    {
                                                        label: "Paid",
                                                        value: summary.paidCount,
                                                        color: "bg-green-400",
                                                    },
                                                    {
                                                        label: "Overdue",
                                                        value: summary.overdueCount,
                                                        color: "bg-red-400",
                                                    },
                                                ].map((item) => {
                                                    const total =
                                                        summary.pendingCount +
                                                        summary.paidCount +
                                                        summary.overdueCount;
                                                    const pct =
                                                        total > 0
                                                            ? Math.round(
                                                                  (item.value /
                                                                      total) *
                                                                      100,
                                                              )
                                                            : 0;
                                                    return (
                                                        <div
                                                            key={item.label}
                                                            className="text-center p-4 bg-gray-50 rounded-xl"
                                                        >
                                                            <div
                                                                className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`}
                                                            />
                                                            <p className="text-2xl font-bold text-gray-900">
                                                                {item.value}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.label} (
                                                                {pct}%)
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === "monthly" && (
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">
                                            Monthly Revenue vs Collections (Last
                                            6 Months)
                                        </h3>
                                        {monthly.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                No monthly data available
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {monthly.map((m, i) => {
                                                    const maxVal = Math.max(
                                                        ...monthly.map((x) =>
                                                            Math.max(
                                                                x.revenue,
                                                                x.collections,
                                                            ),
                                                        ),
                                                        1,
                                                    );
                                                    return (
                                                        <div key={i}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="font-bold text-gray-700">
                                                                    {m.label}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    ₹
                                                                    {(
                                                                        m.revenue +
                                                                        m.collections
                                                                    ).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-blue-600 w-16">
                                                                        Revenue
                                                                    </span>
                                                                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                                                        <div
                                                                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                                            style={{
                                                                                width: `${(m.revenue / maxVal) * 100}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 w-20 text-right">
                                                                        ₹
                                                                        {m.revenue.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-green-600 w-16">
                                                                        Collections
                                                                    </span>
                                                                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                                                        <div
                                                                            className="bg-green-500 h-full rounded-full transition-all duration-500"
                                                                            style={{
                                                                                width: `${(m.collections / maxVal) * 100}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 w-20 text-right">
                                                                        ₹
                                                                        {m.collections.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "invoice_status" && statusData && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">
                                                Invoice Status Distribution
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    {
                                                        label: "Paid",
                                                        value: statusData.paid,
                                                        color: "bg-green-500",
                                                    },
                                                    {
                                                        label: "Pending",
                                                        value: statusData.pending,
                                                        color: "bg-yellow-500",
                                                    },
                                                    {
                                                        label: "Overdue",
                                                        value: statusData.overdue,
                                                        color: "bg-red-500",
                                                    },
                                                    {
                                                        label: "Cancelled",
                                                        value: statusData.cancelled,
                                                        color: "bg-gray-400",
                                                    },
                                                ].map((item) => {
                                                    const total =
                                                        statusData.paid +
                                                        statusData.pending +
                                                        statusData.overdue +
                                                        statusData.cancelled;
                                                    const pct =
                                                        total > 0
                                                            ? Math.round(
                                                                  (item.value /
                                                                      total) *
                                                                      100,
                                                              )
                                                            : 0;
                                                    return (
                                                        <div key={item.label}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-700">
                                                                    {item.label}
                                                                </span>
                                                                <span className="font-bold text-gray-900">
                                                                    {item.value}{" "}
                                                                    ({pct}%)
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                                                                    style={{
                                                                        width: `${pct}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">
                                                Summary
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                                                    <span className="text-green-800 font-medium">
                                                        Total Paid
                                                    </span>
                                                    <span className="font-bold text-green-900">
                                                        ₹
                                                        {(
                                                            summary?.totalRevenue ||
                                                            0
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                                                    <span className="text-yellow-800 font-medium">
                                                        Pending Amount
                                                    </span>
                                                    <span className="font-bold text-yellow-900">
                                                        ₹
                                                        {(
                                                            summary?.outstandingBalance ||
                                                            0
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                                                    <span className="text-red-800 font-medium">
                                                        Overdue Count
                                                    </span>
                                                    <span className="font-bold text-red-900">
                                                        {statusData.overdue}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                                                    <span className="text-blue-800 font-medium">
                                                        Total Invoices
                                                    </span>
                                                    <span className="font-bold text-blue-900">
                                                        {statusData.paid +
                                                            statusData.pending +
                                                            statusData.overdue +
                                                            statusData.cancelled}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </FinanceManagerLayout>
        </div>
    );
}
