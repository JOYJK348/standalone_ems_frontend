"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import HRManagerLayout from "@/components/layout/HRManagerLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  UserPlus, Search, Loader2, ChevronLeft, ChevronRight, Plus, X
} from "lucide-react"
import api from "@/lib/api"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog"

interface Enrollment {
  id: number
  students: { first_name: string; last_name: string; email: string }
  courses: { course_name: string; course_code: string }
  enrollment_status: string
  created_at: string
}

interface Student {
  id: number
  first_name: string
  last_name: string
}

interface Course {
  id: number
  title: string
  code: string
  course_name?: string
  course_code?: string
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [form, setForm] = useState({ student_id: "", course_id: "", batch_id: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: page.toString(), limit: "10" })
      if (search) params.set("search", search)
      const res = await api.get(`/ems/hr/enrollments?${params}`)
      if (res.data.success) {
        setEnrollments(res.data.data.data || [])
        setTotalPages(res.data.data.pagination?.totalPages || 1)
      }
    } catch {
      toast.error("Failed to load enrollments")
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await api.get("/ems/students?limit=100")
      if (res.data.success) setStudents(Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [])
    } catch {}
  }

  const fetchCourses = async () => {
    try {
      const res = await api.get("/ems/courses?limit=100")
      if (res.data.success) setCourses(res.data.data?.courses || res.data.data?.data || [])
    } catch {}
  }

  useEffect(() => { fetchEnrollments() }, [page])
  useEffect(() => { if (showCreateModal) { fetchStudents(); fetchCourses() } }, [showCreateModal])

  const handleEnroll = async () => {
    if (!form.student_id || !form.course_id) {
      toast.error("Student and course are required")
      return
    }
    try {
      setSubmitting(true)
      const res = await api.post("/ems/hr/enrollments", {
        student_id: parseInt(form.student_id),
        course_id: parseInt(form.course_id),
        batch_id: form.batch_id ? parseInt(form.batch_id) : null,
      })
      if (res.data.success) {
        toast.success("Student enrolled successfully")
        setShowCreateModal(false)
        setForm({ student_id: "", course_id: "", batch_id: "" })
        fetchEnrollments()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to enroll student")
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
    dropped: "bg-red-100 text-red-700",
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <HRManagerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
              Enrollments
            </h1>
            <p className="text-gray-600 mt-1">Manage student enrollments across courses</p>
          </motion.div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search enrollments..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10 border-gray-200"
              />
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Enroll Student
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600">Loading enrollments...</span>
            </div>
          ) : (
            <>
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Course</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrolled At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enrollments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              <UserPlus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              No enrollments found
                            </td>
                          </tr>
                        ) : (
                          enrollments.map((enr, i) => (
                            <tr key={enr.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">
                                  {enr.students?.first_name} {enr.students?.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{enr.students?.email}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {enr.courses?.course_name || enr.courses?.course_code}
                                </p>
                                {enr.courses?.course_code && <p className="text-xs text-gray-400">{enr.courses.course_code}</p>}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor[enr.enrollment_status] || 'bg-gray-100 text-gray-600'}`}>
                                  {enr.enrollment_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(enr.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enroll Student</DialogTitle>
                <DialogClose />
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Student *</label>
                  <select
                    value={form.student_id}
                    onChange={(e) => setForm(f => ({ ...f, student_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Course *</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm(f => ({ ...f, course_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.course_name || c.title} ({c.course_code || c.code})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleEnroll} disabled={submitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Enroll
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </HRManagerLayout>
    </div>
  )
}
