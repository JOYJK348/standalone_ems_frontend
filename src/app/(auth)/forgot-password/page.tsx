"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { platformService } from '@/services/platformService';
import {
    KeyRound,
    ArrowLeft,
    ShieldCheck,
    Loader2,
    Mail,
    Hash,
    Lock,
    CheckCircle2,
    Info
} from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [employeeCode, setEmployeeCode] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [userName, setUserName] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await platformService.forgotPassword({
                action: 'VERIFY',
                email,
                employee_code: employeeCode
            });
            setUserName(data.name);
            setStep(2);
            toast.success("Identity Verified");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Verification Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPass.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await platformService.forgotPassword({
                action: 'RESET',
                email,
                employee_code: employeeCode,
                new_password: newPass
            });
            setStep(3);
            toast.success("Password Reset Successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Reset Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative">

                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 w-full absolute top-0" />

                <div className="p-8">
                    {/* Top Nav */}
                    {step < 3 && (
                        <Link href="/login" className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
                            <ArrowLeft size={16} className="mr-1" /> Back to Login
                        </Link>
                    )}

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
                                <p className="text-slate-500 mt-2 text-sm">Verify your identity using your official credentials.</p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Registered Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="john@durkkas.in"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Employee Code</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={employeeCode}
                                            onChange={(e) => setEmployeeCode(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase font-mono"
                                            placeholder="e.g. EMP001"
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start mt-4">
                                    <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        Note: If you don't remember your Employee Code, please contact your <strong>Company Admin</strong> or HR Department for assistance.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                                    <KeyRound size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                                <p className="text-slate-500 mt-2 text-sm">Hello <strong>{userName}</strong>, create a new strong password.</p>
                            </div>

                            <form onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPass}
                                            onChange={(e) => setConfirmPass(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-in zoom-in duration-300 py-10">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">All Set!</h2>
                            <p className="text-slate-500 mt-2 mb-8">Your password has been successfully updated. You can now login with your new credentials.</p>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
