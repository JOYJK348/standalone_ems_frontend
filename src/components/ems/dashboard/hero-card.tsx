"use client";

import { motion } from "framer-motion";
import { PlayCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroCardProps {
    coverImage?: string;
    courseTitle: string;
    progressPercent: number;
    resumeRoute: string;
    lastSeenTimestamp?: number;
}

export function HeroCard({
    courseTitle,
    progressPercent,
    resumeRoute,
}: HeroCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mx-4 sm:mx-6 mb-6 rounded-2xl overflow-hidden shadow-xl"
        >
            {/* Professional Background */}
            <div className="absolute inset-0 bg-blue-600">
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            {/* Content */}
            <div className="relative p-6 sm:p-8 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{courseTitle}</h2>
                    <p className="text-sm sm:text-base text-white/80 mb-4">
                        Continue where you left off
                    </p>

                    {/* Progress Ring */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                            <svg className="transform -rotate-90 w-full h-full">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <motion.circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    stroke="white"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 45}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercent / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm sm:text-base font-bold">{progressPercent}%</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs sm:text-sm text-white/70 mb-1">Course Progress</div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1.5, delay: 0.3 }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resume CTA */}
                    <Link href={resumeRoute}>
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-white text-blue-700 hover:bg-gray-100 shadow-lg font-semibold"
                        >
                            <PlayCircle className="h-5 w-5 mr-2" />
                            Resume Learning
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
