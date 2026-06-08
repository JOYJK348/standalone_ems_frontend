"use client"

import { AcademicManagerTopNavbar } from "@/components/ems/dashboard/academic-manager-top-navbar"
import { AcademicManagerBottomNav } from "@/components/ems/dashboard/academic-manager-bottom-nav"

export default function AcademicManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AcademicManagerTopNavbar />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <AcademicManagerBottomNav />
    </>
  )
}
