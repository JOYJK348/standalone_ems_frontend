"use client"

import { HRManagerTopNavbar } from "@/components/ems/dashboard/hr-manager-top-navbar"
import { HRManagerBottomNav } from "@/components/ems/dashboard/hr-manager-bottom-nav"

export default function HRManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HRManagerTopNavbar />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <HRManagerBottomNav />
    </>
  )
}
