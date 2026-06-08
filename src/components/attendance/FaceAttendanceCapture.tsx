'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface FaceAttendanceProps {
    sessionId: number;
    studentId: number;
    verificationType: 'OPENING' | 'CLOSING';
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function FaceAttendanceCapture({
    sessionId,
    studentId,
    verificationType,
    onSuccess,
    onError
}: FaceAttendanceProps) {
    const [step, setStep] = useState<'idle' | 'capturing' | 'uploading' | 'success' | 'error'>('idle');
    const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Get location on mount
    useEffect(() => {
        getLocation();

        // Start countdown timer
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setErrorMessage('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                setErrorMessage(`Location error: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }

            setStep('capturing');
        } catch (error: any) {
            setErrorMessage(`Camera error: ${error.message}`);
            setStep('error');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (!blob) {
                setErrorMessage('Failed to capture image');
                return;
            }

            // Stop camera
            stopCamera();

            // Convert blob to base64 for preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
            };
            reader.readAsDataURL(blob);

            // Upload and verify
            await uploadAndVerify(blob);
        }, 'image/jpeg', 0.95);
    };

    const uploadAndVerify = async (imageBlob: Blob) => {
        setStep('uploading');

        try {
            // Upload image to storage (implement your storage solution)
            const imageUrl = await uploadImage(imageBlob);

            // Get device info
            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                timestamp: new Date().toISOString()
            };

            // Submit verification
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify_attendance',
                    sessionId,
                    studentId,
                    verificationType,
                    faceImageUrl: imageUrl,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    locationAccuracy: location?.accuracy,
                    deviceInfo
                })
            });

            const result = await response.json();

            if (result.success) {
                setStep('success');
                onSuccess?.();
            } else {
                setErrorMessage(result.message || 'Verification failed');
                setStep('error');
                onError?.(result.message);
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Upload failed');
            setStep('error');
            onError?.(error.message);
        }
    };

    const uploadImage = async (blob: Blob): Promise<string> => {
        // Implement your image upload logic here
        // This could be to Supabase Storage, AWS S3, etc.
        const formData = new FormData();
        formData.append('file', blob, `attendance_${sessionId}_${studentId}_${verificationType}.jpg`);

        const response = await fetch('/api/upload/attendance-photo', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        return data.url;
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const retake = () => {
        setCapturedImage(null);
        setStep('idle');
        setErrorMessage('');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {verificationType === 'OPENING' ? '📸 Opening' : '📸 Closing'} Attendance
                </h2>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className={`font-semibold ${timeRemaining < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                            {formatTime(timeRemaining)} remaining
                        </span>
                    </div>
                    {location && (
                        <div className="flex items-center gap-2 text-green-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">Location verified</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Location Status */}
            {!location && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <p className="font-semibold text-yellow-800">Location Required</p>
                        <p className="text-sm text-yellow-700">Please enable location services to mark attendance</p>
                    </div>
                </div>
            )}

            {/* Camera View */}
            {step === 'idle' && (
                <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Ready to capture your photo</p>
                            <button
                                onClick={startCamera}
                                disabled={!location}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Start Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'capturing' && (
                <div className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-white rounded-full opacity-50"></div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={stopCamera}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={capturePhoto}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Capture Photo
                        </button>
                    </div>
                </div>
            )}

            {step === 'uploading' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying attendance...</p>
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="aspect-video bg-green-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-green-800 mb-2">Attendance Verified!</p>
                        <p className="text-green-600">Your {verificationType.toLowerCase()} attendance has been recorded</p>
                        {capturedImage && (
                            <img src={capturedImage} alt="Captured" className="mt-4 w-48 h-48 object-cover rounded-lg mx-auto" />
                        )}
                    </div>
                </div>
            )}

            {step === 'error' && (
                <div className="aspect-video bg-red-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-red-800 mb-2">Verification Failed</p>
                        <p className="text-red-600 mb-4">{errorMessage}</p>
                        <button
                            onClick={retake}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure you are within the institution premises</li>
                    <li>• Position your face clearly within the frame</li>
                    <li>• Remove glasses or masks if possible</li>
                    <li>• Ensure good lighting for accurate verification</li>
                    <li>• Complete both opening and closing attendance for 100% credit</li>
                </ul>
            </div>
        </div>
    );
}
