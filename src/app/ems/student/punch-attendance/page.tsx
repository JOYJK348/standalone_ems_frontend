"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Camera,
    CheckCircle2,
    XCircle,
    Loader2,
    MapPin,
    Clock,
    AlertCircle,
    ChevronLeft,
    User,
    Shield
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import * as faceapi from 'face-api.js';

export default function PunchAttendancePage() {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        loadModels();
        fetchSessions();
        checkFaceProfile();
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            setModelsLoaded(true);
        } catch (error) {
            console.error('Failed to load face detection models:', error);
            toast.error('Face detection system unavailable');
        }
    };

    const checkFaceProfile = async () => {
        try {
            const response = await api.get('/ems/student/face-profile');
            setHasProfile(response.data.success && response.data.data?.is_active);
        } catch (error) {
            setHasProfile(false);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ems/attendance?mode=smart-list');
            if (response.data.success) {
                setSessions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        if (!hasProfile) {
            toast.error('Please register your face profile first!', {
                action: {
                    label: 'Register Now',
                    onClick: () => window.location.href = '/ems/student/profile/register-face'
                }
            });
            return;
        }

        if (!modelsLoaded) {
            toast.error('Face detection system is loading...');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setShowCamera(true);
                detectFace();
            }
        } catch (error) {
            console.error('Camera error:', error);
            toast.error('Unable to access camera');
        }
    };

    const detectFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            setFaceDetected(true);
            const canvas = canvasRef.current;
            const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
            faceapi.matchDimensions(canvas, displaySize);
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetection);
        } else {
            setFaceDetected(false);
        }

        if (showCamera) {
            setTimeout(detectFace, 100);
        }
    };

    const captureAttendance = async () => {
        if (!faceDetected) {
            toast.error('No face detected. Please position your face clearly.');
            return;
        }

        if (!location) {
            toast.error('Getting your location...');
            getCurrentLocation();
            return;
        }

        try {
            setCapturing(true);

            // Get face descriptor
            const detection = await faceapi
                .detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                toast.error('Face detection failed. Please try again.');
                return;
            }

            // Capture image
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current!.videoWidth;
            canvas.height = videoRef.current!.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current!, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Submit attendance
            const response = await api.post('/ems/attendance/verify', {
                sessionId: selectedSession.id,
                verificationType: selectedSession.recommended_action === 'PUNCH_OUT' ? 'CLOSING' : 'OPENING',
                faceImageUrl: imageData,
                faceEmbedding: Array.from(detection.descriptor),
                latitude: location.lat,
                longitude: location.lng,
                locationAccuracy: 10,
                deviceInfo: { userAgent: navigator.userAgent }
            });

            if (response.data.success) {
                toast.success('Attendance marked successfully! ✓');
                stopCamera();
                setSelectedSession(null);
                fetchSessions();
            } else {
                toast.error(response.data.message || 'Verification failed');
            }
        } catch (error: any) {
            console.error('Capture error:', error);
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setCapturing(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    toast.success('Location acquired');
                },
                (error) => {
                    console.error('Location error:', error);
                    toast.error('Unable to get location. Please enable GPS.');
                }
            );
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setFaceDetected(false);
    };

    useEffect(() => {
        if (showCamera) {
            getCurrentLocation();
        }
    }, [showCamera]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-white/80">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Punch Attendance
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Biometric Verification
                    </p>
                </motion.div>

                {!hasProfile && (
                    <Card className="mb-6 border-amber-200 bg-amber-50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-amber-900 mb-1">Face Profile Required</h3>
                                    <p className="text-sm text-amber-700 mb-3">
                                        You need to register your face profile before marking attendance.
                                    </p>
                                    <Link href="/ems/student/profile/register-face">
                                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                            <User className="h-4 w-4 mr-2" />
                                            Register Face Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!selectedSession ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Select Class Session</h2>
                        <p className="text-gray-600 mb-6">Choose your course to mark attendance</p>

                        {sessions.length === 0 ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h3>
                                    <p className="text-gray-600">There are no attendance sessions available right now.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {sessions.map((session: any) => (
                                    <Card
                                        key={session.id}
                                        className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                                        onClick={() => setSelectedSession(session)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {session.course?.course_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Batch: {session.batch?.batch_name}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {new Date(session.session_date).toLocaleDateString()}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${session.recommended_action === 'PUNCH_IN' ? 'bg-green-100 text-green-700' :
                                                                session.recommended_action === 'PUNCH_OUT' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {session.recommended_action.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors rotate-180" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ) : !showCamera ? (
                    <Card className="border-0 shadow-2xl overflow-hidden">
                        <div className={`bg-gradient-to-r p-6 text-white ${selectedSession.recommended_action === 'PUNCH_OUT' ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'
                            }`}>
                            <h2 className="text-2xl font-bold mb-2">
                                {selectedSession.recommended_action === 'PUNCH_OUT' ? 'Exit Attendance' : 'Entry Attendance'}
                            </h2>
                            <p className="text-blue-100">Confirm your biometric to {selectedSession.recommended_action === 'PUNCH_OUT' ? 'check-out' : 'check-in'}</p>
                        </div>
                        <CardContent className="p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedSession.course?.course_name}</h3>
                                <p className="text-gray-600">Batch: {selectedSession.batch?.batch_name}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={startCamera}
                                    disabled={!hasProfile || selectedSession.recommended_action === 'COMPLETED'}
                                    className={`flex-1 py-6 text-lg font-semibold text-white ${selectedSession.recommended_action === 'PUNCH_OUT' ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                                        }`}
                                >
                                    <Camera className="h-5 w-5 mr-2" />
                                    {selectedSession.recommended_action === 'PUNCH_OUT' ? 'Punch Out' : 'Punch In'}
                                </Button>
                                <Button
                                    onClick={() => setSelectedSession(null)}
                                    variant="outline"
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-2xl overflow-hidden">
                        <div className={`bg-gradient-to-r p-6 text-white ${selectedSession.recommended_action === 'PUNCH_OUT' ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'
                            }`}>
                            <h2 className="text-2xl font-bold mb-2">Face Verification</h2>
                            <p className="text-blue-100">Position your face in the frame for {selectedSession.recommended_action === 'PUNCH_OUT' ? 'Exit' : 'Entry'}</p>
                        </div>
                        <CardContent className="p-8">
                            <div className="relative mb-6 rounded-2xl overflow-hidden bg-black">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-auto"
                                    width="640"
                                    height="480"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full"
                                    width="640"
                                    height="480"
                                />

                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {faceDetected ? (
                                        <div className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Face Detected
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            No Face
                                        </div>
                                    )}
                                    {location && (
                                        <div className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Location OK
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={captureAttendance}
                                    disabled={!faceDetected || !location || capturing}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-semibold"
                                >
                                    {capturing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                            Submit Attendance
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
