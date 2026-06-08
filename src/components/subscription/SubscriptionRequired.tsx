'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';

interface SubscriptionRequiredProps {
    moduleName?: string;
    message?: string;
}

/**
 * Professional subscription upgrade prompt
 * Shows when user tries to access a feature not in their plan
 */
export default function SubscriptionRequired({
    moduleName = 'this feature',
    message
}: SubscriptionRequiredProps) {
    const router = useRouter();

    const defaultMessage = `The ${moduleName} module is not included in your current subscription plan.`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Main Card */}
                <div className="relative bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Header Gradient */}
                    <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>

                    <div className="p-12 text-center space-y-8">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="relative w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                    <ShieldAlert className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                Subscription Upgrade Required
                            </h1>
                            <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                                {message || defaultMessage}
                            </p>
                        </div>

                        {/* Features Preview */}
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-violet-600" />
                                <h3 className="text-sm font-black text-violet-900 uppercase tracking-widest">
                                    Unlock Premium Features
                                </h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Upgrade your subscription to access advanced modules, increased limits,
                                and priority support. Contact your administrator or our sales team to learn more.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button
                                onClick={() => router.back()}
                                className="group px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Go Back
                            </button>
                            <button
                                onClick={() => router.push('/ems/tenant-admin/dashboard')}
                                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-white font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40"
                            >
                                Return to Dashboard
                            </button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-slate-400 pt-4">
                            Need help? Contact your system administrator or reach out to our support team.
                        </p>
                    </div>
                </div>

                {/* Bottom Decoration */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Powered by <span className="font-bold text-slate-600">Durkkas Innovations</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
