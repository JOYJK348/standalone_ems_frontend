'use client';

import { useState, useEffect } from 'react';
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    FileText,
    Video,
    FileCode,
    Download,
    Search,
    Folder,
    Loader2,
    BookOpen,
    Eye,
    X,
    FileJson,
    Type,
    Link2,
    Image,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Material {
    id: number;
    material_name: string;
    material_description?: string;
    material_type: string;
    file_url: string;
    file_size_mb: number;
    delivery_method: 'FILE' | 'CONTENT';
    content_json?: any[];
    course: {
        id: number;
        course_name: string;
        course_code: string;
    };
    handbook_type?: 'STUDENT_HANDBOOK' | 'TUTOR_HANDBOOK' | 'GENERAL_RESOURCE';
    created_at: string;
}

export default function StudentMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'ALL' | 'HANDBOOK' | 'RESOURCE'>('ALL');
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ems/students/my-materials');
            if (response.data.success) {
                setMaterials(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            toast.error((error as any).response?.data?.message || 'Failed to load materials');
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = (materials || []).filter(m => {
        const matchesSearch = m.material_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.course?.course_name?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedTab === 'HANDBOOK') return m.handbook_type === 'STUDENT_HANDBOOK';
        if (selectedTab === 'RESOURCE') return m.handbook_type === 'GENERAL_RESOURCE' || !m.handbook_type;

        return true;
    });

    const getFileIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'VIDEO':
                return <Video className="w-6 h-6" />;
            case 'CODE':
                return <FileCode className="w-6 h-6" />;
            case 'CONTENT':
                return <Type className="w-6 h-6" />;
            default:
                return <FileText className="w-6 h-6" />;
        }
    };

    const getFileColor = (type: string) => {
        switch (type.toUpperCase()) {
            case 'VIDEO':
                return 'bg-purple-100 text-purple-600';
            case 'CODE':
                return 'bg-green-100 text-green-600';
            case 'CONTENT':
                return 'bg-indigo-100 text-indigo-600';
            default:
                return 'bg-blue-100 text-blue-600';
        }
    };

    // Group materials by course
    const materialsByCourse = filteredMaterials.reduce((acc, material) => {
        const courseId = material.course?.id;
        if (!courseId) return acc;
        if (!acc[courseId]) {
            acc[courseId] = {
                course: material.course,
                materials: []
            };
        }
        acc[courseId].materials.push(material);
        return acc;
    }, {} as Record<number, { course: Material['course']; materials: Material[] }>);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                        My Materials
                    </h1>
                    <p className="text-gray-600">
                        Access all your course contents, notes, and resources
                    </p>
                </motion.div>

                {/* Search & Tabs */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search by lesson title or course name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 bg-white border-0 shadow-sm focus-visible:ring-indigo-500 rounded-xl"
                        />
                    </div>
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 shrink-0">
                        {[
                            { id: 'ALL', label: 'All Resources' },
                            { id: 'HANDBOOK', label: 'Handbooks' },
                            { id: 'RESOURCE', label: 'Lesson Notes' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Materials by Course */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-600" />
                        <p className="text-gray-500 font-medium">Syncing your resources...</p>
                    </div>
                ) : Object.keys(materialsByCourse).length === 0 ? (
                    <Card className="border-0 shadow-lg p-12 text-center bg-white/80 backdrop-blur-sm">
                        <Folder className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Resources Found
                        </h3>
                        <p className="text-gray-600 max-w-sm mx-auto">
                            {searchQuery
                                ? 'We couldn\'t find anything matching your search. Try a more general term.'
                                : 'Your batch doesn\'t have any assigned materials yet. Check back soon!'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-10">
                        {Object.values(materialsByCourse).map(({ course, materials: courseMaterials }) => (
                            <div key={course.id}>
                                <div className="flex items-center justify-between mb-5 px-1">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mr-3">
                                            <BookOpen className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                                {course.course_name}
                                            </h2>
                                            <p className="text-xs font-bold text-gray-400 uppercase">
                                                {course.course_code}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white shadow-sm border border-gray-100 text-gray-600 text-[10px] rounded-full font-black uppercase tracking-widest">
                                        {courseMaterials.length} Resources
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courseMaterials.map((material, index) => (
                                        <motion.div
                                            key={material.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -4 }}
                                        >
                                            <Card className="border-0 shadow-sm hover:shadow-xl transition-all bg-white relative overflow-hidden group">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${getFileColor(
                                                                material.material_type
                                                            )}`}
                                                        >
                                                            {getFileIcon(material.material_type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-gray-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">
                                                                    {material.material_name}
                                                                </h3>
                                                            </div>
                                                            <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                                                                {material.material_description || "Supplementary course resource"}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                                                <span className="px-2 py-0.5 bg-gray-50 rounded italic">
                                                                    {material.material_type}
                                                                </span>
                                                                {material.delivery_method === 'FILE' && (
                                                                    <span>{material.file_size_mb || '0'} MB</span>
                                                                )}
                                                                <span>•</span>
                                                                <span>
                                                                    {new Date(material.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {material.delivery_method === 'CONTENT' ? (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setSelectedMaterial(material)}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 px-4"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Open
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => window.open(material.file_url, '_blank')}
                                                                    variant="outline"
                                                                    className="border-gray-100 hover:bg-gray-50 rounded-xl h-10 px-4"
                                                                >
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Get
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Simple LMS Lesson Player */}
            <AnimatePresence>
                {selectedMaterial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-[200] flex flex-col"
                    >
                        {/* Top Navigation Bar */}
                        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedMaterial(null)}
                                    className="rounded-xl hover:bg-gray-50 font-bold text-gray-600 gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Exit Lesson
                                </Button>
                                <div className="h-6 w-px bg-gray-100 mx-1" />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                                        {selectedMaterial.material_name}
                                    </h3>
                                    <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider">
                                        {selectedMaterial.course?.course_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedMaterial.delivery_method === 'FILE' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(selectedMaterial.file_url, '_blank')}
                                        className="rounded-xl font-bold gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Save Offline
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-indigo-100"
                                    onClick={() => setSelectedMaterial(null)}
                                >
                                    Finish Reading
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Sidebar Menu - Only for Multi-section Content */}
                            {selectedMaterial.delivery_method === 'CONTENT' && (selectedMaterial.content_json?.length ?? 0) > 1 && (
                                <div className="w-72 border-r border-gray-100 bg-gray-50/50 overflow-y-auto hidden md:block custom-scrollbar">
                                    <div className="p-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Lesson Contents</h4>
                                        <div className="space-y-1">
                                            {selectedMaterial.content_json?.map((section: any, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const el = document.getElementById(`section-${idx}`);
                                                        el?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="w-full text-left p-3 rounded-xl transition-all text-xs font-bold text-gray-600 hover:bg-white hover:shadow-sm flex gap-3 items-center group"
                                                >
                                                    <span className="w-6 h-6 rounded-lg bg-gray-200 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center shrink-0 text-[10px] transition-colors">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="truncate">{section.heading || `Part ${idx + 1}`}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scrollable Content Viewport */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-0 sm:p-6 lg:p-10">
                                <div className="bg-white min-h-full rounded-none sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {(() => {
                                        const url = selectedMaterial.file_url;
                                        const type = selectedMaterial.material_type?.toUpperCase();
                                        const fileName = selectedMaterial.material_name || 'Resource';
                                        const ext = url?.split('.').pop()?.toLowerCase() || '';

                                        const isLocal = url?.includes('localhost') || url?.includes('127.0.0.1');

                                        // Determine file type from both material_type and extension
                                        const isPDF = type === 'PDF' || ext === 'pdf' || (type === 'DOCUMENT' && ext === 'pdf');
                                        const isDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext) || (type === 'DOCUMENT' && ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext));
                                        const isVideo = type === 'VIDEO' || ['mp4', 'webm', 'ogg'].includes(ext);
                                        const isImage = type === 'IMAGE' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                                        const isContent = type === 'CONTENT' || selectedMaterial.delivery_method === 'CONTENT';

                                        if (isPDF && url) {
                                            return <iframe src={`${url}#toolbar=0`} className="w-full h-[85vh] border-0" />;
                                        }

                                        if (isImage && url) {
                                            return (
                                                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 min-h-[500px]">
                                                    <img src={url} alt={fileName} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border-4 border-white" />
                                                    <p className="mt-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">{fileName}</p>
                                                </div>
                                            );
                                        }

                                        if (isVideo && url) {
                                            return (
                                                <div className="bg-black aspect-video flex items-center justify-center">
                                                    <video controls src={url} className="w-full h-full" autoPlay />
                                                </div>
                                            );
                                        }

                                        if (isDoc && url) {
                                            if (isLocal) {
                                                return (
                                                    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
                                                        <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mb-8">
                                                            <FileCode className="h-12 w-12 text-amber-300" />
                                                        </div>
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Internal Development Link</h3>
                                                        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
                                                            Direct preview for Office documents (.{ext}) is disabled in local development.
                                                            Once deployed to production, this will open directly.
                                                        </p>
                                                        <Button
                                                            onClick={() => window.open(url, '_blank')}
                                                            className="bg-indigo-600 text-white rounded-2xl px-12 h-14 font-bold text-lg shadow-xl"
                                                        >
                                                            <Download className="h-5 w-5 mr-3" /> Download to View
                                                        </Button>
                                                    </div>
                                                );
                                            }
                                            const embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                                            return <iframe src={embedUrl} className="w-full h-[85vh] border-0" />;
                                        }

                                        if (isContent) {
                                            if (!selectedMaterial.content_json || selectedMaterial.content_json.length === 0) {
                                                return (
                                                    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
                                                        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8">
                                                            <FileText className="h-12 w-12 text-indigo-300" />
                                                        </div>
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Empty lesson</h3>
                                                        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
                                                            No sections found in this structured lesson.
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="p-8 sm:p-16 max-w-4xl mx-auto space-y-16">
                                                    {(selectedMaterial.content_json || [])
                                                        .filter((s: any) => s.is_active !== false) // Only show active sections
                                                        .map((section: any, idx: number) => {
                                                            const youtubeUrl = section.video_url ? (() => {
                                                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                                const match = section.video_url.match(regExp);
                                                                return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
                                                            })() : null;

                                                            return (
                                                                <div key={idx} id={`section-${idx}`} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                                    <div className="space-y-2">
                                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                                            {section.title || `Part ${idx + 1}`}
                                                                        </span>
                                                                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                                                                            {section.heading}
                                                                        </h2>
                                                                        <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
                                                                    </div>

                                                                    {youtubeUrl && (
                                                                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-xl">
                                                                            <iframe src={youtubeUrl} className="w-full h-full border-0" allowFullScreen title={section.heading} />
                                                                        </div>
                                                                    )}

                                                                    <div className="prose prose-indigo prose-lg max-w-none">
                                                                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[17px]">
                                                                            {section.body}
                                                                        </div>
                                                                    </div>

                                                                    {section.image_url && (
                                                                        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
                                                                            <img src={section.image_url} alt={section.heading} className="w-full h-auto object-cover" />
                                                                        </div>
                                                                    )}

                                                                    {section.external_link && (
                                                                        <a href={section.external_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100">
                                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                                                <Link2 className="h-5 w-5" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className="text-sm">Additional Resource Link</p>
                                                                                <p className="text-[10px] font-medium opacity-70">Click to open external reference material</p>
                                                                            </div>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
                                                <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-8">
                                                    <Search className="h-12 w-12 text-gray-300" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Preview Not Available</h3>
                                                <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium text-lg">
                                                    {ext ? `We can't generate a live preview for .${ext.toUpperCase()} files yet.` : "We can't generate a live preview for this asset."}
                                                </p>
                                                <Button
                                                    onClick={() => url && window.open(url, '_blank')}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-12 h-14 font-bold text-lg shadow-xl shadow-indigo-100"
                                                >
                                                    <Download className="h-5 w-5 mr-3" /> Download to View
                                                </Button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
