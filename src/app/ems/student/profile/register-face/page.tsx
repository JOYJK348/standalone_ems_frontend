"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Camera,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    User,
    Shield,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useEffect } from "react";

// Remove static import to fix build error: TypeError: this.util.TextEncoder is not a constructor
// We will load faceapi lazily inside the component
let faceapi: any = null;

export default function RegisterFacePage() {
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // 1. Load Face Models on Mount
    useEffect(() => {
        const loadModels = async () => {
            try {
                setLoading(true);

                // Dynamically load face-api only on the client side
                if (!faceapi) {
                    faceapi = await import("@vladmandic/face-api");
                }

                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                setLoading(false);
                toast.success("AI Security Models Loaded ✓");
            } catch (error) {
                console.error("Model loading error:", error);
                toast.error("Failed to load AI models. Contact Admin.");
                setLoading(false);
            }
        };
        loadModels();
    }, []);

    // 2. Real-time Face Detection Loop
    useEffect(() => {
        let detectionInterval: any;

        const startDetection = async () => {
            if (videoRef.current && cameraReady && modelsLoaded) {
                detectionInterval = setInterval(async () => {
                    const detections = await faceapi.detectSingleFace(
                        videoRef.current!,
                        new faceapi.TinyFaceDetectorOptions()
                    );
                    setFaceDetected(!!detections);
                }, 500);
            }
        };

        if (showCamera) startDetection();
        return () => clearInterval(detectionInterval);
    }, [showCamera, cameraReady, modelsLoaded]);

    const checkExistingProfile = async () => {
        try {
            const response = await api.get('/ems/student/face-profile');
            if (response.data.success && response.data.data?.is_active) {
                setHasExistingProfile(true);
            }
        } catch (error) {
            setHasExistingProfile(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setShowCamera(true);

                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true);
                };
            }
        } catch (error) {
            console.error('Camera error:', error);
            toast.error('Unable to access camera.');
        }
    };

    const captureFace = async () => {
        if (!videoRef.current || !cameraReady || !faceDetected) {
            toast.error('Position your face clearly in the frame');
            return;
        }

        try {
            setCapturing(true);

            // 3. Extract Full Biometric Descriptor (The "Signature")
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                toast.error("Face Mismatched or not detected clearly. Try again.");
                return;
            }

            // Convert Float32Array to regular array for JSON storage
            const faceEmbedding = Array.from(detection.descriptor);

            // Capture raw image for display/admin
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Submit face profile with Biometric Embedding
            const response = await api.post('/ems/student/face-profile/register', {
                faceImageUrl: imageData,
                faceEmbedding: faceEmbedding, // This is the mathematical key
                qualityScore: 98
            });

            if (response.data.success) {
                toast.success('Biometric Identity Registered! ✓');
                stopCamera();
                setTimeout(() => {
                    window.location.href = '/ems/student/punch-attendance';
                }, 1500);
            }
        } catch (error: any) {
            console.error('Capture error:', error);
            toast.error('Registration failed. Please try again.');
        } finally {
            setCapturing(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setCameraReady(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/profile">
                        <Button variant="ghost" size="sm" className="hover:bg-white/80">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Profile
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Register Face Profile
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Secure biometric authentication for attendance
                    </p>
                </motion.div>

                {hasExistingProfile && (
                    <Card className="mb-6 border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Profile Already Exists</h3>
                                    <p className="text-sm text-blue-700">
                                        You already have a registered face profile. Re-registering will replace your existing profile.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <Card className="border-0 shadow-2xl overflow-hidden p-12 text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                        <h2 className="text-xl font-bold">Initializing AI Security...</h2>
                        <p className="text-gray-500">Loading biometric recognition models</p>
                    </Card>
                ) : !showCamera ? (
                    <Card className="border-0 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
                            <User className="h-16 w-16 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Face Registration</h2>
                            <p className="text-purple-100">
                                Your face will be used for secure attendance verification
                            </p>
                        </div>
                        <CardContent className="p-8">
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Good Lighting</h3>
                                        <p className="text-sm text-gray-600">Ensure you're in a well-lit area</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Face the Camera</h3>
                                        <p className="text-sm text-gray-600">Look directly at the camera</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Remove Obstructions</h3>
                                        <p className="text-sm text-gray-600">No sunglasses, masks, or hats</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    checkExistingProfile();
                                    startCamera();
                                }}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold"
                            >
                                <Camera className="h-5 w-5 mr-2" />
                                Start Camera
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">Capture Your Face</h2>
                            <p className="text-purple-100">Position your face in the center of the frame</p>
                        </div>
                        <CardContent className="p-8">
                            <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute top-4 right-4">
                                    {faceDetected ? (
                                        <div className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Face Detected
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 rounded-full bg-yellow-500 text-white text-sm font-semibold flex items-center gap-2 animate-pulse">
                                            <AlertCircle className="h-4 w-4" />
                                            Position Face
                                        </div>
                                    )}
                                </div>

                                {faceDetected && (
                                    <div className="absolute inset-0 border-4 border-dashed border-green-500/50 rounded-2xl animate-pulse pointer-events-none" />
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={captureFace}
                                    disabled={!faceDetected || capturing}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-semibold"
                                >
                                    {capturing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                            Register Identity
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={stopCamera}
                                    variant="outline"
                                    className="px-6"
                                    disabled={capturing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
