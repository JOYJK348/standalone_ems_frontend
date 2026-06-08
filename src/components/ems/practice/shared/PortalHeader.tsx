'use client';

import { Shield } from 'lucide-react';

interface PortalHeaderProps {
    title: string;
    subtitle: string;
    color: 'green' | 'orange' | 'blue';
    badge: string;
    attemptInfo: {
        used: number;
        limit: number;
    };
}

const COLORS = {
    green: 'from-green-700 to-emerald-800',
    orange: 'from-orange-700 to-red-800',
    blue: 'from-blue-700 to-indigo-800'
};

const BADGE_COLORS = {
    green: 'bg-green-200 text-green-900',
    orange: 'bg-orange-200 text-orange-900',
    blue: 'bg-blue-200 text-blue-900'
};

export function PortalHeader({ title, subtitle, color, badge, attemptInfo }: PortalHeaderProps) {
    return (
        <div className={`bg-gradient-to-r ${COLORS[color]} text-white rounded-xl p-4 sm:p-6 shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 opacity-80" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Government of India</p>
                        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
                        <p className="text-sm opacity-90">{subtitle}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`px-3 py-1.5 rounded-lg ${BADGE_COLORS[color]} text-xs font-bold`}>
                        {badge}
                    </div>
                    <p className="text-xs mt-1 opacity-80">
                        Attempts: {attemptInfo.used}/{attemptInfo.limit}
                    </p>
                </div>
            </div>
        </div>
    );
}
