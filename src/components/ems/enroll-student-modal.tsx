'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

interface EnrollStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    enrolledStudentIds: number[];
    onSuccess: () => void;
}

export function EnrollStudentModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    enrolledStudentIds,
    onSuccess
}: EnrollStudentModalProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            setSelectedStudentIds([]);
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/ems/students');
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStudent = (studentId: number) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleEnroll = async () => {
        if (selectedStudentIds.length === 0) return;

        setEnrolling(true);
        try {
            // Use parallel processing with individual error handling (like Promise.allSettled)
            const results = await Promise.all(selectedStudentIds.map(async (studentId) => {
                try {
                    await api.post('/ems/enrollments', {
                        student_id: studentId,
                        course_id: courseId,
                        enrollment_date: new Date().toISOString(),
                        enrollment_status: 'ACTIVE',
                        payment_status: 'COMPLETED' // Assuming manual enrollment = Paid/Free
                    });
                    return { status: 'fulfilled', studentId };
                } catch (error) {
                    return { status: 'rejected', studentId, error };
                }
            }));

            const successful = results.filter(r => r.status === 'fulfilled');
            const failed = results.filter(r => r.status === 'rejected');

            if (successful.length > 0) {
                toast.success(`Successfully enrolled ${successful.length} students!`);
                onSuccess(); // Refresh the list
            }

            if (failed.length > 0) {
                console.error('Some enrollments failed:', failed);
                const isDuplicate = failed.some((f: any) => f.error?.response?.data?.message?.includes('already enrolled'));

                if (isDuplicate) {
                    toast.warning(`${failed.length} students were skipped (already enrolled).`);
                } else {
                    toast.error(`Failed to enroll ${failed.length} students. Please check errors.`);
                }
            }

            onClose();
        } catch (error: any) {
            console.error('Unexpected error during batch enrollment:', error);
            toast.error('An unexpected error occurred.');
        } finally {
            setEnrolling(false);
        }
    };

    // Filter students: 
    // 1. Not already enrolled
    // 2. Matches search term
    const availableStudents = students.filter(s => !enrolledStudentIds.includes(s.id));
    const filteredStudents = availableStudents.filter(s =>
    (s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <Card className="w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col bg-white">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                <UserPlus className="h-6 w-6" />
                                Enroll Students
                            </CardTitle>
                            <p className="text-emerald-50/90 mt-1 font-medium text-sm">
                                {courseName}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-10 w-10 p-0 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="p-4 border-b bg-slate-50 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, code or email..."
                            className="pl-10 h-10 border-slate-200 focus-visible:ring-emerald-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 content-start">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
                            <span className="text-slate-500 font-medium">Loading student directory...</span>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No students found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                {searchTerm ? "Try adjusting your search terms" : "All active students are already enrolled in this course"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between px-1 mb-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Available Students ({filteredStudents.length})
                                </p>
                                {selectedStudentIds.length > 0 && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-3">
                                        {selectedStudentIds.length} Selected
                                    </Badge>
                                )}
                            </div>

                            {filteredStudents.map((student) => {
                                const isSelected = selectedStudentIds.includes(student.id);
                                return (
                                    <div
                                        key={student.id}
                                        onClick={() => handleToggleStudent(student.id)}
                                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50/30'
                                            : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleToggleStudent(student.id)}
                                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                        />

                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                            }`}>
                                            {student.first_name.charAt(0)}{student.last_name?.charAt(0)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`font-bold truncate ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                    {student.first_name} {student.last_name}
                                                </h4>
                                                <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                                                    {student.student_code}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                                        </div>

                                        {isSelected && (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 animate-in zoom-in spin-in-12 duration-300" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t bg-slate-50 p-5 flex gap-3 justify-end shrink-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={enrolling}
                        className="rounded-xl px-6 font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEnroll}
                        disabled={selectedStudentIds.length === 0 || enrolling}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                        {enrolling ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enrolling...
                            </>
                        ) : (
                            <>
                                Enroll {selectedStudentIds.length} Student{selectedStudentIds.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
