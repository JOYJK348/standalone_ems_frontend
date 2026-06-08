'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Check } from 'lucide-react'
import api from '@/lib/api'

const allMenuIds = [
  { id: 'ems.dashboard', label: 'Dashboard', category: 'Main' },
  { id: 'ems.courses', label: 'Courses', category: 'Academic' },
  { id: 'ems.courses.edit', label: 'Edit Course', category: 'Academic' },
  { id: 'ems.courses.tutors', label: 'Course Tutors', category: 'Academic' },
  { id: 'ems.batches', label: 'Batches', category: 'Academic' },
  { id: 'ems.batches.edit', label: 'Edit Batch', category: 'Academic' },
  { id: 'ems.students', label: 'Students', category: 'Academic' },
  { id: 'ems.students.edit', label: 'Edit Student', category: 'Academic' },
  { id: 'ems.students.profile', label: 'Student Profile', category: 'Academic' },
  { id: 'ems.students.courses', label: 'Student Courses', category: 'Academic' },
  { id: 'ems.assignments', label: 'Assignments', category: 'Academic' },
  { id: 'ems.assignments.edit', label: 'Edit Assignment', category: 'Academic' },
  { id: 'ems.assignments.grade', label: 'Grade', category: 'Academic' },
  { id: 'ems.quizzes', label: 'Quizzes', category: 'Academic' },
  { id: 'ems.quizzes.edit', label: 'Edit Quiz', category: 'Academic' },
  { id: 'ems.quizzes.questions', label: 'Quiz Questions', category: 'Academic' },
  { id: 'ems.live_classes', label: 'Live Classes', category: 'Academic' },
  { id: 'ems.live_classes.edit', label: 'Edit Live Class', category: 'Academic' },
  { id: 'ems.attendance', label: 'Attendance', category: 'Academic' },
  { id: 'ems.attendance.mark', label: 'Mark Attendance', category: 'Academic' },
  { id: 'ems.materials', label: 'Materials', category: 'Academic' },
  { id: 'ems.materials.edit', label: 'Edit Material', category: 'Academic' },
  { id: 'ems.certificates', label: 'Certificates', category: 'Academic' },
  { id: 'ems.progress', label: 'Progress', category: 'Academic' },
  { id: 'ems.timetable', label: 'Timetable', category: 'Academic' },
  { id: 'ems.analytics', label: 'Analytics', category: 'Academic' },
  { id: 'ems.approvals', label: 'Approvals', category: 'Academic' },
  { id: 'ems.reports', label: 'Reports', category: 'Academic' },
  { id: 'ems.reports.analytics', label: 'Analytics Report', category: 'Academic' },
  { id: 'ems.reports.progress', label: 'Progress Report', category: 'Academic' },
  { id: 'ems.doubts', label: 'Doubts', category: 'Academic' },
  { id: 'ems.tutors', label: 'Tutors', category: 'People' },
  { id: 'ems.tutors.edit', label: 'Edit Tutor', category: 'People' },
  { id: 'ems.enrollments', label: 'Enrollments', category: 'People' },
  { id: 'ems.invoices', label: 'Invoices', category: 'Billing' },
  { id: 'ems.payments', label: 'Payments', category: 'Billing' },
  { id: 'ems.refunds', label: 'Refunds', category: 'Billing' },
  { id: 'ems.billing_reports', label: 'Billing Reports', category: 'Billing' },
  { id: 'ems.subscription_summary', label: 'Subscription', category: 'Billing' },
  { id: 'ems.announcements', label: 'Announcements', category: 'Communication' },
  { id: 'ems.practice', label: 'Practice Lab', category: 'Lab' },
  { id: 'ems.settings', label: 'Settings', category: 'System' },
]

const groupedMenus = allMenuIds.reduce((acc, menu) => {
  if (!acc[menu.category]) acc[menu.category] = []
  acc[menu.category].push(menu)
  return acc
}, {} as Record<string, typeof allMenuIds>)

export default function EditRolePage() {
  const { id } = useParams()
  const router = useRouter()
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMenus, setSelectedMenus] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/ems/roles/${id}`)
      .then(res => {
        if (res.data.success && res.data.data) {
          setRoleName(res.data.data.role_name || '')
          setDescription(res.data.data.description || '')
          setSelectedMenus(res.data.data.menu_ids || [])
        }
      })
      .catch(() => setError('Failed to load role'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleMenu = (menuId: string) => {
    setSelectedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(m => m !== menuId)
        : [...prev, menuId]
    )
  }

  const handleSubmit = async () => {
    if (!roleName.trim()) { setError('Role name is required'); return }
    if (selectedMenus.length === 0) { setError('Select at least one menu'); return }
    setSaving(true)
    setError('')
    try {
      const res = await api.put(`/ems/roles/${id}`, {
        role_name: roleName.trim(),
        description: description.trim() || null,
        menu_ids: selectedMenus
      })
      if (!res.data.success) { setError(res.data.error?.message || 'Failed to update'); return }
      router.push('/ems/tenant-admin/roles')
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900">Edit Role</h1>
          <p className="text-sm text-slate-500">Update role name and menu access</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700">Role Name</label>
          <input
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            placeholder="e.g., Branch Manager"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          <label className="mt-4 block text-sm font-bold text-slate-700">Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of this role"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Menu Access</h2>
            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {selectedMenus.length} selected
            </span>
          </div>

          {Object.entries(groupedMenus).map(([category, menus]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">{category}</h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {menus.map(menu => {
                  const checked = selectedMenus.includes(menu.id)
                  return (
                    <label
                      key={menu.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                        checked
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md border text-white transition ${
                        checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <input type="checkbox" checked={checked} onChange={() => toggleMenu(menu.id)} className="hidden" />
                      <span>{menu.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/ems/tenant-admin/roles')}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !roleName || selectedMenus.length === 0}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
