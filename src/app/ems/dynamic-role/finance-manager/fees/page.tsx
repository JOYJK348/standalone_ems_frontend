"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Search, Wallet, Plus, Loader2, ArrowLeft, ArrowRight,
  X, Edit3, Trash2, ToggleLeft, ToggleRight, Layers
} from "lucide-react"
import api from "@/lib/api"

interface FeeStructure {
  id: number
  course_id: number
  fee_name: string
  fee_type: string
  amount: number
  due_date: string | null
  is_mandatory: boolean
  is_active: boolean
  courses: { course_name: string; course_code: string } | null
}

interface Course {
  id: number
  course_name: string
  course_code: string
}

export default function FeesPage() {
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<FeeStructure | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])

  const [form, setForm] = useState({
    course_id: "",
    fee_name: "",
    fee_type: "TUITION",
    amount: "",
    due_date: "",
    is_mandatory: true
  })

  const fetchFees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: page.toString(), limit: "10", active: "false" })
      if (search) params.set("search", search)
      const res = await api.get(`/ems/fees?${params}`)
      if (res.data.success) {
        setFees(res.data.data.data || [])
        setTotalPages(res.data.data.pagination?.totalPages || 1)
      }
    } catch (err) {
      toast.error("Failed to load fee structures")
      setFees([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await api.get("/ems/courses?limit=200")
      if (res.data.success) setCourses(res.data.data?.courses || res.data.data?.data || [])
    } catch {}
  }

  useEffect(() => { fetchFees() }, [page])

  const openCreateModal = () => {
    fetchCourses()
    setForm({ course_id: "", fee_name: "", fee_type: "TUITION", amount: "", due_date: "", is_mandatory: true })
    setShowCreateModal(true)
  }

  const openEditModal = (fee: FeeStructure) => {
    fetchCourses()
    setForm({
      course_id: fee.course_id.toString(),
      fee_name: fee.fee_name,
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      due_date: fee.due_date ? fee.due_date.split("T")[0] : "",
      is_mandatory: fee.is_mandatory
    })
    setShowEditModal(fee)
  }

  const handleCreate = async () => {
    if (!form.course_id || !form.fee_name || !form.amount) {
      toast.error("Course, fee name, and amount are required")
      return
    }
    try {
      setSubmitting(true)
      const res = await api.post("/ems/fees", {
        course_id: parseInt(form.course_id),
        fee_name: form.fee_name,
        fee_type: form.fee_type,
        amount: parseFloat(form.amount),
        due_date: form.due_date || null,
        is_mandatory: form.is_mandatory
      })
      if (res.data.success) {
        toast.success("Fee structure created")
        setShowCreateModal(false)
        fetchFees()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create fee structure")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!showEditModal) return
    try {
      setSubmitting(true)
      const res = await api.put(`/ems/fees?id=${showEditModal.id}`, {
        fee_name: form.fee_name,
        fee_type: form.fee_type,
        amount: parseFloat(form.amount),
        due_date: form.due_date || null,
        is_mandatory: form.is_mandatory
      })
      if (res.data.success) {
        toast.success("Fee structure updated")
        setShowEditModal(null)
        fetchFees()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update fee structure")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (fee: FeeStructure) => {
    try {
      const res = await api.put(`/ems/fees?id=${fee.id}`, { is_active: !fee.is_active })
      if (res.data.success) {
        toast.success(`Fee ${fee.is_active ? "deactivated" : "activated"}`)
        fetchFees()
      }
    } catch {
      toast.error("Failed to toggle fee status")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this fee structure?")) return
    try {
      const res = await api.delete(`/ems/fees?id=${id}`)
      if (res.data.success) {
        toast.success("Fee structure deleted")
        fetchFees()
      }
    } catch {
      toast.error("Failed to delete fee structure")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <FinanceManagerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage fee structures for courses</p>
            </div>
            <div className="flex gap-2">
              <Link href="/ems/dynamic-role/finance-manager/fee-structure">
                <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  <Layers className="h-4 w-4 mr-2" /> Create with Installments
                </Button>
              </Link>
              <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" /> Add Fee Structure
              </Button>
            </div>
          </motion.div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search fee structures..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && setPage(1)}
                    className="pl-9"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                  <span className="ml-3 text-gray-500">Loading fee structures...</span>
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No fee structures found</p>
                  <p className="text-sm text-gray-400 mt-1">Add fee structures for your courses</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Fee Name</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Course</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Type</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Amount</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Mandatory</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Active</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {fees.map(fee => (
                        <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <span className="font-bold text-gray-900">{fee.fee_name}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm text-gray-600">
                              {fee.courses ? `${fee.courses.course_name} (${fee.courses.course_code})` : `Course #${fee.course_id}`}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{fee.fee_type}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-bold text-gray-900">₹{Number(fee.amount).toLocaleString()}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-bold ${fee.is_mandatory ? "text-blue-600" : "text-gray-400"}`}>
                              {fee.is_mandatory ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <button onClick={() => toggleActive(fee)}>
                              {fee.is_active
                                ? <ToggleRight className="h-5 w-5 text-green-600" />
                                : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                            </button>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(fee)}>
                                <Edit3 className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(fee.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
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
                  <h2 className="text-xl font-bold text-gray-900">Add Fee Structure</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Course</label>
                    <select
                      value={form.course_id}
                      onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee Name</label>
                    <Input
                      placeholder="e.g. Tuition Fee, Lab Fee"
                      value={form.fee_name}
                      onChange={e => setForm(f => ({ ...f, fee_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee Type</label>
                    <select
                      value={form.fee_type}
                      onChange={e => setForm(f => ({ ...f, fee_type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="TUITION">Tuition</option>
                      <option value="LAB">Lab</option>
                      <option value="EXAM">Exam</option>
                      <option value="LIBRARY">Library</option>
                      <option value="SPORTS">Sports</option>
                      <option value="OTHER">Other</option>
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
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_mandatory}
                      onChange={e => setForm(f => ({ ...f, is_mandatory: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="font-bold">Mandatory fee</span>
                  </label>
                  <Button
                    onClick={handleCreate}
                    disabled={submitting}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Fee Structure
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit Fee Structure</h2>
                  <button onClick={() => setShowEditModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee Name</label>
                    <Input value={form.fee_name} onChange={e => setForm(f => ({ ...f, fee_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee Type</label>
                    <select value={form.fee_type} onChange={e => setForm(f => ({ ...f, fee_type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500">
                      <option value="TUITION">Tuition</option>
                      <option value="LAB">Lab</option>
                      <option value="EXAM">Exam</option>
                      <option value="LIBRARY">Library</option>
                      <option value="SPORTS">Sports</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                    <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                    <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.is_mandatory}
                      onChange={e => setForm(f => ({ ...f, is_mandatory: e.target.checked }))}
                      className="rounded border-gray-300" />
                    <span className="font-bold">Mandatory fee</span>
                  </label>
                  <Button onClick={handleUpdate} disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-700">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                    Update Fee Structure
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </FinanceManagerLayout>
    </div>
  )
}
