"use client";

import React, { useState, useEffect } from "react";
import {
    Lock,
    ShieldCheck,
    Users,
    Save,
    RefreshCcw,
    LayoutDashboard,
    FileText,
    Search,
    Eye,
    PlusCircle,
    Pencil,
    Trash2,
    Building2,
    Check,
    ChevronRight,
    Zap,
    AlertCircle,
    Info,
    X
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface Permission {
    id: string;
    name: string;
    display_name: string;
    action: string;
    resource: string;
}

interface Role {
    id: string;
    name: string;
    display_name: string;
    level: number;
    description: string;
}

interface Employee {
    id: string;
    display_name: string;
    email: string;
    roleLevel: number;
    role_name: string;
}

import { useFeatureAccess, ModuleType } from "@/contexts/FeatureAccessContext";

const ActivitySquare = (props: any) => <Zap {...props} />;

const MODULE_MAP_BASE = [
    { id: "ems", name: "EMS Core", icon: LayoutDashboard, color: "blue", module: "EMS" },
    { id: "lms", name: "Learning Content", icon: LayoutDashboard, color: "violet", module: "LMS" },
    { id: "attendance", name: "Attendance", icon: Users, color: "emerald", module: "ATTENDANCE" },
];

const EMS_ROLE_NAMES = new Set([
    'COMPANY_ADMIN',
    'BRANCH_ADMIN',
    'EMPLOYEE',
    'TEACHER',
    'ACADEMIC_MANAGER',
    'TUTOR',
    'STUDENT',
    'TENANT_ADMIN',
]);

export default function AccessControl() {
    const { enabledModules, isLoading: isAccessLoading } = useFeatureAccess();

    // Filter MODULE_MAP based on subscription
    const MODULE_MAP = MODULE_MAP_BASE.filter(mod =>
        enabledModules.includes(mod.module as ModuleType)
    );

    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [activePermissionIds, setActivePermissionIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [matrixLoading, setMatrixLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Initial Data Load
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setFetchingData(true);
            const [rolesData, usersData, permsData] = await Promise.all([
                platformService.getRoles(),
                platformService.getUsers(),
                platformService.getPermissions()
            ]);

            const filteredRoles = rolesData.filter((r: any) => {
                const name = r.name;
                const level = r.level;

                // 1. Level 5 (Platform Admin) is always hidden from workspace users
                if (level >= 5) return false;

                // 2. Core Workspace Roles: Always Visible
                const coreRoles = ['COMPANY_ADMIN', 'BRANCH_ADMIN', 'EMPLOYEE'];
                if (coreRoles.includes(name)) return true;

                // 3. Module-Specific Roles (Gated by Subscription)
                if (!EMS_ROLE_NAMES.has(name)) return false;
                if (name === 'TEACHER' && !enabledModules.includes('LMS' as any) && !enabledModules.includes('EMS' as any)) return false;

                return true;
            });

            setRoles(filteredRoles);

            // Self-healing: Ensure required module permissions exist
            let currentPerms = permsData;
            const missingPerms = [];
            for (const mod of MODULE_MAP) {
                for (const action of ['view', 'create', 'update', 'delete']) {
                    const permName = `${mod.id}.${action}`;
                    if (!currentPerms.find((p: any) => p.name === permName)) {
                        missingPerms.push({
                            name: permName,
                            display_name: `${action.toUpperCase()} ${mod.name}`,
                            permission_scope: 'COMPANY',
                            schema_name: mod.id,
                            resource: mod.id,
                            action: action
                        });
                    }
                }
            }

            if (missingPerms.length > 0) {
                await Promise.all(missingPerms.map(p => platformService.createPermission(p)));
                currentPerms = await platformService.getPermissions();
            }

            setAllPermissions(currentPerms);

            const transformedUsers = usersData.map((u: any) => ({
                id: u.id,
                display_name: u.display_name,
                email: u.email,
                roleLevel: u.user_roles?.[0]?.roles?.level || 0,
                role_name: u.user_roles?.[0]?.roles?.display_name || 'Staff'
            }));
            setAllUsers(transformedUsers);

            if (filteredRoles.length > 0) {
                // Priority: Company Administrator (Level 4)
                const defaultRole = filteredRoles.find((r: Role) => r.level === 4) || filteredRoles[0];
                setSelectedRole(defaultRole);
            }
        } catch (error) {
            console.error("Data fetch failed", error);
            toast.error("Failed to load access control data");
        } finally {
            setFetchingData(false);
        }
    };

    // Fetch Active Permissions when Target changes
    useEffect(() => {
        if (selectedEmployee) {
            fetchUserPermissions(selectedEmployee.id);
        } else if (selectedRole) {
            fetchRolePermissions(selectedRole.id);
        }
    }, [selectedEmployee, selectedRole]);

    const fetchRolePermissions = async (roleId: string) => {
        setMatrixLoading(true);
        try {
            const rp = await platformService.getRolePermissions(roleId);
            const enabledIds = new Set<string>(rp.map((item: any) => String(item.permission_id)));
            setActivePermissionIds(enabledIds);
        } catch (e) {
            toast.error("Failed to load role permissions");
        } finally {
            setMatrixLoading(false);
        }
    };

    const fetchUserPermissions = async (userId: string) => {
        setMatrixLoading(true);
        try {
            const up = await platformService.getUserPermissions(userId);
            const enabledIds = new Set<string>(up.map((item: any) => String(item.permission_id)));
            setActivePermissionIds(enabledIds);
        } catch (e) {
            toast.error("Failed to load user permissions");
        } finally {
            setMatrixLoading(false);
        }
    };

    // Filter Employees per Role
    useEffect(() => {
        if (!selectedRole) return;
        const filtered = allUsers.filter(u => u.roleLevel === selectedRole.level);
        setEmployees(filtered);
    }, [selectedRole, allUsers]);

    const togglePermission = (permissionId: string) => {
        setActivePermissionIds(prev => {
            const next = new Set(prev);
            if (next.has(permissionId)) next.delete(permissionId);
            else next.add(permissionId);
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedRole && !selectedEmployee) return;

        setLoading(true);
        try {
            const permissionIds = Array.from(activePermissionIds);

            if (selectedEmployee) {
                await platformService.updateUserPermissions(selectedEmployee.id, permissionIds);
                toast.success(`Permissions updated for ${selectedEmployee.display_name}`);
            } else if (selectedRole) {
                await platformService.updateRolePermissions(selectedRole.id, permissionIds);
                toast.success(`Permissions updated for ${selectedRole.display_name}`);
            }
        } catch (error: any) {
            console.error("❌ [AccessControl] Save failed:", error.response?.data || error.message);
            toast.error("Failed to save permissions: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const getPermissionId = (module: string, action: string) => {
        const perm = allPermissions.find(p => p.name === `${module}.${action}`);
        return perm?.id || null;
    };

    if (fetchingData || isAccessLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCcw className="w-10 h-10 md:w-12 md:h-12 text-violet-600 animate-spin" />
                        <p className="font-bold text-xs md:text-sm uppercase tracking-wider text-slate-500">Loading Access Control...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const filteredEmployees = employees.filter(e =>
        e.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto pb-12 px-4 md:px-6">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <Lock className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Access Control</h1>
                                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">Manage role-based permissions and user access</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={loading || matrixLoading}
                            className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span className="hidden md:inline">Save Changes</span>
                            <span className="md:hidden">Save</span>
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-blue-900 mb-1">How it works</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Select a role to configure default permissions, or choose an individual user to set custom overrides. Changes are saved to the database in real-time.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Roles & Users */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Roles Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                                    System Roles
                                </h3>
                            </div>
                            <div className="p-4 space-y-2">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => { setSelectedRole(role); setSelectedEmployee(null); setShowMobileMenu(false); }}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedRole?.id === role.id && !selectedEmployee
                                            ? "border-violet-600 bg-violet-50 shadow-md"
                                            : "border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`font-bold text-sm ${selectedRole?.id === role.id && !selectedEmployee ? "text-violet-900" : "text-slate-900"
                                                }`}>
                                                {role.display_name}
                                            </h4>
                                            {selectedRole?.id === role.id && !selectedEmployee && (
                                                <ChevronRight className="w-4 h-4 text-violet-600" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {role.description || `Level ${role.level} access`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Users Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <Users className="w-4 h-4 text-violet-600" />
                                        Users ({employees.length})
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    />
                                </div>

                                {/* Inherit Role Policy */}
                                <button
                                    onClick={() => { setSelectedEmployee(null); setShowMobileMenu(false); }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${!selectedEmployee
                                        ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                        : "bg-white border-slate-100 hover:border-slate-900"
                                        }`}
                                >
                                    <Building2 className={`w-4 h-4 ${!selectedEmployee ? "text-violet-400" : "text-slate-400"}`} />
                                    <div className="text-left flex-1">
                                        <p className="text-xs font-bold uppercase tracking-tight">Default Role Policy</p>
                                        <p className={`text-[10px] font-medium ${!selectedEmployee ? "text-slate-400" : "text-slate-500"}`}>
                                            Universal access rules
                                        </p>
                                    </div>
                                </button>

                                {/* User List */}
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {filteredEmployees.length === 0 ? (
                                        <div className="text-center py-8 px-4">
                                            <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-500">No users found</p>
                                            <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                                        </div>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <button
                                                key={emp.id}
                                                onClick={() => { setSelectedEmployee(emp); setShowMobileMenu(false); }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedEmployee?.id === emp.id
                                                    ? "bg-violet-50 border-violet-200 shadow-md"
                                                    : "bg-white border-slate-100 hover:border-violet-200"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedEmployee?.id === emp.id ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-600"
                                                    }`}>
                                                    {emp.display_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-sm font-bold truncate ${selectedEmployee?.id === emp.id ? "text-violet-900" : "text-slate-900"
                                                            }`}>
                                                            {emp.display_name}
                                                        </p>
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${emp.roleLevel === 4 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            emp.roleLevel === 1 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-slate-50 text-slate-500 border-slate-100'
                                                            }`}>
                                                            {emp.role_name}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Permissions Matrix */}
                    <div className="lg:col-span-8">
                        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${matrixLoading ? "opacity-50 pointer-events-none" : ""
                            }`}>
                            {/* Header */}
                            <div className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                                    {selectedEmployee ? `${selectedEmployee.display_name} - Custom Permissions` : `${selectedRole?.display_name} - Default Permissions`}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    {selectedEmployee ? "Individual user overrides" : "Applied to all users with this role"}
                                </p>
                            </div>

                            {/* Permissions Table - Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Module</th>
                                            <th className="py-4 px-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wide w-24">View</th>
                                            <th className="py-4 px-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wide w-24">Create</th>
                                            <th className="py-4 px-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wide w-24">Update</th>
                                            <th className="py-4 px-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wide w-24">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {MODULE_MAP.map((mod) => (
                                            <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-${mod.color}-100 flex items-center justify-center`}>
                                                            <mod.icon className={`w-5 h-5 text-${mod.color}-600`} />
                                                        </div>
                                                        <p className="font-bold text-sm text-slate-900">{mod.name}</p>
                                                    </div>
                                                </td>
                                                {['view', 'create', 'update', 'delete'].map(action => {
                                                    const permId = getPermissionId(mod.id, action);
                                                    return (
                                                        <td key={`${mod.id}-${action}`} className="py-5 px-4 text-center">
                                                            {permId ? (
                                                                <PermissionToggle
                                                                    enabled={activePermissionIds.has(String(permId))}
                                                                    onClick={() => togglePermission(String(permId))}
                                                                    action={action}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 mx-auto" title="Not configured" />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Permissions Cards - Mobile */}
                            <div className="md:hidden p-4 space-y-4">
                                {MODULE_MAP.map((mod) => (
                                    <div key={mod.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl bg-${mod.color}-100 flex items-center justify-center`}>
                                                <mod.icon className={`w-5 h-5 text-${mod.color}-600`} />
                                            </div>
                                            <p className="font-bold text-sm text-slate-900">{mod.name}</p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['view', 'create', 'update', 'delete'].map(action => {
                                                const permId = getPermissionId(mod.id, action);
                                                return (
                                                    <div key={`${mod.id}-${action}`} className="flex flex-col items-center gap-2">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{action}</p>
                                                        {permId ? (
                                                            <PermissionToggle
                                                                enabled={activePermissionIds.has(String(permId))}
                                                                onClick={() => togglePermission(String(permId))}
                                                                action={action}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function PermissionToggle({ enabled, onClick, action }: { enabled: boolean, onClick: () => void, action: string }) {
    const getConfig = () => {
        switch (action) {
            case 'view':
                return { icon: Eye, color: 'blue' };
            case 'create':
                return { icon: PlusCircle, color: 'emerald' };
            case 'update':
                return { icon: Pencil, color: 'amber' };
            case 'delete':
                return { icon: Trash2, color: 'rose' };
            default:
                return { icon: Check, color: 'slate' };
        }
    };

    const { icon: Icon, color } = getConfig();

    return (
        <button
            onClick={onClick}
            className={`relative w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto ${enabled
                ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200 scale-110`
                : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:scale-105"
                }`}
        >
            <Icon className="w-4 h-4" />
            {enabled && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-${color}-600 shadow-sm`}>
                    <Check className={`w-2.5 h-2.5 text-${color}-600`} />
                </div>
            )}
        </button>
    );
}
