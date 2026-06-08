import api from '@/lib/api';

/**
 * Platform Master Service - Standardized API Interfacing
 * Features: Multi-tenant scoping, Audit trail support, Soft-deletion
 */
export const platformService = {
    // Core Modules
    getCompanies: async () => {
        const response = await api.get('/core/companies');
        return response.data.data;
    },
    getCompany: async (id: string) => {
        const response = await api.get(`/core/companies/${id}`);
        return response.data.data;
    },
    createCompany: async (data: any) => {
        const response = await api.post('/core/companies', data);
        return response.data.data;
    },
    updateCompany: async (id: string, data: any) => {
        const response = await api.patch(`/core/companies/${id}`, data);
        return response.data.data;
    },
    toggleCompanyStatus: async (id: string, isActive: boolean) => {
        return platformService.updateCompany(id, { is_active: isActive });
    },
    deleteCompany: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/companies/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },
    registerEnterpriseWithAdmin: async (data: any) => {
        const response = await api.post('/platform/companies/create-with-admin', data);
        return response.data.data;
    },

    // 📋 Subscription Templates (Custom Plans)
    getSubscriptionTemplates: async () => {
        const response = await api.get('/platform/subscription-templates');
        return response.data.data;
    },
    getSubscriptionTemplate: async (id: string) => {
        const response = await api.get(`/platform/subscription-templates/${id}`);
        return response.data.data;
    },
    createSubscriptionTemplate: async (data: any) => {
        const response = await api.post('/platform/subscription-templates', data);
        return response.data.data;
    },
    updateSubscriptionTemplate: async (id: string, data: any) => {
        const response = await api.patch(`/platform/subscription-templates/${id}`, data);
        return response.data.data;
    },
    deleteSubscriptionTemplate: async (id: string) => {
        const response = await api.delete(`/platform/subscription-templates/${id}`);
        return response.data.data;
    },

    // 📜 Menu Registry (System menus for custom plan configuration)
    getMenuRegistry: async () => {
        const response = await api.get('/platform/menu-registry');
        return response.data.data;
    },

    // 🏢 Company Allowed Menus (For sidebar rendering)
    getCompanyAllowedMenus: async () => {
        const response = await api.get('/platform/company-menus');
        return response.data.data;
    },


    // Subscription & Billing
    getSubscriptionPlans: async () => {
        const response = await api.get('/platform/subscriptions');
        return response.data.data;
    },
    createSubscriptionPlan: async (data: any) => {
        const response = await api.post('/platform/subscriptions', data);
        return response.data.data;
    },
    updateSubscriptionPlan: async (id: string, data: any) => {
        const response = await api.patch(`/platform/subscriptions/${id}`, data);
        return response.data.data;
    },
    deleteSubscriptionPlan: async (id: string) => {
        const response = await api.delete(`/platform/subscriptions/${id}`);
        return response.data.data;
    },

    // 📊 Company Usage & Limits (Plan-Based Access Control)
    getCompanyUsage: async (companyId?: string) => {
        const url = companyId ? `/platform/usage/${companyId}` : '/platform/usage';
        const response = await api.get(url);
        return response.data.data;
    },
    getCompanyPlanLimits: async (companyId?: string) => {
        const url = companyId ? `/platform/limits/${companyId}` : '/platform/limits';
        const response = await api.get(url);
        return response.data.data;
    },
    canAddResource: async (resourceType: 'user' | 'employee' | 'branch' | 'department' | 'designation', companyId?: string) => {
        const response = await api.get('/platform/can-add', {
            params: { resource_type: resourceType, company_id: companyId }
        });
        return response.data.data;
    },
    upgradeSubscription: async (planId: string, billingCycle: 'monthly' | 'yearly') => {
        const response = await api.post('/platform/subscriptions/upgrade', { plan_id: planId, billing_cycle: billingCycle });
        return response.data.data;
    },
    getSubscriptionHistory: async (companyId?: string) => {
        const url = companyId ? `/platform/subscriptions/history/${companyId}` : '/platform/subscriptions/history';
        const response = await api.get(url);
        return response.data.data;
    },


    getBranches: async () => {
        const response = await api.get('/core/branches');
        return response.data.data;
    },
    getBranch: async (id: string) => {
        const response = await api.get(`/core/branches/${id}`);
        return response.data.data;
    },
    createBranch: async (data: any) => {
        const response = await api.post('/core/branches', data);
        return response.data.data;
    },
    updateBranch: async (id: string, data: any) => {
        const response = await api.patch(`/core/branches/${id}`, data);
        return response.data.data;
    },
    deleteBranch: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/branches/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getAcademicYears: async () => {
        const response = await api.get('/core/academic-years');
        return response.data.data;
    },
    createAcademicYear: async (data: any) => {
        const response = await api.post('/core/academic-years', data);
        return response.data.data;
    },
    updateAcademicYear: async (id: string, data: any) => {
        const response = await api.patch(`/core/academic-years/${id}`, data);
        return response.data.data;
    },
    deleteAcademicYear: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/academic-years/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getDepartments: async () => {
        const response = await api.get('/core/departments');
        return response.data.data;
    },
    createDepartment: async (data: any) => {
        const response = await api.post('/core/departments', data);
        return response.data.data;
    },
    updateDepartment: async (id: string, data: any) => {
        const response = await api.patch(`/core/departments/${id}`, data);
        return response.data.data;
    },
    deleteDepartment: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/departments/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getDesignations: async () => {
        const response = await api.get('/core/designations');
        return response.data.data;
    },
    createDesignation: async (data: any) => {
        const response = await api.post('/core/designations', data);
        return response.data.data;
    },
    updateDesignation: async (id: string, data: any) => {
        const response = await api.patch(`/core/designations/${id}`, data);
        return response.data.data;
    },
    deleteDesignation: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/designations/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getLocations: async () => {
        const response = await api.get('/core/locations');
        return response.data.data;
    },
    createLocation: async (data: any) => {
        const response = await api.post('/core/locations', data);
        return response.data.data;
    },
    updateLocation: async (id: string, data: any) => {
        const response = await api.patch(`/core/locations/${id}`, data);
        return response.data.data;
    },
    deleteLocation: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/locations/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getEmployees: async () => {
        const response = await api.get('/core/employees');
        return response.data.data;
    },
    getEmployee: async (id: string) => {
        const response = await api.get(`/core/employees/${id}`);
        return response.data.data;
    },
    createEmployee: async (data: any) => {
        const response = await api.post('/core/employees', data);
        return response.data.data;
    },
    updateEmployee: async (id: string, data: any) => {
        const response = await api.patch(`/core/employees/${id}`, data);
        return response.data.data;
    },
    deleteEmployee: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/employees/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },
    onboardEmployee: async (data: any) => {
        const response = await api.post('/core/employees/onboard', data);
        return response.data.data;
    },
    getNextEmployeeCode: async () => {
        const response = await api.get('/core/employees/next-code');
        return response.data.data; // { code: 'EMP005' }
    },

    getCountries: async () => {
        const response = await api.get('/core/countries');
        return response.data.data;
    },
    createCountry: async (data: any) => {
        const response = await api.post('/core/countries', data);
        return response.data.data;
    },
    updateCountry: async (id: string, data: any) => {
        const response = await api.patch(`/core/countries/${id}`, data);
        return response.data.data;
    },
    deleteCountry: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/countries/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getStates: async () => {
        const response = await api.get('/core/states');
        return response.data.data;
    },
    createState: async (data: any) => {
        const response = await api.post('/core/states', data);
        return response.data.data;
    },
    updateState: async (id: string, data: any) => {
        const response = await api.patch(`/core/states/${id}`, data);
        return response.data.data;
    },
    deleteState: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/states/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getCities: async () => {
        const response = await api.get('/core/cities');
        return response.data.data;
    },
    createCity: async (data: any) => {
        const response = await api.post('/core/cities', data);
        return response.data.data;
    },
    updateCity: async (id: string, data: any) => {
        const response = await api.patch(`/core/cities/${id}`, data);
        return response.data.data;
    },
    deleteCity: async (id: string, reason?: string) => {
        const response = await api.delete(`/core/cities/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getGlobalSettings: async () => {
        const response = await api.get('/core/global-settings');
        return response.data.data;
    },
    syncGlobalSettings: async (settings: any[]) => {
        const response = await api.post('/core/global-settings', settings);
        return response.data.data;
    },
    createGlobalSetting: async (setting: any) => {
        const response = await api.post('/core/global-settings', setting);
        return response.data.data;
    },
    updateGlobalSetting: async (_id: string | number, setting: any) => {
        const response = await api.post('/core/global-settings', setting);
        return response.data.data;
    },

    // Auth Modules
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data.data;
    },
    forgotPassword: async (data: { action: 'VERIFY' | 'RESET', email: string, employee_code: string, new_password?: string }) => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data.data;
    },
    getUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data.data;
    },
    createUser: async (data: any) => {
        const response = await api.post('/auth/users', data);
        return response.data.data;
    },
    updateUser: async (id: string, data: any) => {
        const response = await api.patch(`/auth/users/${id}`, data);
        return response.data.data;
    },
    deleteUser: async (id: string, reason?: string) => {
        console.log('🔥 deleteUser called:', { id, reason });
        const url = `/auth/users/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
        console.log('🔥 DELETE URL:', url);
        const response = await api.delete(url);
        console.log('🔥 DELETE response:', response.data);
        return response.data.data;
    },

    // 🔐 PERMISSIONS & ROLES
    getRoles: async () => {
        const response = await api.get('/auth/roles');
        return response.data.data;
    },
    createRole: async (data: any) => {
        const response = await api.post('/auth/roles', data);
        return response.data.data;
    },
    updateRole: async (id: string, data: any) => {
        const response = await api.patch(`/auth/roles/${id}`, data);
        return response.data.data;
    },

    // 🗑️ ARCHIVES & RECOVERY
    getArchives: async (type?: string) => {
        const response = await api.get(`/platform/archives${type ? `?type=${type}` : ''}`);
        return response.data.data;
    },
    restoreItem: async (type: 'users' | 'employees' | 'companies', id: string) => {
        const response = await api.post('/platform/restore', { type, id });
        return response.data.data;
    },
    deleteRole: async (id: string, reason?: string) => {
        const response = await api.delete(`/auth/roles/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getAuditLogs: async (companyId?: string) => {
        const url = `/auth/audit-logs?t=${Date.now()}${companyId ? `&companyId=${companyId}` : ''}`;
        const response = await api.get(url, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        return response.data.data;
    },
    getLoginHistory: async () => {
        const response = await api.get('/auth/login-history');
        return response.data.data;
    },

    getPermissions: async () => {
        const response = await api.get('/auth/permissions');
        return response.data.data;
    },
    createPermission: async (data: any) => {
        const response = await api.post('/auth/permissions', data);
        return response.data.data;
    },
    updatePermission: async (id: string, data: any) => {
        const response = await api.patch(`/auth/permissions/${id}`, data);
        return response.data.data;
    },
    deletePermission: async (id: string, reason?: string) => {
        const response = await api.delete(`/auth/permissions/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getRolePermissions: async (roleId?: string) => {
        const url = roleId ? `/auth/role-permissions?roleId=${roleId}` : '/auth/role-permissions';
        const response = await api.get(url);
        return response.data.data;
    },
    updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
        const response = await api.post('/auth/role-permissions', { roleId, permissionIds });
        return response.data.data;
    },
    getUserPermissions: async (userId: string) => {
        const response = await api.get(`/auth/user-permissions?userId=${userId}`);
        return response.data.data;
    },
    updateUserPermissions: async (userId: string, permissionIds: string[]) => {
        const response = await api.post('/auth/user-permissions', { userId, permissionIds });
        return response.data.data;
    },
    createRolePermission: async (data: any) => {
        const response = await api.post('/auth/role-permissions', data);
        return response.data.data;
    },
    updateRolePermission: async (id: string, data: any) => {
        const response = await api.patch(`/auth/role-permissions/${id}`, data);
        return response.data.data;
    },
    // Using mapping IDs for these assignments
    deleteRolePermission: async (id: string, reason?: string) => {
        const response = await api.delete(`/auth/role-permissions/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getUserRoles: async () => {
        const response = await api.get('/auth/user-roles');
        return response.data.data;
    },
    createUserRole: async (data: any) => {
        const response = await api.post('/auth/user-roles', data);
        return response.data.data;
    },
    updateUserRole: async (id: string, data: any) => {
        const response = await api.patch(`/auth/user-roles/${id}`, data);
        return response.data.data;
    },
    deleteUserRole: async (id: string, reason?: string) => {
        const response = await api.delete(`/auth/user-roles/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getAuthMenuRegistry: async () => {
        const response = await api.get('/auth/menu-registry');
        return response.data.data;
    },
    createMenuEntry: async (data: any) => {
        const response = await api.post('/auth/menu-registry', data);
        return response.data.data;
    },
    updateMenuEntry: async (id: string, data: any) => {
        const response = await api.patch(`/auth/menu-registry/${id}`, data);
        return response.data.data;
    },
    deleteMenuEntry: async (id: string, reason?: string) => {
        const response = await api.delete(`/auth/menu-registry/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    getMenuPermissions: async () => {
        const response = await api.get('/auth/menu-permissions');
        return response.data.data;
    },
    createMenuPermission: async (data: any) => {
        const response = await api.post('/auth/menu-permissions', data);
        return response.data.data;
    },
    updateMenuPermission: async (id: string, data: any) => {
        const response = await api.patch(`/auth/menu-permissions/${id}`, data);
        return response.data.data;
    },
    deleteMenuPermission: async (id: string, reason?: string) => {
        const response = await api.delete(`/auth/menu-permissions/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    // 🔔 NOTIFICATIONS
    getNotifications: async () => {
        const response = await api.get('/auth/notifications');
        return response.data.data;
    },
    markNotificationsRead: async (ids?: string[], all: boolean = false) => {
        const response = await api.patch('/auth/notifications', { ids, all });
        return response.data.data;
    },
    sendNotification: async (data: any) => {
        const response = await api.post('/auth/notifications', data);
        return response.data.data;
    },

    // 🎨 BRANDING
    getPlatformBranding: async () => {
        const response = await api.get('/platform/branding');
        return response.data.data;
    },
    updatePlatformBranding: async (data: any) => {
        const response = await api.put('/platform/branding', data);
        return response.data.data;
    },
    getCompanyBranding: async (companyId: string) => {
        const response = await api.get(`/platform/branding/company/${companyId}`);
        return response.data.data;
    },
    updateCompanyBranding: async (companyId: string, data: any) => {
        const response = await api.put(`/platform/branding/company/${companyId}`, data);
        return response.data.data;
    },
    deleteCompanyBranding: async (companyId: string, reason?: string) => {
        const response = await api.delete(`/platform/branding/company/${companyId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
        return response.data.data;
    },

    // 👤 PROFILE
    updateProfile: async (data: any) => {
        const response = await api.patch('/auth/me/profile', data);
        return response.data.data;
    },

    // 🗑️ SOFT DELETE HELPERS
    softDelete: async (resourcePath: string, id: string, reason: string) => {
        const response = await api.delete(`${resourcePath}/${id}?reason=${encodeURIComponent(reason)}`);
        return response.data.data;
    },

    // 🔄 CONTEXT SWITCHING
    switchCompany: (companyId: string) => {
        const Cookie = require('js-cookie');
        Cookie.set('x-company-id', companyId, { expires: 7 }); // Persist for 7 days
        // We don't reload here, let the caller handle UI transition or refresh
    },

    // Fallback for other modules to ensure they exist/are reachable
    getGeneric: async (modulePath: string) => {
        const response = await api.get(modulePath);
        return response.data.data;
    }
};

