"use client";

import { motion } from "framer-motion";
import { Video, Clock, User, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface LiveCardProps {
    isLive?: boolean;
    startsAt?: Date;
    tutor?: string;
    joinUrl?: string;
    onJoin?: () => void;
}

export function LiveCard({
    isLive = false,
    startsAt,
    tutor = "Dr. John Smith",
    joinUrl,
    onJoin,
}: LiveCardProps) {
    const [timeRemaining, setTimeRemaining] = useState<string>("");

    useEffect(() => {
        if (!startsAt) return;

        const updateCountdown = () => {
            const now = new Date();
            const diff = startsAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining("Live Now");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [startsAt]);

    if (!isLive && !startsAt) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 sm:mx-6 mb-6"
            >
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-300 shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No live class today</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Explore workshops and upcoming sessions
                    </p>
                    <Button variant="outline">Explore Workshops</Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 sm:mx-6 mb-6"
        >
            <div className="bg-white rounded-2xl p-6 border-2 border-red-500 relative overflow-hidden shadow-lg">
                {/* Live Badge */}
                {isLive && (
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold"
                    >
                        <Radio className="h-3 w-3" />
                        LIVE
                    </motion.div>
                )}

                <div className="flex items-center gap-4">
                    {/* Tutor Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold shadow-lg">
                        <User className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                            {isLive ? "Live Class in Progress" : "Upcoming Live Class"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">Tutor: {tutor}</p>
                        {!isLive && startsAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">{timeRemaining}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Join Button */}
                <div className="mt-4">
                    <Button
                        onClick={onJoin}
                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        size="lg"
                    >
                        <Video className="h-5 w-5 mr-2" />
                        {isLive ? "Join Now" : "Join When Live"}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
