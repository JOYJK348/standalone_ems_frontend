"use client";

import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Assignment {
    id: string;
    title: string;
    dueDate: string;
    status: "pending" | "submitted" | "overdue";
    sampleFile?: string;
}

interface AssignmentsCardProps {
    assignments: Assignment[];
}

export function AssignmentsCard({ assignments }: AssignmentsCardProps) {
    if (assignments.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 sm:mx-6 mb-6"
            >
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-300 shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">You're all caught up! 🎉</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        No pending assignments at the moment
                    </p>
                    <Link href="/ems/student/assignments">
                        <Button variant="outline">Explore More</Button>
                    </Link>
                </div>
            </motion.div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "overdue":
                return "bg-red-100 text-red-700 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "submitted":
                return "bg-green-100 text-green-700 border-green-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "overdue":
                return <AlertCircle className="h-4 w-4" />;
            case "pending":
                return <Clock className="h-4 w-4" />;
            case "submitted":
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="mb-6 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Assignments</h3>
                <Link href="/ems/student/assignments">
                    <Button variant="ghost" size="sm">
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            </div>
            <div className="space-y-3">
                {assignments.slice(0, 3).map((assignment, index) => (
                    <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/ems/student/assignments?id=${assignment.id}`}>
                            <div
                                className={`p-4 rounded-xl border-2 ${getStatusColor(
                                    assignment.status
                                )} hover:shadow-md transition-all`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="mt-1">
                                            {getStatusIcon(assignment.status)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm mb-1">{assignment.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Due: {assignment.dueDate}
                                            </div>
                                        </div>
                                    </div>
                                    {assignment.status === "pending" && (
                                        <Button size="sm" variant="outline">
                                            Submit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
