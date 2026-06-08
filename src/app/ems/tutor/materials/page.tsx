"use client";

import { useState, useEffect } from "react";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Video as VideoIcon,
    Image as ImageIcon,
    Eye,
    Download,
    Search,
    Clock,
    BookOpen,
    Users,
    GraduationCap,
    UserCog,
    Globe,
    ArrowLeft,
    CheckCircle2,
    X,
    LayoutList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Material {
    id: number;
    material_name: string;
    material_description: string;
    course_id?: number;
    file_url: string;
    material_type: string;
    delivery_method: string;
    handbook_type?: string;
    content_json?: any;
    file_size_mb: number;
    created_at: string;
    course?: {
        course_name: string;
        course_code: string;
    };
    batch_id?: number;
    batch?: {
        batch_name: string;
    };
}

export default function TutorMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [viewMode, setViewMode] = useState<'LIST' | 'PREVIEW'>('LIST');
    const [previewSectionIdx, setPreviewSectionIdx] = useState(0);

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        if (selectedMaterial) setPreviewSectionIdx(0);
    }, [selectedMaterial]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/materials");
            if (response.data.success) {
                // The API generally returns active materials visible to the user.
                // We trust the API to return materials relevant to the tutor's company/scope.
                // We'll process any additional batch mapping if needed, but for now strict display is key.
                setMaterials(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toUpperCase();
        if (type === 'PDF') return <FileText className="h-8 w-8 text-rose-500" />;
        if (type === 'VIDEO') return <VideoIcon className="h-8 w-8 text-indigo-500" />;
        if (type === 'IMAGE') return <ImageIcon className="h-8 w-8 text-sky-500" />;
        if (type === 'CONTENT') return <LayoutList className="h-8 w-8 text-emerald-500" />;
        if (['DOC', 'DOCX'].includes(type || '')) return <FileText className="h-8 w-8 text-blue-500" />;
        return <FileText className="h-8 w-8 text-slate-400" />;
    };

    const filteredMaterials = (materials || []).filter(material => {
        const matchesSearch = material.material_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.material_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.course?.course_code?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 pb-20">
            <TutorTopNavbar />

            {/* Sub-Header */}
            <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30 px-8 py-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="hidden sm:block">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Knowledge Base</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resource Library</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'PREVIEW' && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setViewMode('LIST');
                                setSelectedMaterial(null);
                            }}
                            className="rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Library
                        </Button>
                    )}
                </div>
            </div>

            <main className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full">

                {viewMode === 'LIST' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Search Bar */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-8">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <LayoutList className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight">My Materials</h2>
                            </div>

                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search library..."
                                    className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus:ring-indigo-500 text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* List View - Professional Table */}
                        <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Type</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Library...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredMaterials.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-32 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                                                            <FileText className="w-10 h-10 text-slate-200" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
                                                        <p className="text-sm text-slate-500 max-w-xs">No materials match your search criteria.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMaterials.map((material) => (
                                                <tr key={material.id} className="group hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${material.material_type === 'PDF' ? 'bg-rose-50 text-rose-600' :
                                                                material.material_type === 'VIDEO' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                                                                }`}>
                                                                {getFileIcon(material.material_type)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-sm font-black text-slate-900 leading-tight mb-1 truncate max-w-[200px] sm:max-w-[400px]">{material.material_name}</h4>
                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span className="truncate">Course: {material.course?.course_code || 'General'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col items-start gap-1.5">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${material.handbook_type === 'STUDENT_HANDBOOK' ? 'bg-blue-50 text-blue-700' :
                                                                material.handbook_type === 'TUTOR_HANDBOOK' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                                                                }`}>
                                                                {material.handbook_type === 'STUDENT_HANDBOOK' && <><GraduationCap size={14} /> Student Resource</>}
                                                                {material.handbook_type === 'TUTOR_HANDBOOK' && <><UserCog size={14} /> Tutor Guide</>}
                                                                {material.handbook_type === 'GENERAL_RESOURCE' && <><Globe size={14} /> Global</>}
                                                            </span>
                                                            <div className="flex flex-col gap-1 ml-1">
                                                                {material.course ? (
                                                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                                                        <BookOpen size={12} className="text-slate-400" />
                                                                        {material.course.course_code}
                                                                        {/* We display batch ID if we have it, simplified for tutor view */}
                                                                        {material.batch_id && (
                                                                            <>
                                                                                <span className="text-slate-300">•</span>
                                                                                <Users size={12} className="text-slate-400" />
                                                                                <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                                                                    {material.batch?.batch_name || `Batch #${material.batch_id}`}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-slate-400 italic pl-1">Global Organization</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 hidden md:table-cell">
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">
                                                            {material.delivery_method}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMaterial(material);
                                                                    setViewMode('PREVIEW');
                                                                }}
                                                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                                title="View Material"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {material.file_url && (
                                                                <button
                                                                    onClick={() => window.open(material.file_url, '_blank')}
                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-50"
                                                                    title="Download File"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {viewMode === 'PREVIEW' && selectedMaterial && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-[200] flex flex-col"
                    >
                        {/* Preview Top Bar */}
                        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl shrink-0 z-50">
                            <div className="flex items-center gap-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setViewMode('LIST');
                                        setSelectedMaterial(null);
                                    }}
                                    className="rounded-xl hover:bg-slate-50 font-bold text-slate-600 gap-2 pl-2"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <ArrowLeft className="h-4 w-4" />
                                    </div>
                                    <span className="hidden sm:inline">Back to Library</span>
                                </Button>
                                <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 truncate max-w-[200px] sm:max-w-xl leading-tight">
                                        {selectedMaterial.material_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <span>{selectedMaterial.course?.course_code || 'General Resource'}</span>
                                        {selectedMaterial.file_size_mb > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{selectedMaterial.file_size_mb} MB</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedMaterial.file_url && (
                                    <Button
                                        onClick={() => window.open(selectedMaterial.file_url, '_blank')}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-indigo-100 transition-all border-b-2 border-indigo-800 active:translate-y-px"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-10">
                            <div className="w-full max-w-6xl h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative group">
                                {(() => {
                                    // Structured Content Preview
                                    if (selectedMaterial.content_json && Array.isArray(selectedMaterial.content_json) && selectedMaterial.content_json.length > 0) {
                                        const section = selectedMaterial.content_json[previewSectionIdx] || selectedMaterial.content_json[0];

                                        const ytMatch = section.video_url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                                        const ytEmbed = (ytMatch && ytMatch[2].length === 11) ? `https://www.youtube.com/embed/${ytMatch[2]}` : null;

                                        return (
                                            <div className="flex w-full h-full bg-slate-50">
                                                {/* Sidebar for Sections */}
                                                {selectedMaterial.content_json.length > 1 && (
                                                    <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto hidden md:block flex-shrink-0">
                                                        <div className="p-4">
                                                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Module Content</h4>
                                                            <div className="space-y-1">
                                                                {selectedMaterial.content_json.map((s: any, i: number) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setPreviewSectionIdx(i)}
                                                                        className={`w-full text-left p-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${previewSectionIdx === i ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                                                    >
                                                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${previewSectionIdx === i ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                                                            {i + 1}
                                                                        </div>
                                                                        <span className="truncate">{s.heading || `Section ${i + 1}`}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Main Content Area */}
                                                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                                                    <div className="max-w-4xl mx-auto space-y-8">
                                                        <div>
                                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                                                                Section {previewSectionIdx + 1}
                                                            </span>
                                                            <h1 className="text-3xl font-black text-slate-900 leading-tight">{section.heading}</h1>
                                                        </div>

                                                        {ytEmbed && (
                                                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-xl">
                                                                <iframe src={ytEmbed} className="w-full h-full border-0" allowFullScreen />
                                                            </div>
                                                        )}

                                                        {section.image_url && (
                                                            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                                                                <img src={section.image_url} alt={section.heading} className="w-full h-auto" />
                                                            </div>
                                                        )}

                                                        {section.body && (
                                                            <div className="prose prose-indigo prose-lg max-w-none text-slate-700">
                                                                <p className="whitespace-pre-wrap">{section.body}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const url = selectedMaterial.file_url;
                                    const type = selectedMaterial.material_type?.toUpperCase();
                                    const ext = url?.split('.').pop()?.toLowerCase() || '';

                                    if (type === 'PDF' || ext === 'pdf') {
                                        return <iframe src={`${url}#toolbar=0`} className="w-full h-full border-0" title="PDF Preview" />;
                                    }

                                    if (type === 'VIDEO' || ['mp4', 'webm'].includes(ext)) {
                                        return (
                                            <div className="bg-black w-full h-full flex items-center justify-center">
                                                <video controls src={url} className="w-full h-full max-h-full" />
                                            </div>
                                        );
                                    }

                                    if (type === 'IMAGE' || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                                        return (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 p-10 overflow-auto">
                                                <img src={url} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-lg" />
                                            </div>
                                        );
                                    }

                                    // Default / No Preview
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center bg-slate-50/50">
                                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                                                <FileText className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Preview Unavailable</h3>
                                            <p className="text-slate-500 max-w-sm mb-8">This file type cannot be previewed directly in the browser. Please download it to view.</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(url, '_blank')}
                                                className="rounded-xl px-8 h-12 font-bold border-slate-200 bg-white"
                                            >
                                                Download File
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}

            </main>
            <TutorBottomNav />
        </div>
    );
}
