"use client";

import { useState } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TimetablePage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Timetable
                        </h1>
                        <p className="text-gray-600 mt-1">Manage class schedules and timings</p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Schedule
                    </Button>
                </div>

                <Card className="border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Button variant="outline" size="sm">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h2 className="text-lg font-semibold">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <Button variant="outline" size="sm">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-200 p-2 bg-gray-50 text-left text-sm font-medium">Time</th>
                                        {daysOfWeek.map((day) => (
                                            <th key={day} className="border border-gray-200 p-2 bg-gray-50 text-center text-sm font-medium">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((time) => (
                                        <tr key={time}>
                                            <td className="border border-gray-200 p-2 text-sm font-medium text-gray-600">{time}</td>
                                            {daysOfWeek.map((day) => (
                                                <td key={`${day}-${time}`} className="border border-gray-200 p-2 hover:bg-purple-50 cursor-pointer">
                                                    <div className="min-h-[60px]"></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </AcademicManagerLayout>
        </div>
    );
}

