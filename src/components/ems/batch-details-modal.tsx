'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    X,
    Users,
    GraduationCap,
    Calendar,
    Clock,
    Mail,
    Phone,
    Award,
    BookOpen,
    UserCircle,
    Info,
    Layout
} from 'lucide-react';
import api from '@/lib/api';

interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

interface Enrollment {
    id: number;
    enrollment_date: string;
    enrollment_status: string;
    students: Student;
}

interface Tutor {
    id: number;
    tutor_id: number;
    tutor_role: string;
    is_primary: boolean;
    name: string;
    email?: string;
    employee_code?: string;
}

interface BatchDetails {
    id: number;
    batch_code: string;
    batch_name: string;
    course_id: number;
    max_students: number;
    current_strength: number;
    start_date: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    status: string;
    schedule_details?: string;
    courses: {
        id: number;
        course_name: string;
        course_code: string;
        course_category: string;
        course_level: string;
    };
    student_enrollments: Enrollment[];
    tutors: Tutor[];
}

interface BatchDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: number | null;
}

export function BatchDetailsModal({ isOpen, onClose, batchId }: BatchDetailsModalProps) {
    const [batch, setBatch] = useState<BatchDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'tutors'>('overview');

    useEffect(() => {
        if (isOpen && batchId) {
            fetchBatchDetails();
            setActiveTab('overview');
        } else {
            setBatch(null);
        }
    }, [isOpen, batchId]);

    const fetchBatchDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/ems/batches/${batchId}?details=true`);
            if (response.data.success) {
                setBatch(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching batch details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col bg-slate-50 border-none">
                {/* Header Section */}
                <CardHeader className="border-b bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white p-6 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                        <GraduationCap size={120} />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none py-1">
                                    Batch Details
                                </Badge>
                                <Badge className="bg-purple-900/40 text-purple-100 border-none font-mono">
                                    {batch?.batch_code || '...'}
                                </Badge>
                            </div>
                            <CardTitle className="text-3xl font-black tracking-tight mt-1">
                                {batch?.batch_name || 'Loading...'}
                            </CardTitle>
                            <CardDescription className="text-purple-100 text-lg font-medium opacity-90 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {batch?.courses?.course_name || '...'}
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-12 w-12 rounded-full hover:bg-white/20 text-white transition-all hover:rotate-90"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
                            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold text-lg animate-pulse">Gathering batch information...</p>
                        </div>
                    ) : batch ? (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Custom Tabs Navigation */}
                            <div className="px-6 bg-white border-b shrink-0 shadow-sm flex gap-6 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`h-14 flex items-center gap-2 border-b-2 px-4 transition-all whitespace-nowrap font-bold ${activeTab === 'overview' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Layout className="h-4 w-4" />
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={`h-14 flex items-center gap-2 border-b-2 px-4 transition-all whitespace-nowrap font-bold ${activeTab === 'students' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Users className="h-4 w-4" />
                                    Students ({batch.student_enrollments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('tutors')}
                                    className={`h-14 flex items-center gap-2 border-b-2 px-4 transition-all whitespace-nowrap font-bold ${activeTab === 'tutors' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Award className="h-4 w-4" />
                                    Instructors ({batch.tutors?.length || 0})
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-purple-200">
                                {/* OVERVIEW CONTENT */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card className="bg-white border-slate-200 overflow-hidden group hover:border-purple-400 transition-colors shadow-sm">
                                                <CardContent className="p-5 flex items-center gap-4">
                                                    <div className="bg-blue-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                                        <Calendar className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                                                        <p className="text-base font-black text-slate-700">
                                                            {new Date(batch.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-white border-slate-200 overflow-hidden group hover:border-purple-400 transition-colors shadow-sm">
                                                <CardContent className="p-5 flex items-center gap-4">
                                                    <div className="bg-emerald-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                                        <Clock className="h-6 w-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule</p>
                                                        <p className="text-base font-black text-slate-700 truncate max-w-[150px]">
                                                            {batch.schedule_details || batch.start_time || 'Check calendar'}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-white border-slate-200 overflow-hidden group hover:border-purple-400 transition-colors shadow-sm">
                                                <CardContent className="p-5 flex items-center gap-4">
                                                    <div className="bg-purple-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                                        <Users className="h-6 w-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Strength</p>
                                                        <p className="text-base font-black text-slate-700">
                                                            {batch.student_enrollments.length} / {batch.max_students}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                    <Info className="h-5 w-5 text-purple-600" />
                                                    Course Context
                                                </h3>
                                                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                                                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                                        <span className="text-slate-500 font-medium">Category</span>
                                                        <Badge variant="outline" className="font-bold border-purple-200 text-purple-700">
                                                            {batch.courses.course_category}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                                        <span className="text-slate-500 font-medium">Level</span>
                                                        <Badge variant="outline" className="font-bold border-blue-200 text-blue-700">
                                                            {batch.courses.course_level}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-500 font-medium">Status</span>
                                                        <Badge className={
                                                            batch.status === 'ACTIVE' ? "bg-emerald-500" :
                                                                batch.status === 'PLANNED' ? "bg-amber-500" : "bg-slate-500"
                                                        }>
                                                            {batch.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                    <Award className="h-5 w-5 text-purple-600" />
                                                    Primary Instructor
                                                </h3>
                                                {batch.tutors.find(t => t.is_primary) ? (
                                                    <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-gradient-to-br from-white to-purple-50 flex items-center gap-4 shadow-sm ring-1 ring-purple-100">
                                                        <div className="h-14 w-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white">
                                                            {batch.tutors.find(t => t.is_primary)?.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-lg">
                                                                {batch.tutors.find(t => t.is_primary)?.name}
                                                            </p>
                                                            <p className="text-sm text-slate-500 font-medium">
                                                                {batch.tutors.find(t => t.is_primary)?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                                        <p className="text-slate-400 font-bold italic">No primary tutor assigned</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STUDENTS CONTENT */}
                                {activeTab === 'students' && (
                                    <div className="animate-in slide-in-from-right-4 duration-300">
                                        {batch.student_enrollments.length === 0 ? (
                                            <div className="text-center py-20">
                                                <Users size={64} className="mx-auto text-slate-200 mb-4" />
                                                <p className="text-xl font-bold text-slate-400 uppercase tracking-widest italic">No students enrolled yet</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                                {batch.student_enrollments.map((enr) => (
                                                    <div
                                                        key={enr.id}
                                                        className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-purple-300 transition-all group"
                                                    >
                                                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                            {enr.students.first_name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800 truncate">
                                                                    {enr.students.first_name} {enr.students.last_name}
                                                                </p>
                                                                <Badge variant="secondary" className="bg-slate-100 text-[10px] py-0 font-mono">
                                                                    {enr.students.student_code}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                                <Mail className="h-3 w-3" />
                                                                {enr.students.email}
                                                            </p>
                                                        </div>
                                                        <Badge className={
                                                            enr.enrollment_status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 border-none px-2 py-0 text-[10px]" : "bg-slate-100 text-slate-500 border-none px-2 py-0 text-[10px]"
                                                        }>
                                                            {enr.enrollment_status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TUTORS CONTENT */}
                                {activeTab === 'tutors' && (
                                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                                        {batch.tutors.length === 0 ? (
                                            <div className="text-center py-20">
                                                <Award size={64} className="mx-auto text-slate-200 mb-4" />
                                                <p className="text-xl font-bold text-slate-400 uppercase tracking-widest italic">No instructors assigned</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pb-4">
                                                {batch.tutors.map((tutor) => (
                                                    <div
                                                        key={tutor.id}
                                                        className={`bg-white p-5 rounded-2xl border-2 flex items-center gap-6 transition-all ${tutor.is_primary ? 'border-purple-600 shadow-purple-100 shadow-xl' : 'border-slate-100 shadow-sm'
                                                            }`}
                                                    >
                                                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-inner ${tutor.is_primary ? 'bg-purple-600 ring-4 ring-purple-100' : 'bg-slate-400'
                                                            }`}>
                                                            {tutor.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="text-xl font-black text-slate-800">{tutor.name}</h4>
                                                                <Badge className={tutor.is_primary ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}>
                                                                    {tutor.tutor_role || 'INSTRUCTOR'}
                                                                </Badge>
                                                                {tutor.is_primary && (
                                                                    <Badge className="bg-purple-100 text-purple-700 border-none font-black flex items-center gap-1">
                                                                        <Award className="h-3 w-3" />
                                                                        HEAD
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 mt-2">
                                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                                                    <Mail className="h-4 w-4 text-purple-400" />
                                                                    {tutor.email || 'N/A'}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                                                    <UserCircle className="h-4 w-4 text-purple-400" />
                                                                    {tutor.employee_code || '---'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {tutor.is_primary && (
                                                            <div className="hidden md:block">
                                                                <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
                                                                    <Award size={32} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                            <Info size={80} className="text-rose-200 mb-6" />
                            <h3 className="text-2xl font-black text-slate-800 mb-2">No Data Available</h3>
                            <p className="text-slate-500 font-medium">We couldn't retrieve the details for this batch.</p>
                            <Button variant="outline" className="mt-8 border-2" onClick={onClose}>Go Back</Button>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="border-t bg-white p-5 flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                        EMS Batch Profiler v2.0
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 sm:flex-none border-2 font-black tracking-tight rounded-xl px-8 py-6"
                        >
                            CLOSE PORTAL
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white font-black tracking-tight rounded-xl px-8 py-6 shadow-xl shadow-purple-100"
                        >
                            EDIT BATCH
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
