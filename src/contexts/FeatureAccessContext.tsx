"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export type ModuleType = 'CORE' | 'EMS';

export interface FeatureAccessContext {
    company: {
        id: number;
        name: string;
        subscriptionPlan: string;
        subscriptionStatus: string;
    } | null;
    enabledModules: ModuleType[];
    accessibleMenuIds: number[];
    limits: {
        maxUsers: number;
        maxBranches: number;
        maxEmployees: number;
        maxDepartments: number;
        maxDesignations: number;
    };
    isPlatformAdmin: boolean;
    isLoading: boolean;
    error: string | null;

    // Helper methods
    hasModule: (module: ModuleType) => boolean;
    hasAnyModule: (modules: ModuleType[]) => boolean;
    hasMenuAccess: (menuId: number) => boolean;
    refresh: () => Promise<void>;
}

const FeatureAccessContext = createContext<FeatureAccessContext | null>(null);

export function FeatureAccessProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthStore();



    const [state, setState] = useState<FeatureAccessContext>({
        company: null,
        enabledModules: [],
        accessibleMenuIds: [],
        limits: {
            maxUsers: 0,
            maxBranches: 0,
            maxEmployees: 0,
            maxDepartments: 0,
            maxDesignations: 0,
        },
        isPlatformAdmin: false,
        isLoading: true,
        error: null,
        hasModule: () => false,
        hasAnyModule: () => false,
        hasMenuAccess: () => false,
        refresh: async () => { },
    });

    const loadFeatureAccess = async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            // Check sessionStorage for pre-fetched data (set by login page)
            const stored = typeof window !== 'undefined' ? sessionStorage.getItem('feature_access') : null;
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    const faState = {
                        company: data.company,
                        enabledModules: data.enabledModules || [],
                        accessibleMenuIds: data.accessibleMenuIds || [],
                        limits: data.limits || { maxUsers: 0, maxBranches: 0, maxEmployees: 0, maxDepartments: 0, maxDesignations: 0 },
                        isPlatformAdmin: data.isPlatformAdmin || false,
                        isLoading: false,
                        error: null,
                        hasModule: (module: ModuleType) => (data.enabledModules || []).includes(module),
                        hasAnyModule: (modules: ModuleType[]) => modules.some(m => (data.enabledModules || []).includes(m)),
                        hasMenuAccess: (menuId: number) => (data.accessibleMenuIds || []).includes(menuId),
                        refresh: loadFeatureAccess,
                    };
                    setState(faState);
                    sessionStorage.removeItem('feature_access');
                    return;
                } catch { }
            }

            const response = await api.get('/auth/feature-access');
            const data = response.data.data;

            setState({
                company: data.company,
                enabledModules: data.enabledModules || [],
                accessibleMenuIds: data.accessibleMenuIds || [],
                limits: data.limits || {
                    maxUsers: 0,
                    maxBranches: 0,
                    maxEmployees: 0,
                    maxDepartments: 0,
                    maxDesignations: 0,
                },
                isPlatformAdmin: data.isPlatformAdmin || false,
                isLoading: false,
                error: null,
                hasModule: (module: ModuleType) => (data.enabledModules || []).includes(module),
                hasAnyModule: (modules: ModuleType[]) => modules.some(m => (data.enabledModules || []).includes(m)),
                hasMenuAccess: (menuId: number) => (data.accessibleMenuIds || []).includes(menuId),
                refresh: loadFeatureAccess,
            });
        } catch (error: any) {
            console.error('[FeatureAccess] Failed to load:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.error?.message || 'Failed to load feature access',
            }));
        }
    };

    useEffect(() => {
        if (user) {
            loadFeatureAccess();
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [user]);

    return (
        <FeatureAccessContext.Provider value={state}>
            {children}
        </FeatureAccessContext.Provider>
    );
}

export function useFeatureAccess() {
    const context = useContext(FeatureAccessContext);
    if (!context) {
        throw new Error('useFeatureAccess must be used within FeatureAccessProvider');
    }
    return context;
}
