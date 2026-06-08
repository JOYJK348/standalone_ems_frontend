"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    MessageSquare,
    Video,
    Calendar,
    Clock,
    CheckCircle2,
    Plus,
    Search,
    User,
    ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function DoubtSessionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "pending">("all");

    const doubtSessions = [
        { id: 1, topic: "React Hooks - useState vs useEffect", type: "live", status: "scheduled", scheduledTime: "Dec 20, 2024 at 4:00 PM", tutor: "Dr. John Smith" },
        { id: 2, topic: "API Integration Best Practices", type: "chat", status: "completed", completedDate: "Dec 15, 2024", tutor: "Dr. Jane Doe" },
        { id: 3, topic: "Database Optimization", type: "request", status: "pending", requestedDate: "Dec 18, 2024" },
    ];

    const filteredSessions = doubtSessions.filter(s => {
        const matchesSearch = s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.tutor && s.tutor.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filter === "all" || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-100 text-blue-700 border-blue-200";
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "pending": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleRequest = () => {
        toast.info("Feature Coming Soon", {
            description: "The doubt request system is being updated.",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Doubt Sessions</h1>
                            <p className="text-gray-600">Request and attend live doubt clearing sessions</p>
                        </div>
                        <Button onClick={handleRequest} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Request Session
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search doubts, tutors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {(["all", "scheduled", "completed", "pending"] as const).map((f) => (
                                <Button
                                    key={f}
                                    variant={filter === f ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilter(f)}
                                    className={`whitespace-nowrap ${filter === f ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    {filteredSessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.type === "live" ? "bg-red-100" :
                                                session.type === "chat" ? "bg-blue-100" : "bg-orange-100"
                                                }`}>
                                                {session.type === "live" ? (
                                                    <Video className="h-6 w-6 text-red-600" />
                                                ) : session.type === "chat" ? (
                                                    <MessageSquare className="h-6 w-6 text-blue-600" />
                                                ) : (
                                                    <Clock className="h-6 w-6 text-orange-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{session.topic}</h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                                    {session.status === "scheduled" && (
                                                        <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                                            <Calendar className="h-4 w-4 text-blue-600" />
                                                            {session.scheduledTime}
                                                        </span>
                                                    )}
                                                    {session.status === "completed" && (
                                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Completed: {session.completedDate}
                                                        </span>
                                                    )}
                                                    {session.status === "pending" && (
                                                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                            <Clock className="h-4 w-4" />
                                                            Requested: {session.requestedDate}
                                                        </span>
                                                    )}
                                                    {session.tutor && (
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            {session.tutor}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(session.status)}`}>
                                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                            </span>
                                            {session.status === "scheduled" && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    <Video className="h-4 w-4 mr-2" />
                                                    Join Session
                                                </Button>
                                            )}
                                            {session.status === "pending" && (
                                                <Button size="sm" variant="outline" disabled className="opacity-50">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Awaiting Approval
                                                </Button>
                                            )}
                                            {session.status === "completed" && (
                                                <Button size="sm" variant="outline">
                                                    View Transcript
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
