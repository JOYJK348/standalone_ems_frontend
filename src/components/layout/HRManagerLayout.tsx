"use client"

import { HRManagerBottomNav } from "@/components/ems/dashboard/hr-manager-bottom-nav"

export default function HRManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen pb-20">{children}</main>
      <HRManagerBottomNav />
    </>
  )
}
