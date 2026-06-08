"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import Link from "next/link";
import {
    Search,
    Folder,
    Plus,
    Download,
    Trash2,
    Upload,
    ArrowLeft,
    X,
    Eye,
    Pencil,
    Link2,
    Video as VideoIcon,
    Image as ImageIcon,
    ChevronDown,
    FileText,
    FileCode,
    CheckCircle2,
    BookOpen,
    MoreVertical,
    LayoutList,
    Settings2,
    Clock,
    FileUp,
    Briefcase,
    GraduationCap,
    UserCog,
    Globe,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";


interface Material {
    id: number;
    material_name: string;
    material_description: string;
    course_id?: number;
    file_url: string;
    material_type: string;
    delivery_method: string;
    content_json?: any;
    handbook_type?: string;
    file_size_mb: number;
    course?: {
        course_name: string;
        course_code: string;
    };
    is_active: boolean;
    batch_id?: number;
    batch?: {
        batch_name: string;
    };
}

interface Course {
    id: number;
    course_name: string;
    course_code: string;
}

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
    const [searchQuery, setSearchQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        material_title: "",
        material_description: "",
        course_id: "",
        batch_id: "",
        is_public: true,
    });
    const [resourceUrl, setResourceUrl] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [batches, setBatches] = useState<any[]>([]);

    // Content Builder State
    const [contentSections, setContentSections] = useState<any[]>([{ heading: "", body: "", video_url: "", image_url: "", is_active: true }]);

    // We default to Student Handbook for simplicity as requested
    const handbookType = 'STUDENT_HANDBOOK';
    const isPublic = true;

    const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
    const [previewSectionIdx, setPreviewSectionIdx] = useState(0);
    const [activeTab, setActiveTab] = useState<'ALL' | 'COURSE'>('ALL');
    const [batchMap, setBatchMap] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchMaterials();
        fetchCourses();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/materials");
            if (response.data.success) {
                const materialsData: Material[] = response.data.data || [];
                setMaterials(materialsData);

                // Fetch batch names for context
                const courseIds = Array.from(new Set(materialsData.filter(m => m.batch_id).map(m => m.course_id)));
                if (courseIds.length > 0) {
                    const newBatchMap: Record<number, string> = {};
                    await Promise.all(courseIds.map(async (cid) => {
                        if (!cid) return;
                        try {
                            const res = await api.get(`/ems/batches?course_id=${cid}`);
                            if (res.data.success) {
                                res.data.data.forEach((b: any) => {
                                    newBatchMap[b.id] = b.batch_name;
                                });
                            }
                        } catch (e) { /* silent fail */ }
                    }));
                    setBatchMap(prev => ({ ...prev, ...newBatchMap }));
                }
            }
        } catch (error) {
            console.error("Error fetching materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get("/ems/courses");
            if (response.data.success) {
                const fetchedCourses = response.data.data || [];
                setCourses(fetchedCourses);
            } else {
                toast.error("Failed to load courses");
            }
        } catch (error: any) {
            console.error("Error fetching courses:", error);
            toast.error("Connection error while fetching courses");
        }
    };

    const fetchBatches = async (courseId: string) => {
        try {
            const response = await api.get(`/ems/batches?course_id=${courseId}`);
            if (response.data.success) {
                setBatches(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
            setBatches([]);
        }
    };




    const handleEdit = (material: Material) => {
        setEditingMaterialId(material.id);
        setFormData({
            material_title: material.material_name,
            material_description: material.material_description,
            course_id: material.course_id?.toString() || "",
            batch_id: "",
            is_public: material.is_active,
        });

        // Load content sections if available, otherwise default to empty
        if (material.content_json && Array.isArray(material.content_json)) {
            setContentSections(material.content_json);
        } else if (material.file_url) {
            // If it was a single file/link, try to migrate it to a section (optional, but good UX)
            setContentSections([{ heading: "Resource", body: "Imported Link", video_url: material.file_url, image_url: "", is_active: true }]);
        } else {
            setContentSections([{ heading: "", body: "", video_url: "", image_url: "", is_active: true }]);
        }

        if (material.course_id) {
            fetchBatches(material.course_id.toString());
        }

        setViewMode('FORM');
    };

    const handleUploadMaterial = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contentSections.some(s => s.heading) && !editingMaterialId) {
            toast.error("Please add at least one section with a title");
            return;
        }

        try {
            setUploading(true);

            // Determine target audience based on handbook type
            const targetAudience = 'BOTH'; // Default to BOTH for maximum visibility as requested

            const body: any = {
                material_name: formData.material_title,
                material_description: "Structured Module", // Auto-fill
                handbook_type: handbookType,
                target_audience: targetAudience,
                is_active: isPublic,
                delivery_method: 'CONTENT', // FORCE CONTENT TYPE
                content_json: contentSections,
                file_size_mb: 0,
                material_type: 'CONTENT'
            };

            // We don't set file_url anymore for CONTENT type, or we could set a dummy one
            body.file_url = "";

            if (!formData.course_id) throw new Error("Please select a course");
            body.course_id = parseInt(formData.course_id);

            if (formData.batch_id) {
                body.batch_id = parseInt(formData.batch_id);
            }

            const response = editingMaterialId
                ? await api.put(`/ems/materials/${editingMaterialId}`, body)
                : await api.post("/ems/materials", body);

            if (response.data.success) {
                toast.success(editingMaterialId ? "Module updated" : "Module created");
                setViewMode('LIST');
                fetchMaterials();
                // Reset form
                setFormData({
                    material_title: "",
                    material_description: "",
                    course_id: "",
                    batch_id: "",
                    is_public: true,
                });
                setContentSections([{ heading: "", body: "", video_url: "", image_url: "", is_active: true }]);
                setSelectedMaterial(null);
                setBatches([]);
                setEditingMaterialId(null);
            }
        } catch (error: any) {
            console.error("Error saving material:", error);
            toast.error(error.message || error.response?.data?.message || "Operation failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            const response = await api.delete(`/ems/materials/${id}`);
            if (response.data.success) {
                toast.success("Material deleted");
                fetchMaterials();
            }
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    const filteredMaterials = (materials || []).filter(material => {
        const matchesSearch = material.material_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.material_description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'ALL' || (activeTab === 'COURSE' && material.course_id);

        return matchesSearch && matchesTab;
    });

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toUpperCase();
        if (type === 'PDF') return <FileText className="h-8 w-8 text-rose-500" />;
        if (type === 'VIDEO') return <VideoIcon className="h-8 w-8 text-indigo-500" />;
        if (type === 'IMAGE') return <ImageIcon className="h-8 w-8 text-sky-500" />;
        if (type === 'LINK') return <Link2 className="h-8 w-8 text-emerald-500" />;
        if (['DOC', 'DOCX'].includes(type || '')) return <FileText className="h-8 w-8 text-blue-500" />;
        return <Link2 className="h-8 w-8 text-slate-400" />;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 pb-20">
            <AcademicManagerLayout>

            {/* Sub-Header */}
            <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30 px-8 py-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="hidden sm:block">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                            <Briefcase className="w-3 h-3" />
                            <span>Curriculum Management</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Repository</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'LIST' ? (
                        <Button
                            onClick={() => {
                                setFormData({
                                    material_title: "",
                                    material_description: "",
                                    course_id: "",
                                    batch_id: "",
                                    is_public: true,
                                });
                                setContentSections([{ heading: "", body: "", video_url: "", image_url: "", is_active: true }]);
                                setViewMode('FORM');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11 font-bold shadow-lg shadow-indigo-100 border-b-2 border-indigo-800 transition-all active:translate-y-px"
                        >
                            <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
                            Create New Resource
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={() => setViewMode('LIST')}
                            className="rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to List
                        </Button>
                    )}
                </div>
            </div>

            <main className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full">

                {viewMode === 'LIST' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Materials Library</h2>
                                <p className="text-gray-600 mt-1">Manage your course resources</p>
                            </div>

                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search materials..."
                                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Card Grid View */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                                <p className="font-semibold">Loading materials...</p>
                            </div>
                        ) : filteredMaterials.length === 0 ? (
                            <Card className="border-0 shadow-lg p-12 text-center">
                                <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Materials Found</h3>
                                <p className="text-gray-600 mb-6">Your search didn't match any materials. Try a different query or add a new resource.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMaterials.map((material, idx) => (
                                    <motion.div
                                        key={material.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
                                            {/* Header with Gradient */}
                                            <div className={`relative h-32 overflow-hidden ${material.material_type === 'PDF' ? 'bg-gradient-to-br from-rose-400 to-rose-600' :
                                                    material.material_type === 'VIDEO' ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' :
                                                        material.material_type === 'CONTENT' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                                                            'bg-gradient-to-br from-purple-400 to-purple-600'
                                                }`}>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3">
                                                    {material.is_active ? (
                                                        <div className="bg-green-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Active
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                                                            <X className="h-3 w-3" />
                                                            Hidden
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Icon */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform group-hover:scale-110 transition-transform">
                                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                                        {material.material_type === 'PDF' && <FileText className="h-8 w-8 text-white" />}
                                                        {material.material_type === 'VIDEO' && <VideoIcon className="h-8 w-8 text-white" />}
                                                        {material.material_type === 'CONTENT' && <BookOpen className="h-8 w-8 text-white" />}
                                                        {!['PDF', 'VIDEO', 'CONTENT'].includes(material.material_type) && <Folder className="h-8 w-8 text-white" />}
                                                    </div>
                                                </div>

                                                {/* Title Overlay */}
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <h3 className="text-white font-bold text-base line-clamp-1">{material.material_name}</h3>
                                                    <p className="text-white/80 text-xs">{material.course?.course_code || 'General'}</p>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                {/* Target Audience Badge */}
                                                <div className="mb-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${material.handbook_type === 'STUDENT_HANDBOOK' ? 'bg-blue-50 text-blue-700' :
                                                            material.handbook_type === 'TUTOR_HANDBOOK' ? 'bg-amber-50 text-amber-700' :
                                                                'bg-green-50 text-green-700'
                                                        }`}>
                                                        {material.handbook_type === 'STUDENT_HANDBOOK' && <><GraduationCap size={12} /> Students</>}
                                                        {material.handbook_type === 'TUTOR_HANDBOOK' && <><UserCog size={12} /> Tutors</>}
                                                        {material.handbook_type === 'GENERAL_RESOURCE' && <><Globe size={12} /> Everyone</>}
                                                    </span>
                                                </div>

                                                {/* Course & Batch Info */}
                                                <div className="mb-4 flex-1">
                                                    {material.course && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="font-semibold">{material.course.course_name}</span>
                                                        </div>
                                                    )}
                                                    {material.batch_id && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Users className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                                                                {batchMap[material.batch_id] || material.batch?.batch_name || `Batch #${material.batch_id}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {!material.course && (
                                                        <p className="text-xs text-gray-400 italic">Global Resource</p>
                                                    )}
                                                </div>

                                                {/* Type Badge */}
                                                <div className="mb-4">
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                        {material.delivery_method}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="grid grid-cols-3 gap-2 mt-auto">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMaterial(material);
                                                            setPreviewSectionIdx(0);
                                                            setViewMode('PREVIEW');
                                                        }}
                                                        className="h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-all font-semibold text-xs"
                                                        title="Preview"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(material)}
                                                        className="h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all font-semibold text-xs"
                                                        title="Edit"
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(material.id)}
                                                        className="h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-semibold text-xs"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {viewMode === 'FORM' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="ghost"
                                className="rounded-xl hover:bg-slate-100 text-slate-500 font-bold"
                                onClick={() => {
                                    setViewMode('LIST');
                                    setEditingMaterialId(null);
                                }}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                            </Button>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingMaterialId ? 'Edit Resource' : 'Deploy New Asset'}
                            </h2>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 sm:p-12 shadow-xl shadow-slate-100/50">
                            <form onSubmit={handleUploadMaterial} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="material_title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Resource Title</Label>
                                        <Input
                                            id="material_title"
                                            required
                                            className="h-12 border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold"
                                            placeholder="e.g. Advanced Calculus Module 1"
                                            value={formData.material_title}
                                            onChange={(e) => setFormData({ ...formData, material_title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Associated Course & Batch</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                id="course_id"
                                                required
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold bg-white"
                                                value={formData.course_id}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, course_id: e.target.value, batch_id: "" });
                                                    fetchBatches(e.target.value);
                                                }}
                                            >
                                                <option value="">Select Course...</option>
                                                {courses.map((course) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.course_name}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                id="batch_id"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold bg-white disabled:bg-slate-50 disabled:text-slate-400"
                                                value={formData.batch_id}
                                                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                                disabled={!formData.course_id}
                                            >
                                                <option value="">All Batches</option>
                                                {batches.map((batch) => (
                                                    <option key={batch.id} value={batch.id}>
                                                        {batch.batch_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Module Content (Sections)</Label>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => setContentSections([...contentSections, { heading: "", body: "", video_url: "", image_url: "", is_active: true }])}
                                            className="rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-2" /> Add Section
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {contentSections.map((section, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 relative group transition-all hover:bg-slate-50 hover:shadow-md">
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-slate-200 rounded-lg text-[10px] font-bold text-slate-500">{idx + 1}</span>
                                                    {contentSections.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newSections = [...contentSections];
                                                                newSections.splice(idx, 1);
                                                                setContentSections(newSections);
                                                            }}
                                                            className="w-6 h-6 rounded-lg bg-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid gap-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Section Title (e.g. 1.{idx + 1} Intro)</Label>
                                                        <Input
                                                            value={section.heading}
                                                            onChange={(e) => {
                                                                const newSections = [...contentSections];
                                                                newSections[idx].heading = e.target.value;
                                                                setContentSections(newSections);
                                                            }}
                                                            placeholder={`e.g. Unit ${idx + 1}`}
                                                            className="bg-white border-slate-200 font-bold"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Description / Notes</Label>
                                                        <Textarea
                                                            value={section.body}
                                                            onChange={(e) => {
                                                                const newSections = [...contentSections];
                                                                newSections[idx].body = e.target.value;
                                                                setContentSections(newSections);
                                                            }}
                                                            placeholder="Add any text content here..."
                                                            className="bg-white border-slate-200 min-h-[80px]"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">YouTube Video URL</Label>
                                                            <div className="relative">
                                                                <VideoIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                                <Input
                                                                    value={section.video_url || ""}
                                                                    onChange={(e) => {
                                                                        const newSections = [...contentSections];
                                                                        newSections[idx].video_url = e.target.value;
                                                                        setContentSections(newSections);
                                                                    }}
                                                                    placeholder="https://youtube.com/..."
                                                                    className="pl-10 bg-white border-slate-200 text-xs font-medium"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Image URL</Label>
                                                            <div className="relative">
                                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                                <Input
                                                                    value={section.image_url || ""}
                                                                    onChange={(e) => {
                                                                        const newSections = [...contentSections];
                                                                        newSections[idx].image_url = e.target.value;
                                                                        setContentSections(newSections);
                                                                    }}
                                                                    placeholder="https://..."
                                                                    className="pl-10 bg-white border-slate-200 text-xs font-medium"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 flex-1 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                                        onClick={() => setViewMode('LIST')}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-14 flex-1 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Processing...' : (editingMaterialId ? 'Save Changes' : 'Deploy Resource')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {viewMode === 'PREVIEW' && selectedMaterial && (
                    <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[85vh] bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-200/50">
                        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => setViewMode('LIST')} className="font-bold text-slate-500 hover:bg-slate-50 rounded-xl">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <div className="w-px h-6 bg-slate-100" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 truncate max-w-sm">{selectedMaterial.material_name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedMaterial.material_type} • {selectedMaterial.course?.course_name || 'General'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedMaterial.file_url && (
                                    <Button size="sm" variant="outline" onClick={() => window.open(selectedMaterial.file_url, '_blank')} className="rounded-xl font-bold border-slate-200">
                                        <Download className="w-4 h-4 mr-2" /> Download
                                    </Button>
                                )}
                                <Button size="sm" onClick={() => handleEdit(selectedMaterial)} className="bg-slate-900 text-white rounded-xl font-bold">
                                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden bg-slate-50/50 relative justify-center items-center p-4">
                            {(() => {
                                // Structured Content Preview
                                if (selectedMaterial.content_json && Array.isArray(selectedMaterial.content_json) && selectedMaterial.content_json.length > 0) {
                                    const section = selectedMaterial.content_json[previewSectionIdx] || selectedMaterial.content_json[0];

                                    const ytMatch = section.video_url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                                    const ytEmbed = (ytMatch && ytMatch[2].length === 11) ? `https://www.youtube.com/embed/${ytMatch[2]}` : null;

                                    return (
                                        <div className="flex bg-slate-50 w-full h-full">
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
                                            <div className="flex-1 overflow-y-auto p-4 md:p-8">
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

                                // Fallback for legacy simple links (if any remain)
                                const url = selectedMaterial.file_url;
                                if (!url) return <div className="p-10 text-center text-slate-400">No content available</div>;

                                // ... (Same simple preview logic as backup)
                                const type = selectedMaterial.material_type?.toUpperCase();
                                if (type === 'VIDEO' || url.includes('youtube') || url.includes('youtu.be')) {
                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                    const match = url.match(regExp);
                                    const embedUrl = (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
                                    return <iframe src={embedUrl} className="w-full h-full max-w-5xl aspect-video rounded-2xl shadow-xl" allowFullScreen />;
                                }
                                if (type === 'IMAGE') {
                                    return <img src={url} className="max-w-full max-h-full rounded-2xl shadow-lg" alt="Preview" />;
                                }
                                if (type === 'PDF' || url.toLowerCase().endsWith('.pdf')) {
                                    return <iframe src={`${url}#toolbar=0`} className="w-full h-full border-0 rounded-2xl shadow-sm" />;
                                }
                                return (
                                    <div className="text-center p-10">
                                        <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p>External Link: <a href={url} target="_blank" className="text-indigo-600 font-bold underline">Open Resource</a></p>
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                )}

            </main>

            </AcademicManagerLayout>
        </div>
    );
}

