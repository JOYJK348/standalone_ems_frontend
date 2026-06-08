'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Settings, EyeOff, Trash2, Users } from 'lucide-react'
import api from '@/lib/api'

export default function RolesListPage() {
  const queryClient = useQueryClient()

  const { data: rolesRes, isLoading } = useQuery({
    queryKey: ['dynamic-roles'],
    queryFn: () => api.get('/ems/roles').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/ems/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dynamic-roles'] }),
  })

  const roles = rolesRes?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dynamic Roles</h1>
            <p className="text-sm text-slate-500">Manage custom roles and menu access</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/ems/tenant-admin/roles/assign"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Users className="h-4 w-4" />
              Assign Role
            </Link>
            <Link
              href="/ems/tenant-admin/roles/create"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          </div>
        ) : roles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
            <Settings className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-700">No dynamic roles yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create your first role to start assigning menu-based access.
            </p>
            <Link
              href="/ems/tenant-admin/roles/create"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Role Name</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Description</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Menus</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Users</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((role: any) => (
                  <tr key={role.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{role.role_name}</p>
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-sm text-slate-500">
                      {role.description || '-'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {role.menu_ids?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        {role.user_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        role.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          role.is_active ? 'bg-green-500' : 'bg-slate-400'
                        }`} />
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ems/tenant-admin/roles/${role.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/ems/tenant-admin/roles/${role.id}/preview`}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-green-600 transition hover:bg-green-50"
                        >
                          Preview
                        </Link>
                        <button
                          onClick={() => { if (confirm('Delete this role?')) deleteMutation.mutate(role.id) }}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
