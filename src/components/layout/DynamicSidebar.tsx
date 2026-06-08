"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, BookOpen, Layers, Users, GraduationCap,
  UserPlus, FileText, HelpCircle, Video, CheckSquare,
  FolderOpen, Award, TrendingUp, Calendar, BarChart,
  ClipboardCheck, Bell, Receipt, CreditCard, RotateCcw,
  FileSpreadsheet, Package, FlaskConical, ShieldCheck,
  Settings, UserCircle, LogOut, X
} from "lucide-react"
import Cookie from "js-cookie"
import { useAuthStore } from "@/store/useAuthStore"

interface MenuItem {
  id: string
  label: string
  icon: any
  route: string
  category: string
  parent?: string
  hidden?: boolean
}

const menuRegistry: MenuItem[] = [
  { id: 'ems.dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/ems/dashboard', category: 'main' },
  { id: 'ems.courses', label: 'Courses', icon: BookOpen, route: '/ems/courses', category: 'academic' },
  { id: 'ems.batches', label: 'Batches', icon: Layers, route: '/ems/batches', category: 'academic' },
  { id: 'ems.students', label: 'Students', icon: Users, route: '/ems/students', category: 'academic' },
  { id: 'ems.students.profile', label: 'My Profile', icon: UserCircle, route: '/ems/students/me', category: 'academic' },
  { id: 'ems.students.courses', label: 'My Courses', icon: BookOpen, route: '/ems/students/my-courses', category: 'academic' },
  { id: 'ems.assignments', label: 'Assignments', icon: FileText, route: '/ems/assignments', category: 'academic' },
  { id: 'ems.assignments.grade', label: 'Grade', icon: ClipboardCheck, route: '/ems/assignments', category: 'academic' },
  { id: 'ems.quizzes', label: 'Quizzes', icon: HelpCircle, route: '/ems/quizzes', category: 'academic' },
  { id: 'ems.live_classes', label: 'Live Classes', icon: Video, route: '/ems/live-classes', category: 'academic' },
  { id: 'ems.attendance', label: 'Attendance', icon: CheckSquare, route: '/ems/attendance', category: 'academic' },
  { id: 'ems.materials', label: 'Materials', icon: FolderOpen, route: '/ems/materials', category: 'academic' },
  { id: 'ems.certificates', label: 'Certificates', icon: Award, route: '/ems/certificates', category: 'academic' },
  { id: 'ems.progress', label: 'Progress', icon: TrendingUp, route: '/ems/progress', category: 'academic' },
  { id: 'ems.timetable', label: 'Timetable', icon: Calendar, route: '/ems/timetable', category: 'academic' },
  { id: 'ems.analytics', label: 'Analytics', icon: BarChart, route: '/ems/analytics', category: 'academic' },
  { id: 'ems.approvals', label: 'Approvals', icon: ShieldCheck, route: '/ems/approvals', category: 'academic' },
  { id: 'ems.reports', label: 'Reports', icon: BarChart, route: '/ems/reports', category: 'academic' },
  { id: 'ems.doubts', label: 'Doubts', icon: HelpCircle, route: '/ems/doubts', category: 'academic' },
  { id: 'ems.settings', label: 'Settings', icon: Settings, route: '/ems/settings', category: 'system' },
  { id: 'ems.tutors', label: 'Tutors', icon: GraduationCap, route: '/ems/tutors', category: 'people' },
  { id: 'ems.enrollments', label: 'Enrollments', icon: UserPlus, route: '/ems/enrollments', category: 'people' },
  { id: 'ems.invoices', label: 'Invoices', icon: Receipt, route: '/ems/invoices', category: 'billing' },
  { id: 'ems.payments', label: 'Payments', icon: CreditCard, route: '/ems/payments', category: 'billing' },
  { id: 'ems.refunds', label: 'Refunds', icon: RotateCcw, route: '/ems/refunds', category: 'billing' },
  { id: 'ems.billing_reports', label: 'Billing Reports', icon: FileSpreadsheet, route: '/ems/billing/reports', category: 'billing' },
  { id: 'ems.subscription_summary', label: 'Subscription', icon: Package, route: '/ems/subscription', category: 'billing' },
  { id: 'ems.announcements', label: 'Announcements', icon: Bell, route: '/ems/announcements', category: 'communication' },
  { id: 'ems.practice', label: 'Practice Lab', icon: FlaskConical, route: '/ems/practice-lab', category: 'lab' },
]

const categoryLabels: Record<string, string> = {
  main: 'Main',
  academic: 'Academic',
  people: 'People',
  billing: 'Billing & Finance',
  communication: 'Communication',
  lab: 'Practice Lab',
  system: 'System',
}

interface DynamicSidebarProps {
  onClose?: () => void
  userMenuIds?: string[]
  loading?: boolean
  roleLabel?: string
  brandLabel?: string
}

export default function DynamicSidebar({ onClose, userMenuIds = [], loading = false, roleLabel = 'Staff', brandLabel = 'Agaran EMS' }: DynamicSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const visibleMenus = useMemo(() => {
    return menuRegistry.filter(menu => {
      if (menu.hidden) return false
      if (!menu.parent) {
        const selfAllowed = userMenuIds.includes(menu.id)
        const hasAllowedChild = menuRegistry.some(
          m => m.parent === menu.id && userMenuIds.includes(m.id)
        )
        return selfAllowed || hasAllowedChild
      }
      return userMenuIds.includes(menu.id)
    })
  }, [userMenuIds])

  const groupedMenus = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {}
    visibleMenus.forEach(menu => {
      const cat = menu.category || 'other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(menu)
    })
    return grouped
  }, [visibleMenus])

  const handleLogout = () => {
    logout()
    Cookie.remove("access_token", { path: "/" })
    Cookie.remove("refresh_token", { path: "/" })
    Cookie.remove("x-company-id", { path: "/" })
    Cookie.remove("x-branch-id", { path: "/" })
    Cookie.remove("user_role", { path: "/" })
    Cookie.remove("user_role_level", { path: "/" })
    router.push("/login")
  }

  return (
    <aside className="flex h-full w-72 flex-col bg-slate-950 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link href="/ems/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-black leading-none">{brandLabel}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{roleLabel}</p>
          </div>
        </Link>
        {onClose && (
          <button className="rounded-lg p-2 text-white/70 hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : visibleMenus.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">No menu items available</div>
        ) : (
          Object.entries(groupedMenus).map(([category, menus]) => (
            <div key={category} className="mb-4">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {categoryLabels[category] || category}
              </p>
              {menus.map(menu => {
                const isActive = pathname === menu.route || pathname.startsWith(`${menu.route}/`)
                return (
                  <Link
                    key={menu.id}
                    href={menu.route}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      isActive ? 'bg-white text-slate-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <menu.icon className="h-4 w-4" />
                    <span>{menu.label}</span>
                  </Link>
                )
              })}
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
