"use client";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";

export default function FixEnterpriseLimitsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runFix = async () => {
        setLoading(true);
        try {
            const response = await api.post('/platform/fix-enterprise-limits');
            setResult(response.data);
            toast.success("Enterprise limits updated successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update limits");
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">
                        Fix Enterprise Plan Limits
                    </h1>
                    <p className="text-slate-600">
                        This will update all Enterprise plan companies to have unlimited (∞) limits
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <h2 className="font-bold text-slate-900 mb-3">What this does:</h2>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Sets <strong>max_users = 0</strong> (Unlimited)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Sets <strong>max_employees = 0</strong> (Unlimited)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Sets <strong>max_branches = 0</strong> (Unlimited)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Sets <strong>max_departments = 0</strong> (Unlimited)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Sets <strong>max_designations = 0</strong> (Unlimited)</span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={runFix}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Run Migration
                        </>
                    )}
                </button>

                {result && (
                    <div className={`mt-6 p-4 rounded-xl ${result.error ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <div className="flex items-start gap-3">
                            {result.error ? (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <h3 className={`font-bold mb-1 ${result.error ? 'text-red-900' : 'text-emerald-900'}`}>
                                    {result.error ? 'Error' : 'Success!'}
                                </h3>
                                <p className={`text-sm ${result.error ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {result.error || result.message}
                                </p>
                                {result.data && (
                                    <div className="mt-3 bg-white rounded-lg p-3 text-xs font-mono text-slate-700">
                                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a href="/workspace/dashboard" className="text-sm text-violet-600 hover:text-violet-700 font-semibold">
                        ← Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
