"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, User, X, Loader2, Calendar, Clock, BookOpen, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Remove static import to fix build error: TypeError: this.util.TextEncoder is not a constructor
// We will load faceapi lazily inside the component
let faceapi: any = null;

const FaceRegistration = dynamic(
    () => import("./FaceRegistration").then(mod => mod.FaceRegistration),
    { ssr: false }
);

interface AttendanceVerificationProps {
    sessions: any[]; // Array of all active sessions
    onSuccess: (session?: any) => void;
    onClose: () => void;
}

export const AttendanceVerification = ({ sessions, onSuccess, onClose }: AttendanceVerificationProps) => {
    console.log("AttendanceVerification component mounted", { sessions });
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [step, setStep] = useState<"SELECT_SESSION" | "CONFIRM" | "SCANNING" | "VERIFYING" | "SUCCESS" | "ERROR" | "NEED_REGISTRATION">("SELECT_SESSION");
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    // Initial load: Prepare AI Models
    useEffect(() => {
        const load = async () => {
            try {
                console.log("Loading face-api models...");

                // Dynamically load face-api only on the client side
                if (!faceapi) {
                    faceapi = await import("@vladmandic/face-api");
                }

                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
                console.log("✅ Face models loaded successfully");
            } catch (err) {
                console.error("❌ Failed to load face models:", err);
            }
        };
        load();
    }, []);

    // Check enrollment status
    useEffect(() => {
        const checkEnrollment = async () => {
            try {
                const { data } = await api.get("/ems/face-profile/register");
                console.log("Enrollment status:", data);
                if (data.success && data.data && !data.data.is_enrolled) {
                    setStep("NEED_REGISTRATION");
                }
            } catch (err) {
                console.error("Error checking enrollment:", err);
            }
        };
        checkEnrollment();
    }, []);

    // We show all sessions but visually distinguish completed ones
    const availableSessions = (sessions || []);
    const pendingSessions = availableSessions.filter(s => s.recommended_action !== 'COMPLETED');

    // Auto-select if only one pending session
    useEffect(() => {
        if (step === "SELECT_SESSION") {
            if (pendingSessions.length === 1) {
                startVerification(pendingSessions[0]);
            }
        }
    }, [pendingSessions.length, step]);

    const getPreciseLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                console.log("✅ Location acquired");
            },
            (err) => {
                console.warn("⚠️ Location error:", err.message);
                // Fallback: Try with lower accuracy if High Accuracy fails
                navigator.geolocation.getCurrentPosition(
                    (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => toast.error("Could not get GPS. Please ensure Location is enabled."),
                    { enableHighAccuracy: false, timeout: 5000 }
                );
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleResetCamera = async () => {
        // Stop current stream before restart
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        setStream(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            toast.success("Camera Reset Successful");
        } catch (err) {
            toast.error("Could not restart camera");
        }
    };

    const startVerification = async (session: any) => {
        setSelectedSession(session);
        setError(null);

        // If face verification is explicitly disabled (false), we skip camera
        // Default to TRUE (require face) for undefined/null/true
        const requireFace = session.require_face_verification !== false;

        if (!requireFace) {
            setStep("CONFIRM");
            if (!location) getPreciseLocation();
            return;
        }

        startCameraVerification();
    };

    const startCameraVerification = async () => {
        setStep("SCANNING");

        // Only look for location if we don't have it yet
        if (!location) {
            getPreciseLocation();
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
        } catch (err: any) {
            setError("Camera access required for face verification.");
            setStep("ERROR");
        }
    };

    const handleConfirmAttendance = async () => {
        if (!selectedSession) return;

        setStep("VERIFYING");

        try {
            // Wait for location if not yet available
            let loc = location;
            if (!loc) {
                toast.loading("Getting location...");
                try {
                    loc = await new Promise<{ lat: number, lng: number }>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                            err => reject(err),
                            { timeout: 5000, enableHighAccuracy: true }
                        );
                    });
                    setLocation(loc);
                } catch (e) {
                    // Proceed without precise location if it fails, let backend decide policy
                    console.warn("Location failed in confirm", e);
                }
                toast.dismiss();
            }

            const verificationType = selectedSession.verification_type ||
                (selectedSession.recommended_action === 'PUNCH_OUT' ? 'CLOSING' : 'OPENING');

            const response = await api.post("/ems/attendance?mode=student-mark", {
                session_id: selectedSession.id,
                location: loc ? { latitude: loc.lat, longitude: loc.lng } : null,
                verification_type: verificationType
            });

            if (response.data.success) {
                setStep("SUCCESS");
                setTimeout(() => onSuccess(selectedSession), 1500);
            } else {
                setError(response.data.message || "Attendance failed");
                setStep("ERROR");
            }
        } catch (err: any) {
            let backendError = err.response?.data?.error?.message || err.response?.data?.message || err.message;
            if (typeof backendError === 'object') backendError = JSON.stringify(backendError);
            setError(backendError || "Failed to mark attendance");
            setStep("ERROR");
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video && stream && step === "SCANNING") {
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play().catch(console.error);
        }
    }, [stream, step]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === "SCANNING" && stream && isModelsLoaded) {
            interval = setInterval(async () => {
                const video = videoRef.current;
                if (!video || video.readyState < 2 || video.paused) return;
                try {
                    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }));
                    setFaceDetected(!!detection);
                } catch (e) { }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [step, stream, isModelsLoaded]);

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    };

    const captureAndVerify = async () => {
        const video = videoRef.current;
        if (!video || !canvasRef.current || !faceDetected || isCapturing || !selectedSession) return;

        if (!location) {
            toast.error("GPS still waiting. Try moving or refreshing.");
            getPreciseLocation();
            return;
        }

        setIsCapturing(true);
        // Don't switch step to VERIFYING immediately, wait for detection

        try {
            const detection = await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                toast.error("Face Mismatched or not detected clearly. Try again.");
                setIsCapturing(false);
                return;
            }

            setStep("VERIFYING");

            const canvas = canvasRef.current;
            canvas.width = 480; canvas.height = 480;
            const ctx = canvas.getContext("2d");
            const size = Math.min(video.videoWidth, video.videoHeight);
            ctx?.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, 480, 480);

            const verificationType = selectedSession.verification_type ||
                (selectedSession.recommended_action === 'PUNCH_OUT' ? 'CLOSING' : 'OPENING');

            const response = await api.post("/ems/attendance?mode=student-mark", {
                session_id: selectedSession.id,
                captured_image: canvas.toDataURL("image/jpeg", 0.6),
                face_descriptor: Array.from(detection.descriptor),
                location: { latitude: location.lat, longitude: location.lng },
                verification_type: verificationType
            });

            if (response.data.success) {
                setStep("SUCCESS");
                setTimeout(() => onSuccess(selectedSession), 1500);
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            let backendError = err.response?.data?.error?.message || err.response?.data?.message || err.message;
            if (typeof backendError === 'object') backendError = JSON.stringify(backendError);
            setError(backendError || "Verification failed");
            setStep("ERROR");
        } finally {
            setIsCapturing(false);
        }
    };

    useEffect(() => {
        return () => stopStream();
    }, [stream]);

    if (step === "NEED_REGISTRATION") {
        return <FaceRegistration onSuccess={() => setStep("SELECT_SESSION")} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={() => { stopStream(); onClose(); }} className="absolute top-6 right-6 z-10 p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition-colors font-black">
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Punch Attendance</h2>
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">
                                {step === "CONFIRM" || (selectedSession && selectedSession.require_face_verification === false)
                                    ? "Action Confirmation"
                                    : "Biometric Verification"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        {step === "SELECT_SESSION" && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 leading-none">
                                        {pendingSessions.length > 0 ? "Select Class Session" : "All Caught Up!"}
                                    </h3>
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                        {pendingSessions.length > 0 ? "Choose your course to mark attendance" : "You've marked all pending attendance for today."}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {availableSessions.map((session, idx) => {
                                        const isExit = session.recommended_action === 'PUNCH_OUT';
                                        const isCompleted = session.recommended_action === 'COMPLETED';

                                        return (
                                            <motion.div
                                                key={session.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => !isCompleted && startVerification(session)}
                                                className={`group relative p-6 rounded-[2.5rem] border-2 transition-all shadow-lg ${isCompleted
                                                    ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-75"
                                                    : isExit
                                                        ? "bg-orange-50/50 border-orange-100 hover:bg-orange-600 hover:border-orange-400 cursor-pointer active:scale-95"
                                                        : "bg-green-50/50 border-green-100 hover:bg-green-600 hover:border-green-400 cursor-pointer active:scale-95"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between pointer-events-none">
                                                    <div>
                                                        <h4 className={`font-black text-lg ${isCompleted ? "text-gray-400" : isExit ? "text-orange-900 group-hover:text-white" : "text-green-900 group-hover:text-white"}`}>{session.course?.course_name}</h4>
                                                        <p className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? "text-gray-300" : isExit ? "text-orange-600 group-hover:text-orange-100" : "text-green-600 group-hover:text-green-100"}`}>{session.session_type}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-full ${isCompleted ? "bg-gray-100" : isExit ? "bg-orange-100 group-hover:bg-white/20" : "bg-green-100 group-hover:bg-white/20"}`}>
                                                        {isCompleted ? <CheckCircle2 className="h-6 w-6 text-gray-300" /> : isExit ? <User className="h-6 w-6 text-orange-600 group-hover:text-white" /> : <ShieldCheck className="h-6 w-6 text-green-600 group-hover:text-white" />}
                                                    </div>
                                                </div>

                                                {/* Class Mode Indicator */}
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${isCompleted ? 'bg-gray-100 text-gray-400' : session.class_mode === 'ONLINE' ? 'bg-purple-100 text-purple-700' :
                                                        session.class_mode === 'HYBRID' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {session.class_mode || 'OFFLINE'}
                                                    </span>
                                                </div>

                                                {/* Action Badge */}
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        Batch: {session.batch?.batch_name || "Regular"}
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${isCompleted
                                                        ? "bg-gray-100 text-gray-400 border-gray-200"
                                                        : isExit
                                                            ? "bg-orange-500 text-white border-orange-400"
                                                            : "bg-green-600 text-white border-green-500"
                                                        }`}>
                                                        {isCompleted ? "Already Marked" : isExit ? "Exit Attendance" : "Entry Attendance"}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {availableSessions.length === 0 && (
                                        <div className="py-12 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-4">
                                                <Calendar className="h-10 w-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No Session Available</h3>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Currently no active attendance sessions found</p>
                                            <Button
                                                variant="ghost"
                                                onClick={onClose}
                                                className="mt-6 text-blue-600 font-bold text-xs uppercase tracking-widest px-8 h-10 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                Go Back
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {availableSessions.length > 0 && pendingSessions.length > 0 && (
                                    <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest pt-4 italic">Select your active session to proceed with biometric scan</p>
                                )}
                                {availableSessions.length > 0 && pendingSessions.length === 0 && (
                                    <p className="text-center text-[10px] text-gray-500 font-black uppercase tracking-widest pt-4">All today's sessions are marked for now. Check back during exit time.</p>
                                )}
                            </div>
                        )}

                        {step === "SCANNING" && (
                            <div className="space-y-6">
                                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gray-950 border-4 border-gray-50 shadow-2xl">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

                                    {/* Camera Control: Refresh Button */}
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                        {!location && (
                                            <button
                                                onClick={getPreciseLocation}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/80 hover:bg-amber-600 backdrop-blur-xl rounded-full border border-amber-400/50 text-white transition-all shadow-xl active:scale-95"
                                            >
                                                <MapPin className="h-3 w-3 animate-pulse" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Retry GPS</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleResetCamera}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full border border-white/20 text-white transition-all shadow-2xl active:scale-95 group"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${isCapturing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Reset Camera</span>
                                        </button>
                                    </div>

                                    {/* Loading State Overlay */}
                                    {!stream && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm">
                                            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Initializing Camera...</p>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[2px] bg-blue-400/50 blur-[1px] animate-[scan_2s_ease-in-out_infinite]" />
                                    <style jsx>{` @keyframes scan { 0%, 100% { top: 20%; opacity: 0; } 50% { top: 80%; opacity: 1; } } `}</style>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className={`w-64 h-64 border-2 rounded-full transition-all duration-500 ${faceDetected ? 'border-green-400 scale-105' : 'border-white/20 border-dashed'}`} />
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md border ${faceDetected ? 'bg-green-500 text-white border-green-400' : 'bg-black/40 text-white border-white/20'}`}>
                                            {selectedSession?.course?.course_name.substring(0, 15)}...
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-white text-[10px] font-bold border ${location ? 'border-green-400/30' : 'border-white/10'}`}>
                                            <MapPin className={`h-3 w-3 ${location ? 'text-green-400' : 'text-gray-400 animate-pulse'}`} />
                                            {location ? "GPS VALID" : "GPS SEARCHING..."}
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={captureAndVerify} disabled={!faceDetected && step === 'SCANNING'} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 text-white text-sm uppercase tracking-wider">
                                    <ShieldCheck className={`h-5 w-5 ${faceDetected ? 'animate-bounce' : ''}`} />
                                    Verify & Mark Attendance
                                </Button>
                                <Button variant="ghost" onClick={() => { stopStream(); setStep("SELECT_SESSION"); }} className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors">Choose another course</Button>
                            </div>
                        )}

                        {step === "VERIFYING" && (
                            <div className="text-center py-12 space-y-6">
                                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
                                <h3 className="text-xl font-black text-gray-900">Confirming Biometrics...</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Marking presence for {selectedSession?.course?.course_name}</p>
                            </div>
                        )}

                        {step === "SUCCESS" && (
                            <div className="text-center py-12 space-y-6">
                                <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
                                <h3 className="text-2xl font-black text-gray-900 uppercase">Verified!</h3>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-sm font-medium italic">Attendance marked for:</p>
                                    <p className="text-blue-600 font-black tracking-tight">{selectedSession?.course?.course_name}</p>
                                </div>
                            </div>
                        )}

                        {step === "CONFIRM" && (
                            <div className="flex flex-col h-full">
                                <div className="text-center py-8 px-4 space-y-4 flex-1 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 relative">
                                        <MapPin className="h-10 w-10 text-blue-600" />
                                        {location && (
                                            <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-black text-gray-900">Confirm Attendance</h3>
                                    <p className="text-gray-500 text-sm">
                                        Mark your presence for <br />
                                        <span className="font-bold text-blue-600 text-lg">{selectedSession?.course?.course_name}</span>
                                    </p>

                                    <div className={`mt-6 p-4 rounded-2xl w-full max-w-xs border ${location ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                                        }`}>
                                        <div className="flex items-center justify-center gap-2 text-sm font-bold">
                                            {location ? (
                                                <>
                                                    <MapPin className="h-4 w-4" />
                                                    <span>Location Acquired</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Acquiring Location...</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50/50 space-y-3">
                                    <Button
                                        onClick={handleConfirmAttendance}
                                        disabled={!location}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                                    >
                                        Mark Attendance
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep("SELECT_SESSION")}
                                        className="w-full text-gray-400 font-bold"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === "ERROR" && (
                            <div className="text-center py-8 space-y-6">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900">Verification Failed</h3>
                                    <p className="text-red-500 font-medium text-sm bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => {
                                            if (selectedSession?.require_face_verification === false) {
                                                setStep("CONFIRM");
                                            } else {
                                                setStep("SCANNING");
                                            }
                                        }}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase shadow-lg"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep("SELECT_SESSION")}
                                        className="w-full text-gray-500 font-bold text-xs uppercase"
                                    >
                                        Back to Session List
                                    </Button>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75" />
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div >
        </div >
    );
};
