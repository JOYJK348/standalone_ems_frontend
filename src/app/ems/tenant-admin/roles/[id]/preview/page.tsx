'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Eye, Home, BookOpen, Users, GraduationCap, BarChart, Settings, ShieldCheck, FileText, HelpCircle, Video, CheckSquare, FolderOpen, Award, Calendar, Layers, Bell, FlaskConical, Receipt, CreditCard, RotateCcw, FileSpreadsheet, Package, UserPlus } from 'lucide-react'
import api from '@/lib/api'

const menuPreviewItems = [
  { id: 'ems.dashboard', label: 'Dashboard', icon: Home, route: '/ems/dashboard' },
  { id: 'ems.courses', label: 'Courses', icon: BookOpen, route: '/ems/courses' },
  { id: 'ems.batches', label: 'Batches', icon: Layers, route: '/ems/batches' },
  { id: 'ems.students', label: 'Students', icon: Users, route: '/ems/students' },
  { id: 'ems.assignments', label: 'Assignments', icon: FileText, route: '/ems/assignments' },
  { id: 'ems.quizzes', label: 'Quizzes', icon: HelpCircle, route: '/ems/quizzes' },
  { id: 'ems.live_classes', label: 'Live Classes', icon: Video, route: '/ems/live-classes' },
  { id: 'ems.attendance', label: 'Attendance', icon: CheckSquare, route: '/ems/attendance' },
  { id: 'ems.materials', label: 'Materials', icon: FolderOpen, route: '/ems/materials' },
  { id: 'ems.certificates', label: 'Certificates', icon: Award, route: '/ems/certificates' },
  { id: 'ems.progress', label: 'Progress', icon: BarChart, route: '/ems/progress' },
  { id: 'ems.timetable', label: 'Timetable', icon: Calendar, route: '/ems/timetable' },
  { id: 'ems.analytics', label: 'Analytics', icon: BarChart, route: '/ems/analytics' },
  { id: 'ems.approvals', label: 'Approvals', icon: ShieldCheck, route: '/ems/approvals' },
  { id: 'ems.reports', label: 'Reports', icon: BarChart, route: '/ems/reports' },
  { id: 'ems.doubts', label: 'Doubts', icon: HelpCircle, route: '/ems/doubts' },
  { id: 'ems.settings', label: 'Settings', icon: Settings, route: '/ems/settings' },
  { id: 'ems.tutors', label: 'Tutors', icon: GraduationCap, route: '/ems/tutors' },
  { id: 'ems.enrollments', label: 'Enrollments', icon: UserPlus, route: '/ems/enrollments' },
  { id: 'ems.invoices', label: 'Invoices', icon: Receipt, route: '/ems/invoices' },
  { id: 'ems.payments', label: 'Payments', icon: CreditCard, route: '/ems/payments' },
  { id: 'ems.refunds', label: 'Refunds', icon: RotateCcw, route: '/ems/refunds' },
  { id: 'ems.billing_reports', label: 'Billing Reports', icon: FileSpreadsheet, route: '/ems/billing/reports' },
  { id: 'ems.subscription_summary', label: 'Subscription', icon: Package, route: '/ems/subscription' },
  { id: 'ems.announcements', label: 'Announcements', icon: Bell, route: '/ems/announcements' },
  { id: 'ems.practice', label: 'Practice Lab', icon: FlaskConical, route: '/ems/practice-lab' },
]

const categoryGroup: Record<string, string> = {
  'ems.dashboard': 'Main',
  'ems.courses': 'Academic',
  'ems.batches': 'Academic',
  'ems.students': 'Academic',
  'ems.assignments': 'Academic',
  'ems.quizzes': 'Academic',
  'ems.live_classes': 'Academic',
  'ems.attendance': 'Academic',
  'ems.materials': 'Academic',
  'ems.certificates': 'Academic',
  'ems.progress': 'Academic',
  'ems.timetable': 'Academic',
  'ems.analytics': 'Academic',
  'ems.approvals': 'Academic',
  'ems.reports': 'Academic',
  'ems.doubts': 'Academic',
  'ems.settings': 'System',
  'ems.tutors': 'People',
  'ems.enrollments': 'People',
  'ems.invoices': 'Billing',
  'ems.payments': 'Billing',
  'ems.refunds': 'Billing',
  'ems.billing_reports': 'Billing',
  'ems.subscription_summary': 'Billing',
  'ems.announcements': 'Communication',
  'ems.practice': 'Lab',
}

export default function PreviewRolePage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: roleRes, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => api.get(`/ems/roles/${id}`).then(r => r.data),
  })

  const role = roleRes?.data
  const menuIds: string[] = role?.menu_ids || []
  const visibleMenus = menuPreviewItems.filter(m => menuIds.includes(m.id))

  const grouped = visibleMenus.reduce((acc, menu) => {
    const cat = categoryGroup[menu.id] || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(menu)
    return acc
  }, {} as Record<string, typeof menuPreviewItems>)

  const categoryLabels: Record<string, string> = {
    Main: 'Main', Academic: 'Academic', People: 'People',
    Billing: 'Billing & Finance', Communication: 'Communication',
    Lab: 'Practice Lab', System: 'System',
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!role) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Role not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900">{role.role_name}</h1>
          <p className="text-sm text-slate-500">{role.description || 'Role Preview'}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
            <Eye className="h-4 w-4" />
            Preview Mode — This is what users with this role will see
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-sm lg:col-span-1">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-black leading-none text-white">Agaran EMS</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{role.role_name}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {Object.entries(grouped).map(([category, menus]) => (
                <div key={category} className="mb-4">
                  <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {categoryLabels[category] || category}
                  </p>
                  {menus.map(menu => (
                    <div
                      key={menu.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/75"
                    >
                      <menu.icon className="h-4 w-4" />
                      <span>{menu.label}</span>
                    </div>
                  ))}
                </div>
              ))}
              {visibleMenus.length === 0 && (
                <div className="py-8 text-center text-sm text-white/40">No menus assigned</div>
              )}
            </nav>
          </div>

          {/* Main Content Preview */}
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">Preview</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-1 h-3 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-1 h-3 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-1 h-3 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-slate-400">
                Users see actual data based on their permissions
              </div>
            </div>

            {/* Assigned Menus List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-700">
                Assigned Menu IDs ({menuIds.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {menuIds.map(mid => (
                  <span
                    key={mid}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                  >
                    {mid}
                  </span>
                ))}
                {menuIds.length === 0 && (
                  <span className="text-sm text-slate-400">No menus assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
