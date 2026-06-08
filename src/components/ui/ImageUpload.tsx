
"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    className?: string;
    bucket?: string;
}

export default function ImageUpload({ label, value, onChange, className = "", bucket = "branding" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon'];
        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error("File is too large. Max 5MB allowed.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const url = response.data.data.url;
                onChange(url);
                toast.success("Image uploaded successfully!");
            } else {
                toast.error("Upload failed: " + response.data.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-xs font-semibold text-slate-700 block">{label}</label>

            {value ? (
                <div className="relative group w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img src={value} alt="Uploaded" className="w-full h-full object-contain p-2" />
                    <button
                        onClick={handleRemove}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        title="Remove"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full max-w-[200px] h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0066FF] hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 text-[#0066FF] animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500">Click to Upload</span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp, image/svg+xml, image/x-icon"
                onChange={handleFileChange}
            />
        </div>
    );
}
