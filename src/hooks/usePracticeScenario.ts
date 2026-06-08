'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import type { PracticeScenario } from '@/lib/practiceTypes';

interface UsePracticeScenarioReturn {
    scenario: PracticeScenario | null;
    loading: boolean;
    error: string | null;
    currentHintIndex: number;
    showNextHint: () => void;
    resetHints: () => void;
    refreshScenario: () => Promise<void>;
}

export function usePracticeScenario(
    moduleType: 'GST' | 'TDS' | 'INCOME_TAX',
    excludeIds: number[] = []
): UsePracticeScenarioReturn {
    const [scenario, setScenario] = useState<PracticeScenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentHintIndex, setCurrentHintIndex] = useState(-1);
    const fetchId = useRef(0);

    const fetchScenario = useCallback(async () => {
        const id = ++fetchId.current;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ action: 'pick-random', moduleType });
            if (excludeIds.length > 0) {
                params.set('excludeIds', excludeIds.join(','));
            }
            const res = await api.get(`/ems/practice/scenarios?${params}`);
            if (id !== fetchId.current) return;
            const data = res.data?.data;
            if (data) {
                setScenario(data);
                setCurrentHintIndex(-1);
            } else {
                setError('No scenarios available for this module.');
            }
        } catch (err: any) {
            if (id !== fetchId.current) return;
            const msg = err.response?.data?.message || err.message || 'Failed to load scenario';
            setError(msg);
        } finally {
            if (id === fetchId.current) {
                setLoading(false);
            }
        }
    }, [moduleType, excludeIds.length > 0 ? excludeIds.join(',') : '']);

    useEffect(() => {
        fetchScenario();
    }, [fetchScenario]);

    const showNextHint = useCallback(() => {
        if (!scenario) return;
        setCurrentHintIndex(prev =>
            prev < scenario.expected_hints.length - 1 ? prev + 1 : prev
        );
    }, [scenario]);

    const resetHints = useCallback(() => {
        setCurrentHintIndex(-1);
    }, []);

    return {
        scenario,
        loading,
        error,
        currentHintIndex,
        showNextHint,
        resetHints,
        refreshScenario: fetchScenario
    };
}
