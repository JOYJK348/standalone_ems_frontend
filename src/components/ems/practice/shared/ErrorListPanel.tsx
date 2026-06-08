'use client';

import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';

interface ErrorItem {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

interface ErrorListPanelProps {
    errors: ErrorItem[];
    onDismiss?: (field: string) => void;
}

export function ErrorListPanel({ errors, onDismiss }: ErrorListPanelProps) {
    if (errors.length === 0) return null;

    return (
        <div
            className="border-2 border-red-200 bg-red-50 rounded-xl overflow-hidden"
        >
            <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                    <XCircle className="h-4 w-4" />
                    {errors.length} Issue{errors.length !== 1 ? 's' : ''} Found
                </div>
                <span className="text-xs text-red-200">Fix before proceeding</span>
            </div>
            <div className="divide-y divide-red-100">
                    {errors.map((err) => (
                        <div
                            key={err.field}
                            className="flex items-start gap-3 px-4 py-2.5"
                        >
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-900">
                                    {err.field}
                                </p>
                                <p className="text-xs text-red-700">{err.message}</p>
                            </div>
                            {onDismiss && (
                                <button
                                    onClick={() => onDismiss(err.field)}
                                    className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
