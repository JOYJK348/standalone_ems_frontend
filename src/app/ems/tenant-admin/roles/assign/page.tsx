'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Check, X } from 'lucide-react'
import api from '@/lib/api'

export default function AssignRolePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [error, setError] = useState('')

  const { data: usersRes } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => api.get('/ems/users').then(r => r.data),
  })

  const { data: rolesRes } = useQuery({
    queryKey: ['dynamic-roles'],
    queryFn: () => api.get('/ems/roles').then(r => r.data),
  })

  const { data: assignmentsRes } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => api.get('/ems/user-roles').then(r => r.data),
  })

  const assignMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await api.post('/ems/user-roles', body)
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        setSelectedUser('')
        setSelectedRole('')
        setError('')
      } else {
        setError(data.error?.message || 'Failed to assign')
      }
    },
  })

  const unassignMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/ems/user-roles?id=${id}`)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-roles'] }),
  })

  const users = usersRes?.data || []
  const roles = rolesRes?.data || []
  const assignments = assignmentsRes?.data || []

  const getRoleName = (roleId: number) => roles.find((r: any) => r.id === roleId)?.role_name || 'Unknown'
  const getUserName = (userId: number) => {
    const u = users.find((u: any) => u.id === userId)
    return u ? `${u.name} (${u.email})` : `User #${userId}`
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900">Assign Role</h1>
          <p className="text-sm text-slate-500">Assign a dynamic role to a user</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700">Select User</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Choose a user...</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700">Select Role</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Choose a role...</option>
              {roles.filter((r: any) => r.is_active).map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.role_name} ({r.menu_ids?.length || 0} menus)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => assignMutation.mutate({ user_id: parseInt(selectedUser), role_id: parseInt(selectedRole) })}
            disabled={!selectedUser || !selectedRole || assignMutation.isPending}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>

        {assignments.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-700">Current Assignments ({assignments.length})</h2>
            <div className="space-y-2">
              {assignments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{getUserName(a.user_id)}</p>
                    <p className="text-xs text-slate-500">{a.dynamic_roles?.role_name || getRoleName(a.role_id)}</p>
                  </div>
                  <button
                    onClick={() => { if (confirm('Remove this assignment?')) unassignMutation.mutate(a.id) }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
