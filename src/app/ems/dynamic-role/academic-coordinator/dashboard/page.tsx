"use client";

import { CalendarCheck, GraduationCap, Layers, Users } from "lucide-react";

const cards = [
    { label: "Students", value: "Coordinate", icon: GraduationCap },
    { label: "Batches", value: "Manage Flow", icon: Layers },
    { label: "Attendance", value: "Monitor", icon: CalendarCheck },
    { label: "Tutors", value: "Assist", icon: Users }
];

export default function AcademicCoordinatorDashboard() {
    return (
        <main className="min-h-screen bg-[#f8fafc] p-6">
            <section className="mx-auto max-w-6xl space-y-6">
                <div>
                    <p className="text-sm font-semibold text-slate-500">Layer 3</p>
                    <h1 className="text-3xl font-bold text-slate-950">Academic Coordinator Dashboard</h1>
                    <p className="mt-2 text-slate-600">Academic operations view for students, batches, schedules and attendance coordination.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <card.icon className="mb-3 h-5 w-5 text-emerald-600" />
                            <p className="text-sm text-slate-500">{card.label}</p>
                            <p className="mt-1 font-semibold text-slate-950">{card.value}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
