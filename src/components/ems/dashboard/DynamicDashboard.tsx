'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/api'
import {
  Users, BookOpen, Layers, GraduationCap, FileText, Video,
  TrendingUp, Receipt, CreditCard, AlertTriangle, UserPlus,
  CheckSquare, Award, Bell, Calendar, ClipboardCheck, FlaskConical,
  PlusCircle, ArrowRight, Loader2, Sparkles, Sun, Moon
} from 'lucide-react'
import Cookie from 'js-cookie'
import { Card, CardContent } from '@/components/ui/card'

const iconMap: Record<string, React.ComponentType<any>> = {
  Users, BookOpen, Layers, GraduationCap, FileText, Video,
  TrendingUp, Receipt, CreditCard, AlertTriangle, UserPlus,
  CheckSquare, Award, Bell, Calendar, ClipboardCheck, FlaskConical,
}

interface CardDef {
  id: string
  label: string
  icon: string
  statKey: string
  suffix?: string
  prefix?: string
}

interface QuickAction {
  label: string
  href: string
  icon: React.ComponentType<any>
}

const roleCardMap: Record<string, CardDef[]> = {
  ACADEMIC_MANAGER: [
    { id: 'total_students', label: 'Total Students', icon: 'Users', statKey: 'totalStudents' },
    { id: 'active_courses', label: 'Active Courses', icon: 'BookOpen', statKey: 'totalCourses' },
    { id: 'pending_grading', label: 'Pending Grading', icon: 'ClipboardCheck', statKey: 'pendingGrading' },
    { id: 'todays_classes', label: "Today's Classes", icon: 'Video', statKey: 'todaysClasses' },
    { id: 'completion_rate', label: 'Enrollments', icon: 'TrendingUp', statKey: 'totalEnrollments' },
  ],
  FINANCE_MANAGER: [
    { id: 'outstanding', label: 'Outstanding Balance', icon: 'Receipt', statKey: 'outstandingBalance', prefix: '₹' },
    { id: 'invoices_month', label: 'Invoices This Month', icon: 'FileText', statKey: 'invoicesThisMonth' },
    { id: 'collections', label: 'Total Collections', icon: 'CreditCard', statKey: 'totalCollections', prefix: '₹' },
    { id: 'overdue', label: 'Overdue Invoices', icon: 'AlertTriangle', statKey: 'overdueInvoices' },
  ],
  HR_MANAGER: [
    { id: 'total_tutors', label: 'Total Tutors', icon: 'GraduationCap', statKey: 'totalTutors' },
    { id: 'total_students', label: 'Total Students', icon: 'Users', statKey: 'totalStudents' },
    { id: 'new_enrollments', label: 'New This Week', icon: 'UserPlus', statKey: 'newEnrollmentsWeek' },
    { id: 'attendance_rate', label: 'Attendance Rate', icon: 'CheckSquare', statKey: 'attendanceRate', suffix: '%' },
  ],
  PLACEMENT_OFFICER: [
    { id: 'completed', label: 'Students Completed', icon: 'Award', statKey: 'totalStudents' },
    { id: 'certificates', label: 'Certificates Issued', icon: 'Award', statKey: 'totalEnrollments' },
    { id: 'avg_completion', label: 'Avg Completion', icon: 'TrendingUp', statKey: 'totalCourses', suffix: '%' },
    { id: 'top_batch', label: 'Active Courses', icon: 'BookOpen', statKey: 'totalCourses' },
  ],
  SUPPORT_STAFF: [
    { id: 'announcements', label: 'Recent Announcements', icon: 'Bell', statKey: 'totalStudents' },
    { id: 'schedule', label: 'Upcoming Schedule', icon: 'Calendar', statKey: 'totalBatches' },
    { id: 'student_count', label: 'Student Count', icon: 'Users', statKey: 'totalStudents' },
  ],
  TIMETABLE_COORDINATOR: [
    { id: 'todays_classes', label: "Today's Classes", icon: 'Video', statKey: 'totalBatches' },
    { id: 'weekly', label: 'Weekly Batches', icon: 'Calendar', statKey: 'totalBatches' },
    { id: 'batches', label: 'Batch Count', icon: 'Layers', statKey: 'totalBatches' },
  ],
  TUTOR: [
    { id: 'my_courses', label: 'My Courses', icon: 'BookOpen', statKey: 'myCourses' },
    { id: 'pending_grading', label: 'Pending Grading', icon: 'ClipboardCheck', statKey: 'pendingGrading' },
    { id: 'upcoming_classes', label: 'Upcoming Classes', icon: 'Video', statKey: 'todaysClasses' },
    { id: 'total_students', label: 'Total Students', icon: 'Users', statKey: 'totalStudents' },
  ],
  STUDENT: [
    { id: 'my_courses', label: 'My Courses', icon: 'BookOpen', statKey: 'enrolledCourses' },
    { id: 'pending_assignments', label: 'Pending Assignments', icon: 'FileText', statKey: 'pendingAssignments' },
    { id: 'upcoming_classes', label: 'Upcoming Classes', icon: 'Video', statKey: 'todaysClasses' },
    { id: 'completion', label: 'My Progress', icon: 'TrendingUp', statKey: 'totalCourses', suffix: '%' },
  ],
}

const roleDisplayNames: Record<string, string> = {
  ACADEMIC_MANAGER: 'Academic Manager',
  FINANCE_MANAGER: 'Finance Manager',
  HR_MANAGER: 'HR Manager',
  PLACEMENT_OFFICER: 'Placement Officer',
  SUPPORT_STAFF: 'Support Staff',
  TIMETABLE_COORDINATOR: 'Timetable Coordinator',
  TUTOR: 'Tutor',
  STUDENT: 'Student',
  TENANT_ADMIN: 'Tenant Admin',
}

const roleQuickActions: Record<string, QuickAction[]> = {
  ACADEMIC_MANAGER: [
    { label: 'New Course', href: '/ems/academic-manager/courses', icon: PlusCircle },
    { label: 'Create Batch', href: '/ems/academic-manager/batches', icon: PlusCircle },
    { label: 'Review Approvals', href: '/ems/academic-manager/approvals', icon: ClipboardCheck },
  ],
  FINANCE_MANAGER: [
    { label: 'Create Invoice', href: '/ems/dynamic-role/finance-manager/invoices', icon: Receipt },
    { label: 'Record Payment', href: '/ems/dynamic-role/finance-manager/payments', icon: CreditCard },
    { label: 'Send Reminder', href: '/ems/dynamic-role/finance-manager/reminders', icon: Bell },
    { label: 'Export Report', href: '/ems/dynamic-role/finance-manager/reports', icon: FileText },
  ],
  HR_MANAGER: [
    { label: 'Enroll Student', href: '/ems/dynamic-role/hr-manager/enrollments', icon: UserPlus },
    { label: 'Assign Tutor', href: '/ems/dynamic-role/hr-manager/tutors', icon: GraduationCap },
    { label: 'Bulk Import CSV', href: '/ems/dynamic-role/hr-manager/bulk-import', icon: FileText },
    { label: 'Attendance Report', href: '/ems/dynamic-role/hr-manager/attendance', icon: CheckSquare },
  ],
  TUTOR: [
    { label: 'My Courses', href: '/ems/tutor/courses', icon: BookOpen },
    { label: 'Mark Attendance', href: '/ems/tutor/attendance', icon: CheckSquare },
    { label: 'Grade Assignments', href: '/ems/tutor/grading', icon: ClipboardCheck },
  ],
  STUDENT: [
    { label: 'My Courses', href: '/ems/student/courses', icon: BookOpen },
    { label: 'Assignments', href: '/ems/student/assignments', icon: FileText },
    { label: 'Live Classes', href: '/ems/student/live-classes', icon: Video },
  ],
}

const defaultCards: CardDef[] = [
  { id: 'total_students', label: 'Total Students', icon: 'Users', statKey: 'totalStudents' },
  { id: 'total_courses', label: 'Total Courses', icon: 'BookOpen', statKey: 'totalCourses' },
  { id: 'total_batches', label: 'Total Batches', icon: 'Layers', statKey: 'totalBatches' },
  { id: 'total_enrollments', label: 'Enrollments', icon: 'TrendingUp', statKey: 'totalEnrollments' },
]

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
      </CardContent>
    </Card>
  )
}

function Greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', icon: Sparkles }
  if (hour < 17) return { text: 'Good Afternoon', icon: Sun }
  if (hour < 21) return { text: 'Good Evening', icon: Sun }
  return { text: 'Good Night', icon: Moon }
}

export default function DynamicDashboard() {
  const roleName = Cookie.get('user_role') || ''

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['my-menus'],
    queryFn: () => api.get('/ems/my-menus').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['my-dashboard-stats'],
    queryFn: () => api.get('/ems/dashboard/my-stats').then(r => r.data),
    staleTime: 60 * 1000,
  })

  const effectiveRole = menuData?.data?.roleName || roleName || 'ACADEMIC_MANAGER'
  const cards = roleCardMap[effectiveRole] || defaultCards
  const stats = statsData?.data?.stats || {}
  const displayName = roleDisplayNames[effectiveRole] || effectiveRole
  const quickActions = roleQuickActions[effectiveRole] || []
  const greeting = Greeting()
  const GreetingIcon = greeting.icon

  const isLoading = menuLoading || statsLoading

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg md:p-8">
        <div className="flex items-center gap-3">
          <GreetingIcon className="h-6 w-6 text-blue-200" />
          <div>
            <p className="text-lg font-bold md:text-xl">
              {greeting.text}, {displayName}
            </p>
            <p className="mt-1 text-sm text-blue-200">
              Here&apos;s your overview for today
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: cards.length }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map(card => {
              const Icon = iconMap[card.icon] || Users
              const value = stats[card.statKey] ?? 0
              return (
                <Card key={card.id} className="overflow-hidden transition hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {card.label}
                      </p>
                      <Icon className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="mt-2">
                      <p className="text-3xl font-black text-slate-900">
                        {card.prefix}{value.toLocaleString()}{card.suffix}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {quickActions.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-3">
            {quickActions.map(action => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
                >
                  <ActionIcon className="h-4 w-4" />
                  <span>{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
