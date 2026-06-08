'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ENTITY LIMIT HOOK
 * Real-time subscription limit tracking
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type EntityType = 'department' | 'designation' | 'branch' | 'employee';

export interface EntityLimitInfo {
    allowed: boolean;
    current: number;
    maximum: number;
    remaining: number;
    message?: string;
    percentage: number; // Usage percentage
}

interface UseEntityLimitReturn {
    limitInfo: EntityLimitInfo | null;
    loading: boolean;
    error: string | null;
    canCreate: boolean;
    refresh: () => Promise<void>;
    checkLimit: () => Promise<boolean>;
}

/**
 * Hook to check and monitor entity creation limits
 * 
 * @param entityType - Type of entity to check limits for
 * @param autoRefresh - Auto refresh on mount (default: true)
 * 
 * @example
 * ```tsx
 * const { canCreate, limitInfo, loading } = useEntityLimit('department');
 * 
 * if (!canCreate) {
 *   return <SubscriptionUpgradePrompt message={limitInfo?.message} />;
 * }
 * ```
 */
export function useEntityLimit(
    entityType: EntityType,
    autoRefresh: boolean = true
): UseEntityLimitReturn {
    const [limitInfo, setLimitInfo] = useState<EntityLimitInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLimitInfo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/core/entity-limits?type=${entityType}`);
            const data = response.data.data;

            // Calculate usage percentage
            const percentage = data.maximum > 0
                ? Math.round((data.current / data.maximum) * 100)
                : 0;

            setLimitInfo({
                ...data,
                percentage
            });

        } catch (err: any) {
            console.error('[useEntityLimit] Error:', err);
            setError(err.message || 'Failed to fetch limit information');
            setLimitInfo(null);
        } finally {
            setLoading(false);
        }
    }, [entityType]);

    useEffect(() => {
        if (autoRefresh) {
            fetchLimitInfo();
        }
    }, [entityType, autoRefresh, fetchLimitInfo]);

    const checkLimit = async (): Promise<boolean> => {
        await fetchLimitInfo();
        return limitInfo?.allowed ?? false;
    };

    return {
        limitInfo,
        loading,
        error,
        canCreate: limitInfo?.allowed ?? false,
        refresh: fetchLimitInfo,
        checkLimit,
    };
}

/**
 * Hook to check multiple entity limits at once
 * Useful for dashboard displays
 */
export function useMultipleEntityLimits(entityTypes: EntityType[]) {
    const [limits, setLimits] = useState<Record<EntityType, EntityLimitInfo>>({} as any);
    const [loading, setLoading] = useState(false);

    const fetchAllLimits = useCallback(async () => {
        try {
            setLoading(true);

            const promises = entityTypes.map(type =>
                api.get(`/core/entity-limits?type=${type}`)
            );

            const responses = await Promise.all(promises);

            const limitsMap: Record<EntityType, EntityLimitInfo> = {} as any;

            responses.forEach((response, index) => {
                const data = response.data.data;
                const percentage = data.maximum > 0
                    ? Math.round((data.current / data.maximum) * 100)
                    : 0;

                limitsMap[entityTypes[index]] = {
                    ...data,
                    percentage
                };
            });

            setLimits(limitsMap);

        } catch (error) {
            console.error('[useMultipleEntityLimits] Error:', error);
        } finally {
            setLoading(false);
        }
    }, [entityTypes]);

    useEffect(() => {
        fetchAllLimits();
    }, [fetchAllLimits]);

    return {
        limits,
        loading,
        refresh: fetchAllLimits,
    };
}
