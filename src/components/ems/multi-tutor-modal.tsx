/**
 * Multi-Tutor Assignment Modal
 * Clean, professional design with white background
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Loader2, Check, Star, Mail, IdCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface Tutor {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    employeeCode: string;
}

interface AssignedTutor {
    id: number;
    tutorId: number;
    name: string;
    email: string;
    role: string;
    isPrimary: boolean;
}

interface MultiTutorModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    onSuccess: () => void;
}

export function MultiTutorModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    onSuccess
}: MultiTutorModalProps) {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [assignedTutors, setAssignedTutors] = useState<AssignedTutor[]>([]);
    const [selectedTutorIds, setSelectedTutorIds] = useState<number[]>([]);
    const [primaryTutorId, setPrimaryTutorId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTutors();
            fetchAssignedTutors();
        }
    }, [isOpen, courseId]);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/ems/tutors');
            if (response.data.success) {
                setTutors(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching tutors:', error);
            toast.error('Failed to load tutors');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedTutors = async () => {
        try {
            const response = await api.get(`/ems/courses/${courseId}/tutors`);
            if (response.data.success) {
                const assigned = response.data.data || [];
                setAssignedTutors(assigned);
                setSelectedTutorIds(assigned.map((t: AssignedTutor) => t.tutorId));
                const primary = assigned.find((t: AssignedTutor) => t.isPrimary);
                if (primary) setPrimaryTutorId(primary.tutorId);
            }
        } catch (error) {
            console.error('Error fetching assigned tutors:', error);
        }
    };

    const handleTutorToggle = (tutorId: number) => {
        setSelectedTutorIds(prev => {
            if (prev.includes(tutorId)) {
                if (primaryTutorId === tutorId) {
                    setPrimaryTutorId(null);
                }
                return prev.filter(id => id !== tutorId);
            } else {
                return [...prev, tutorId];
            }
        });
    };

    const handleSetPrimary = (tutorId: number) => {
        if (selectedTutorIds.includes(tutorId)) {
            setPrimaryTutorId(tutorId);
        }
    };

    const handleAssignTutors = async () => {
        if (selectedTutorIds.length === 0) {
            toast.error('Please select at least one tutor');
            return;
        }

        setAssigning(true);
        try {
            await api.post(`/ems/courses/${courseId}/tutors`, {
                tutorIds: selectedTutorIds,
                isPrimary: primaryTutorId !== null,
                role: 'INSTRUCTOR'
            });

            toast.success('Tutors assigned successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error assigning tutors:', error);
            toast.error(error.response?.data?.message || 'Failed to assign tutors');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveTutor = async (tutorId: number) => {
        try {
            await api.delete(`/ems/courses/${courseId}/tutors?tutorId=${tutorId}`);
            toast.success('Tutor removed successfully');
            fetchAssignedTutors();
            onSuccess();
        } catch (error: any) {
            console.error('Error removing tutor:', error);
            toast.error('Failed to remove tutor');
        }
    };

    const filteredTutors = tutors.filter(tutor =>
        tutor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-purple-600 text-white p-6 flex-shrink-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1">Assign Tutors</h2>
                                <p className="text-purple-100 text-sm font-medium">{courseName}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Currently Assigned */}
                        {assignedTutors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                                    Currently Assigned ({assignedTutors.length})
                                </h3>
                                <div className="space-y-2">
                                    {assignedTutors.map((tutor) => (
                                        <div
                                            key={tutor.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                                    {tutor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900 truncate">{tutor.name}</p>
                                                        {tutor.isPrimary && (
                                                            <Badge className="bg-amber-500 text-white border-0 text-xs">
                                                                <Star className="h-3 w-3 mr-1 fill-current" />
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">{tutor.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveTutor(tutor.tutorId)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                                <p className="text-gray-600 font-medium">Loading tutors...</p>
                            </div>
                        ) : tutors.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="h-10 w-10 text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-semibold text-lg mb-2">No tutors available</p>
                                <p className="text-gray-600">Please add tutors first before assigning</p>
                            </div>
                        ) : (
                            <>
                                {/* Search */}
                                <div className="mb-4">
                                    <Input
                                        placeholder="Search by name, email, or code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Selection Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                        Available Tutors
                                    </h3>
                                    <span className="text-sm font-semibold text-purple-600">
                                        {selectedTutorIds.length} selected
                                    </span>
                                </div>

                                {/* Tutor List */}
                                <div className="space-y-2">
                                    {filteredTutors.map((tutor) => {
                                        const isSelected = selectedTutorIds.includes(tutor.id);
                                        const isPrimary = primaryTutorId === tutor.id;

                                        return (
                                            <div
                                                key={tutor.id}
                                                onClick={() => handleTutorToggle(tutor.id)}
                                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleTutorToggle(tutor.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                                                        }`}>
                                                        {(() => {
                                                            const first = tutor.firstName?.charAt(0) || tutor.name?.charAt(0) || 'T';
                                                            const last = tutor.lastName?.charAt(0) || tutor.name?.charAt(1) || 'U';
                                                            return `${first}${last}`.toUpperCase();
                                                        })()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 mb-2">{tutor.name}</p>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                <span className="truncate">{tutor.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <IdCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                <span>Code: {tutor.employeeCode || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="flex flex-col gap-2 items-end">
                                                            <Button
                                                                size="sm"
                                                                variant={isPrimary ? "default" : "outline"}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSetPrimary(tutor.id);
                                                                }}
                                                                className={isPrimary ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                                                            >
                                                                <Star className={`h-3 w-3 mr-1 ${isPrimary ? 'fill-current' : ''}`} />
                                                                {isPrimary ? 'Primary' : 'Set Primary'}
                                                            </Button>
                                                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                                                                <Check className="h-4 w-4 text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={assigning}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignTutors}
                                disabled={selectedTutorIds.length === 0 || assigning}
                                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                            >
                                {assigning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Assign {selectedTutorIds.length} Tutor{selectedTutorIds.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
