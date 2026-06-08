"use client"

import { FinanceManagerBottomNav } from "@/components/ems/dashboard/finance-manager-bottom-nav"

export default function FinanceManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen pb-20">{children}</main>
      <FinanceManagerBottomNav />
    </>
  )
}
