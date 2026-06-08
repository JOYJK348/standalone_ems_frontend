"use client";

import { BarChart3, CalendarDays, ClipboardList, SlidersHorizontal } from "lucide-react";

const cards = [
    { label: "Menu IDs", value: "Role Driven", icon: SlidersHorizontal },
    { label: "Operations", value: "Custom Scope", icon: ClipboardList },
    { label: "Reports", value: "Allowed Views", icon: BarChart3 },
    { label: "Schedules", value: "As Assigned", icon: CalendarDays }
];

export default function DynamicRoleDashboard() {
    return (
        <main className="min-h-screen bg-[#f8fafc] p-6">
            <section className="mx-auto max-w-6xl space-y-6">
                <div>
                    <p className="text-sm font-semibold text-slate-500">Layer 3</p>
                    <h1 className="text-3xl font-bold text-slate-950">Dynamic Role Dashboard</h1>
                    <p className="mt-2 text-slate-600">Custom staff portal for academic coordinators, finance managers, placement officers and other menu-driven roles.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <card.icon className="mb-3 h-5 w-5 text-amber-600" />
                            <p className="text-sm text-slate-500">{card.label}</p>
                            <p className="mt-1 font-semibold text-slate-950">{card.value}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
