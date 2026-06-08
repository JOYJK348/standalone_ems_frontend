'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import DynamicDashboard from '@/components/ems/dashboard/DynamicDashboard'

export default function EmsDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your academy</p>
        </div>
        <DynamicDashboard />
      </div>
    </DashboardLayout>
  )
}
