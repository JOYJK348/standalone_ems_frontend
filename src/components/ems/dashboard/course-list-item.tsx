"use client";

import { motion } from "framer-motion";
import { BookOpen, PlayCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CourseListItemProps {
    course: {
        id: string;
        title: string;
        thumbnail?: string;
        progress: number;
        nextLesson?: string;
    };
    onSwipeAction?: (action: string) => void;
}

export function CourseListItem({ course }: CourseListItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
            <Link href={`/ems/student/courses?course=${course.id}`}>
                <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h4>
                        {course.nextLesson && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                Next: {course.nextLesson}
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-blue-600 rounded-full"
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{course.progress}%</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PlayCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
