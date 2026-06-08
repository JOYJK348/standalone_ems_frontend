"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import {
    ScreenShare,
    Video,
    VideoOff,
    Mic,
    MicOff,
    LogOut,
    Users,
    Settings,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function LiveRoomPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuthStore();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModeratorWarning, setIsModeratorWarning] = useState(false);

    const meetingId = params.meetingId as string;
    const isTutor = searchParams.get('role') === 'tutor' || user?.role?.name?.toLowerCase()?.includes('tutor') || user?.role?.name?.toLowerCase()?.includes('admin');

    useEffect(() => {
        if (isTutor) setIsModeratorWarning(true);
    }, [isTutor]);

    useEffect(() => {
        const loadJitsiScript = () => {
            return new Promise((resolve) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve(true);
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://meet.jit.si/external_api.js";
                script.async = true;
                script.onload = () => resolve(true);
                document.body.appendChild(script);
            });
        };

        const initJitsi = async () => {
            await loadJitsiScript();

            if (jitsiContainerRef.current) {
                const domain = "meet.jit.si";
                const options = {
                    roomName: meetingId,
                    width: "100%",
                    height: "100%",
                    parentNode: jitsiContainerRef.current,
                    userInfo: {
                        displayName: user?.display_name || "Guest",
                        email: user?.email || ""
                    },
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        prejoinPageEnabled: false, // Try to go straight in
                        disableModeratorIndicator: false,
                        enableWelcomePage: false,
                        enableUserRoles: true,
                        disableDeepLinking: true,
                        // Enable some nice features
                        enableNoAudioDetection: true,
                        enableNoisyMicDetection: true,
                    },
                    interfaceConfigOverwrite: {
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                    }
                };

                const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
                setApi(jitsiApi);
                setIsLoading(false);

                // Listen for events
                jitsiApi.addEventListener('videoConferenceJoined', () => {
                    toast.success("Joined meeting successfully");
                    if (isTutor) {
                        setIsModeratorWarning(true);
                    }
                });

                jitsiApi.addEventListener('videoConferenceLeft', () => {
                    router.back();
                });
            }
        };

        initJitsi();

        return () => {
            if (api) api.dispose();
        };
    }, [meetingId, user]);

    const handleLeave = () => {
        if (api) api.executeCommand('hangup');
        router.back();
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
            {/* Minimal Top Bar */}
            <div className="h-14 bg-[#111] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold tracking-tight text-white/90">Durkkas Live</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-sm font-medium text-white/60 truncate max-w-[200px]">
                        {meetingId.replace(/-/g, ' ')}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {isTutor && (
                        <div className="hidden sm:flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                            <ShieldAlert className="w-4 h-4 text-blue-400" />
                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Moderator Mode</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLeave}
                        className="text-white/60 hover:text-white hover:bg-red-500/20 transition-all rounded-full"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave Room
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-black">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
                        <div className="relative">
                            <div className="h-20 w-20 border-t-2 border-r-2 border-blue-600 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-500">
                                LIVE
                            </div>
                        </div>
                        <p className="mt-6 text-white/40 text-sm font-medium animate-pulse">
                            Establishing secure connection...
                        </p>
                    </div>
                )}

                <div ref={jitsiContainerRef} className="w-full h-full" />

                {/* Moderator Info Overlay (Temporary) */}
                <AnimatePresence>
                    {isModeratorWarning && isTutor && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
                        >
                            <div className="bg-[#1a1a1a] border border-blue-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldAlert className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Claim Moderator Rights</h4>
                                        <p className="text-xs text-white/60 leading-relaxed mb-4">
                                            If Jitsi asks for a moderator, please click <b>"Log-in"</b> in the meeting screen to authenticate as the session owner.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                                            onClick={() => setIsModeratorWarning(false)}
                                        >
                                            Got it, thanks!
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
