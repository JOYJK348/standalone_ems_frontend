"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { platformService } from '@/services/platformService';
import { Bug, Play, CheckCircle, XCircle, Loader2, Database, Eye } from 'lucide-react';

export default function TestAuditPage() {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const addResult = (step: string, status: 'success' | 'error', message: string, data?: any) => {
        setResults(prev => [...prev, { step, status, message, data, timestamp: new Date().toISOString() }]);
    };

    const testDeleteFlow = async () => {
        setTesting(true);
        setResults([]);

        try {
            // Step 1: Create a test company
            addResult('Step 1', 'success', 'Creating test company...', null);
            const testCompany = {
                name: 'Test Archive Company',
                code: 'TEST-' + Date.now(),
                email: 'test@archive.com',
                phone: '1234567890',
                subscription_plan: 'TRIAL'
            };

            const created = await platformService.createCompany(testCompany);
            addResult('Step 1', 'success', `Company created with ID: ${created.id}`, created);

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 2: Delete the company
            addResult('Step 2', 'success', 'Deleting test company...', null);
            const deleteReason = 'Automated test - Verifying audit log system at ' + new Date().toLocaleString();

            await platformService.deleteCompany(created.id, deleteReason);
            addResult('Step 2', 'success', `Company deleted with reason: ${deleteReason}`, null);

            // Wait for backend to process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Fetch audit logs
            addResult('Step 3', 'success', 'Fetching audit logs...', null);
            const logs = await platformService.getAuditLogs();
            const deleteLogs = logs.filter((log: any) => log.action === 'DELETE' || log.action === 'SOFT_DELETE');

            addResult('Step 3', 'success', `Found ${deleteLogs.length} DELETE logs`, deleteLogs);
            setAuditLogs(deleteLogs);

            // Step 4: Verify the specific log
            const ourLog = deleteLogs.find((log: any) =>
                log.new_values?.delete_reason?.includes('Automated test')
            );

            if (ourLog) {
                addResult('Step 4', 'success', '✅ Audit log found in database!', ourLog);
            } else {
                addResult('Step 4', 'error', '❌ Audit log NOT found in database!', null);
            }

        } catch (error: any) {
            addResult('Error', 'error', error.message || 'Test failed', error);
        } finally {
            setTesting(false);
        }
    };

    const fetchCurrentLogs = async () => {
        setLoading(true);
        try {
            const logs = await platformService.getAuditLogs();
            const deleteLogs = logs.filter((log: any) => log.action === 'DELETE' || log.action === 'SOFT_DELETE');
            setAuditLogs(deleteLogs);
            addResult('Fetch', 'success', `Fetched ${deleteLogs.length} DELETE logs from database`, deleteLogs);
        } catch (error: any) {
            addResult('Fetch', 'error', error.message, null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                                <Bug className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Audit System Test</h1>
                                <p className="text-sm text-slate-500">Debug and verify delete → audit log flow</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={testDeleteFlow}
                            disabled={testing}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            <span>{testing ? 'Running Test...' : 'Run Full Delete Test'}</span>
                        </button>

                        <button
                            onClick={fetchCurrentLogs}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                            <span>{loading ? 'Fetching...' : 'Fetch Current Audit Logs'}</span>
                        </button>
                    </div>

                    {/* Test Results */}
                    {results.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Test Results
                            </h2>
                            <div className="space-y-3">
                                {results.map((result, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border-2 ${result.status === 'success'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            {result.status === 'success' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-slate-900">{result.step}</span>
                                                    <span className="text-xs text-slate-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-700">{result.message}</p>
                                                {result.data && (
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">View Data</summary>
                                                        <pre className="mt-2 p-3 bg-slate-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                                                            {JSON.stringify(result.data, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Audit Logs Display */}
                    {auditLogs.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Audit Logs in Database ({auditLogs.length})
                            </h2>
                            <div className="space-y-4">
                                {auditLogs.map((log: any) => (
                                    <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Action</p>
                                                <p className="font-bold text-sm text-slate-900">{log.action}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Table</p>
                                                <p className="font-bold text-sm text-slate-900">{log.table_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Resource ID</p>
                                                <p className="font-mono text-sm text-slate-900">{log.resource_id || log.record_id || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                                                <p className="text-sm text-slate-900">{new Date(log.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-xs text-slate-500 mb-1">Delete Reason</p>
                                                <p className="text-sm text-slate-700 italic">{log.new_values?.delete_reason || 'N/A'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <details>
                                                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">View Full Log Data</summary>
                                                    <pre className="mt-2 p-3 bg-slate-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                                                        {JSON.stringify(log, null, 2)}
                                                    </pre>
                                                </details>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h3 className="font-bold text-blue-900 mb-3">📋 How to Use This Test Page:</h3>
                        <ol className="space-y-2 text-sm text-blue-800">
                            <li><strong>1.</strong> Click "Run Full Delete Test" to create and delete a test company</li>
                            <li><strong>2.</strong> Watch the test results appear in real-time</li>
                            <li><strong>3.</strong> Check if the audit log was created in the database</li>
                            <li><strong>4.</strong> Click "Fetch Current Audit Logs" to see all DELETE logs</li>
                            <li><strong>5.</strong> Check your backend terminal for detailed logs</li>
                        </ol>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
