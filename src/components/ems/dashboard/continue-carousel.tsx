"use client";

import { motion, useMotionValue } from "framer-motion";
import { PlayCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import Image from "next/image";

interface Course {
    id: string;
    title: string;
    module: string;
    progress: number;
    cover?: string;
}

interface ContinueCarouselProps {
    courses: Course[];
}

export function ContinueCarousel({ courses }: ContinueCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollLeft = container.scrollLeft;
        const cardWidth = 280;
        const newIndex = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(newIndex);
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 px-4 sm:px-6">Continue Learning</h3>
            <div
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 pb-4"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {courses.map((course, index) => {
                    const isCentered = index === currentIndex;
                    return (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                scale: isCentered ? 1.05 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-shrink-0 w-[280px] snap-center"
                        >
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                {/* Course Thumbnail */}
                                <div className="h-32 sm:h-36 bg-gradient-to-br from-blue-600 to-indigo-600 relative overflow-hidden">
                                    {course.cover ? (
                                        <>
                                            <Image
                                                src={course.cover}
                                                alt={course.title}
                                                fill
                                                sizes="(max-width: 640px) 280px, 280px"
                                                className="object-cover"
                                                priority={index === 0}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-white/30" />
                                        </div>
                                    )}
                                    {/* Progress Badge Overlay */}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-md">
                                        <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h4>
                                    <p className="text-xs text-muted-foreground mb-3">{course.module}</p>

                                    {/* Progress Pill */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className="h-full bg-blue-600 rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs font-medium ml-2 text-gray-600">
                                            {course.progress}%
                                        </span>
                                    </div>

                                    {/* Resume CTA */}
                                    <Button size="sm" className="w-full" variant="outline">
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Resume
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
