"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Search, Plus, FileText, Eye, Download, Bell,
  Loader2, ArrowLeft, ArrowRight, X, CheckCircle,
  Clock, AlertTriangle, Ban, Filter, Percent
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import DiscountModal from "@/components/ems/finance/DiscountModal"

interface GstBreakup {
  taxable_amount: number
  cgst_amount: number
  sgst_amount: number
  total_gst: number
  total_amount: number
  gstin: string
  hsn_code: string
  gst_rate: number
  cgst_rate: number
  sgst_rate: number
}

interface Invoice {
  id: number
  invoice_number: string
  student_id: number | null
  amount: number
  due_date: string
  status: string
  description: string | null
  created_at: string
  discount_id: number | null
  discount_amount: number
  final_amount: number | null
  is_gst_invoice: boolean
  taxable_amount: number | null
  cgst_amount: number | null
  sgst_amount: number | null
  total_gst_amount: number | null
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState<Invoice | null>(null)
  const [showDiscountModal, setShowDiscountModal] = useState<Invoice | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [students, setStudents] = useState<{ id: number; first_name: string; last_name: string; student_code: string }[]>([])
  const [form, setForm] = useState({ student_id: "", amount: "", due_date: "", description: "" })
  const [useGst, setUseGst] = useState(false)
  const [gstBreakup, setGstBreakup] = useState<GstBreakup | null>(null)
  const [gstLoading, setGstLoading] = useState(false)

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: page.toString(), limit: "10" })
      if (statusFilter) params.set("status", statusFilter)
      if (search) params.set("search", search)
      const res = await api.get(`/ems/invoices?${params}`)
      if (res.data.success) {
        setInvoices(res.data.data.data || [])
        setTotalPages(res.data.data.pagination?.totalPages || 1)
        setTotalCount(res.data.data.pagination?.total || 0)
      }
    } catch (err: any) {
      toast.error("Failed to load invoices")
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [page, statusFilter])

  useEffect(() => {
    api.get('/ems/students?limit=500')
      .then(res => {
        if (res.data.success) setStudents(res.data.data || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!useGst || !form.amount) {
      setGstBreakup(null)
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setGstBreakup(null)
      return
    }
    setGstLoading(true)
    api.post('/ems/gst/calculate', { amount })
      .then(res => {
        if (res.data.success) setGstBreakup(res.data.data)
      })
      .catch(() => setGstBreakup(null))
      .finally(() => setGstLoading(false))
  }, [useGst, form.amount])

  const handleCreate = async () => {
    if (!form.student_id || !form.amount || !form.due_date) {
      toast.error("Student, amount and due date are required")
      return
    }
    try {
      setSubmitting(true)
      const payload: any = {
        student_id: parseInt(form.student_id),
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        description: form.description || null
      }
      if (useGst && gstBreakup) {
        payload.is_gst_invoice = true
        payload.taxable_amount = gstBreakup.taxable_amount
        payload.cgst_amount = gstBreakup.cgst_amount
        payload.sgst_amount = gstBreakup.sgst_amount
        payload.total_gst_amount = gstBreakup.total_gst
      }
      const res = await api.post("/ems/invoices", payload)
      if (res.data.success) {
        toast.success("Invoice created successfully")
        setShowCreateModal(false)
        setForm({ student_id: "", amount: "", due_date: "", description: "" })
        setUseGst(false)
        setGstBreakup(null)
        fetchInvoices()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create invoice")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      setSubmitting(true)
      const res = await api.put(`/ems/invoices?id=${id}&mode=status`, { status })
      if (res.data.success) {
        toast.success(`Invoice marked as ${status}`)
        setShowStatusModal(null)
        fetchInvoices()
      }
    } catch (err: any) {
      toast.error("Failed to update invoice status")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      const res = await api.delete(`/ems/invoices?id=${id}`)
      if (res.data.success) {
        toast.success("Invoice deleted")
        fetchInvoices()
      }
    } catch (err: any) {
      toast.error("Failed to delete invoice")
    }
  }

  const statusBadge = (status: string) => {
    const maps: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      paid: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Paid" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
      overdue: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle, label: "Overdue" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-600", icon: Ban, label: "Cancelled" },
    }
    const m = maps[status] || maps.pending
    const Icon = m.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${m.bg} ${m.text}`}>
        <Icon className="h-3 w-3" /> {m.label}
      </span>
    )
  }

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  }

  const stats = [
    { label: "Total Invoices", value: totalCount, icon: FileText, color: "blue" },
    { label: "Pending", value: invoices.filter(i => i.status === "pending").length, icon: Clock, color: "yellow" },
    { label: "Paid", value: invoices.filter(i => i.status === "paid").length, icon: CheckCircle, color: "green" },
    { label: "Overdue", value: invoices.filter(i => i.status === "overdue").length, icon: AlertTriangle, color: "red" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <FinanceManagerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice Management</h1>
              <p className="text-sm text-gray-500 mt-1">Create and manage student invoices</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/api/ems/gst/gstr1?format=csv', '_blank')}
                className="text-xs"
              >
                GSTR-1 Export
              </Button>
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Create Invoice
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colorMap[s.color].bg} flex items-center justify-center`}>
                      <s.icon className={`h-5 w-5 ${colorMap[s.color].text}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchInvoices()}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  {["", "pending", "paid", "overdue"].map(s => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setStatusFilter(s); setPage(1) }}
                      className="text-xs"
                    >
                      {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-500">Loading invoices...</span>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No invoices found</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first invoice to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Invoice #</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Amount</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Due Date</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <span className="font-bold text-gray-900">{inv.invoice_number}</span>
                            {inv.description && <p className="text-xs text-gray-400 mt-0.5">{inv.description}</p>}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              {inv.is_gst_invoice && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">GST</span>
                              )}
                              {inv.discount_id ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900">₹{Number(inv.final_amount ?? inv.amount).toLocaleString()}</span>
                                  <span className="text-xs text-gray-400 line-through">₹{Number(inv.amount).toLocaleString()}</span>
                                  <span className="text-xs text-green-600">-₹{Number(inv.discount_amount).toLocaleString()}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-gray-900">₹{Number(inv.amount).toLocaleString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm text-gray-600">{new Date(inv.due_date).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3 pr-4">{statusBadge(inv.status)}</td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              {inv.student_id && (
                                <Button variant="ghost" size="sm" onClick={() => setShowDiscountModal(inv)} title="Add Discount">
                                  <Percent className="h-4 w-4 text-purple-600" />
                                </Button>
                              )}
                              {inv.status !== "paid" && (
                                <Button variant="ghost" size="sm" onClick={() => setShowStatusModal(inv)}>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)}>
                                <X className="h-4 w-4 text-red-500" />
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
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Student</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.student_id}
                      onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                    >
                      <option value="">Select Student</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.student_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={form.due_date}
                      onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="gst-toggle"
                      checked={useGst}
                      onChange={e => setUseGst(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="gst-toggle" className="text-sm font-bold text-gray-700">GST Invoice</label>
                  </div>

                  {useGst && gstLoading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" /> Calculating GST...
                    </div>
                  )}

                  {useGst && gstBreakup && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>GSTIN: {gstBreakup.gstin}</span>
                        <span>HSN: {gstBreakup.hsn_code}</span>
                      </div>
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Taxable Amount</span>
                          <span className="font-medium">₹{gstBreakup.taxable_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>CGST ({gstBreakup.cgst_rate}%)</span>
                          <span>₹{gstBreakup.cgst_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>SGST ({gstBreakup.sgst_rate}%)</span>
                          <span>₹{gstBreakup.sgst_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 text-base">
                          <span>Total</span>
                          <span>₹{gstBreakup.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Optional description"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Invoice
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showStatusModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setShowStatusModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Invoice <span className="font-bold text-gray-700">{showStatusModal.invoice_number}</span>
                </p>
                <div className="space-y-2">
                  {showStatusModal.status !== "paid" && (
                    <Button onClick={() => handleStatusUpdate(showStatusModal.id, "paid")} disabled={submitting} className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark as Paid
                    </Button>
                  )}
                  {showStatusModal.status !== "overdue" && (
                    <Button onClick={() => handleStatusUpdate(showStatusModal.id, "overdue")} disabled={submitting} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Mark as Overdue
                    </Button>
                  )}
                  {showStatusModal.status !== "cancelled" && (
                    <Button onClick={() => handleStatusUpdate(showStatusModal.id, "cancelled")} disabled={submitting} variant="outline" className="w-full">
                      <Ban className="h-4 w-4 mr-2" /> Cancel Invoice
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full" onClick={() => setShowStatusModal(null)}>Close</Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showDiscountModal && (
            <DiscountModal
              studentId={showDiscountModal.student_id || undefined}
              invoiceId={showDiscountModal.id}
              invoiceAmount={showDiscountModal.amount}
              onClose={() => setShowDiscountModal(null)}
              onSave={() => { fetchInvoices(); setShowDiscountModal(null) }}
            />
          )}
        </AnimatePresence>
      </FinanceManagerLayout>
    </div>
  )
}
