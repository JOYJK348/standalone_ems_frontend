"use client"

import { FinanceManagerTopNavbar } from "@/components/ems/dashboard/finance-manager-top-navbar"
import { FinanceManagerBottomNav } from "@/components/ems/dashboard/finance-manager-bottom-nav"

export default function FinanceManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FinanceManagerTopNavbar />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <FinanceManagerBottomNav />
    </>
  )
}
