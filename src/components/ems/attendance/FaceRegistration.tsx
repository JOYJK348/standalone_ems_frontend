"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";

interface FaceRegistrationProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export const FaceRegistration = ({ onSuccess, onClose }: FaceRegistrationProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [step, setStep] = useState<"LOADING" | "CAMERA" | "CAPTURING" | "PROCESSING" | "SUCCESS" | "ERROR">("LOADING");
    const [error, setError] = useState<string | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [faceDetected, setFaceDetected] = useState(false);

    // Load face-api.js models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
                console.log('Loading face recognition models...');

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);

                setModelsLoaded(true);
                console.log("✅ Models loaded");
            } catch (err) {
                console.error("Failed to load face models:", err);
                setError("Failed to load face recognition models. Please refresh.");
                setStep("ERROR");
            }
        };
        loadModels();
    }, []);

    // Start camera
    const startCamera = async () => {
        try {
            console.log("Attempting to start camera...");
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true // Simplified constraints for maximum compatibility
            });

            setStream(mediaStream);
            setStep("CAMERA");
            console.log("✅ Camera stream acquired");
        } catch (err: any) {
            console.error("Camera error:", err);
            setError("Camera access denied or device not found. Please check browser permissions.");
            setStep("ERROR");
        }
    };

    // Auto-start camera after models load
    useEffect(() => {
        if (modelsLoaded && step === "LOADING") {
            startCamera();
        }
    }, [modelsLoaded, step]);

    // Simple & Direct Video Linking
    useEffect(() => {
        const video = videoRef.current;
        if (video && stream && step === "CAMERA") {
            console.log("🔗 Connecting stream to video element...");

            // Set source
            video.srcObject = stream;

            // Critical playback handling
            video.onloadedmetadata = async () => {
                try {
                    await video.play();
                    console.log("✅ Video is now playing");
                } catch (e) {
                    console.error("Video play failed:", e);
                }
            };
        }
    }, [stream, step]);

    // Face detection loop with better error handling
    useEffect(() => {
        let detectionInterval: NodeJS.Timeout;

        if (step === "CAMERA" && stream && modelsLoaded) {
            console.log("🧠 Starting face detection loop...");
            detectionInterval = setInterval(async () => {
                const video = videoRef.current;

                // Strict check to prevent toNetInput error
                if (!video || !(video instanceof HTMLVideoElement) || video.readyState < 2 || video.paused) return;

                try {
                    const detection = await faceapi.detectSingleFace(
                        video,
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
                    );
                    setFaceDetected(!!detection);
                } catch (e) {
                    // Ignore transient errors in detection loop
                }
            }, 500);
        }

        return () => {
            if (detectionInterval) clearInterval(detectionInterval);
        };
    }, [step, stream, modelsLoaded]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [stream]);

    const captureMultipleFaces = async () => {
        const video = videoRef.current;
        if (!video || !(video instanceof HTMLVideoElement) || !canvasRef.current || !faceDetected) return;

        setStep("CAPTURING");
        const images: string[] = [];
        const descriptors: number[][] = [];

        try {
            for (let i = 0; i < 3; i++) {
                await new Promise(r => setTimeout(r, 600));
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
                if (!detection) throw new Error("Face detection interrupted. Please stay still and look directly at the camera while we secure your profile.");
                descriptors.push(Array.from(detection.descriptor));

                const canvas = canvasRef.current;
                canvas.width = 480; canvas.height = 480;
                const ctx = canvas.getContext("2d");
                const size = Math.min(video.videoWidth, video.videoHeight);
                const startX = (video.videoWidth - size) / 2;
                const startY = (video.videoHeight - size) / 2;
                ctx?.drawImage(video, startX, startY, size, size, 0, 0, 480, 480);
                images.push(canvas.toDataURL("image/jpeg", 0.6));
            }
            await registerFaceProfile(images, descriptors);
        } catch (err: any) {
            setError(err.message); setStep("ERROR");
        }
    };

    const registerFaceProfile = async (images: string[], descriptors: number[][]) => {
        setStep("PROCESSING");
        try {
            const response = await api.post("/ems/face-profile/register", {
                face_images: images,
                face_descriptors: descriptors,
            });
            if (response.data.success) {
                setStep("SUCCESS");
                setTimeout(() => onSuccess?.(), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
            setStep("ERROR");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="bg-gradient-to-br from-purple-600 to-pink-700 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Face ID Registration</h2>
                            <p className="text-purple-100 text-sm opacity-80">Setup biometric presence</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === "LOADING" && (
                            <div className="text-center py-12 space-y-6">
                                <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto" />
                                <p className="text-gray-500 font-medium">Initializing AI models...</p>
                            </div>
                        )}

                        {step === "CAMERA" && (
                            <div className="space-y-6">
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-950 border-4 border-gray-100 shadow-2xl">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />

                                    {/* Overlay Guide */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className={`w-64 h-64 border-4 rounded-full transition-all duration-500 ${faceDetected ? 'border-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'border-white/20 border-dashed'}`} />
                                    </div>

                                    {/* Manual Refresh Button - If Black Screen */}
                                    <button
                                        onClick={startCamera}
                                        className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors text-white flex items-center gap-2 text-xs font-bold"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Re-sync
                                    </button>

                                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                                        <div className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border ${faceDetected ? 'bg-green-500/90 text-white border-green-400' : 'bg-white/20 text-white border-white/20'}`}>
                                            {faceDetected ? '✓ Face Ready' : 'Scanning...'}
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={captureMultipleFaces} disabled={!faceDetected} className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3">
                                    <Zap className={`h-5 w-5 ${faceDetected ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                                    Capture Presence
                                </Button>
                            </div>
                        )}

                        {(step === "CAPTURING" || step === "PROCESSING") && (
                            <div className="text-center py-12 space-y-6">
                                <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto" />
                                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {step === "CAPTURING" ? "Securing Biometrics..." : "Finalizing Profile..."}
                                </h3>
                            </div>
                        )}

                        {step === "SUCCESS" && (
                            <div className="text-center py-12 space-y-6">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-bold">Registration Complete!</h3>
                                <p className="text-gray-500">Your Face ID is now active.</p>
                            </div>
                        )}

                        {step === "ERROR" && (
                            <div className="text-center py-8 space-y-6">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 text-sm font-medium">
                                    {error}
                                </div>
                                <Button onClick={() => { setError(null); setStep("LOADING"); }} className="w-full h-12 bg-gray-900 rounded-xl font-bold">
                                    <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
