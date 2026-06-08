'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, UserPlus, Loader2, Check } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Tutor {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
}

interface AssignTutorModalProps {
    courseId: number;
    courseName: string;
    currentTutor?: {
        id: number;
        name: string;
        email: string;
    } | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignTutorModal({
    courseId,
    courseName,
    currentTutor,
    onClose,
    onSuccess
}: AssignTutorModalProps) {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedTutorId, setSelectedTutorId] = useState<number | null>(
        currentTutor?.id || null
    );

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            setLoading(true);
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

    const handleAssignTutor = async () => {
        if (!selectedTutorId) {
            toast.error('Please select a tutor');
            return;
        }

        try {
            setAssigning(true);
            const response = await api.put(`/ems/courses/${courseId}/assign-tutor`, {
                tutorId: selectedTutorId
            });

            if (response.data.success) {
                toast.success('Tutor assigned successfully!');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error assigning tutor:', error);
            toast.error('Failed to assign tutor');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveTutor = async () => {
        try {
            setAssigning(true);
            const response = await api.delete(`/ems/courses/${courseId}/assign-tutor`);

            if (response.data.success) {
                toast.success('Tutor removed successfully!');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error removing tutor:', error);
            toast.error('Failed to remove tutor');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                Assign Tutor
                            </CardTitle>
                            <p className="text-purple-100 mt-1 font-medium">
                                {courseName}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-10 w-10 p-0 hover:bg-white/20 text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                            <span className="text-gray-600 font-medium">Loading tutors...</span>
                        </div>
                    ) : tutors.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="h-10 w-10 text-purple-600" />
                            </div>
                            <p className="text-gray-900 font-semibold text-lg mb-2">No tutors available</p>
                            <p className="text-gray-600">
                                Please add tutors first before assigning
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-1 flex-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded"></div>
                                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Select a Tutor
                                </p>
                                <div className="h-1 flex-1 bg-gradient-to-l from-purple-600 to-purple-400 rounded"></div>
                            </div>

                            {tutors.map((tutor) => (
                                <div
                                    key={tutor.id}
                                    onClick={() => setSelectedTutorId(tutor.id)}
                                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedTutorId === tutor.id
                                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg scale-[1.02]'
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${selectedTutorId === tutor.id
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                    }`}>
                                                    {(() => {
                                                        const first = tutor.firstName?.charAt(0) || tutor.name?.charAt(0) || 'T';
                                                        const last = tutor.lastName?.charAt(0) || tutor.name?.charAt(1) || 'U';
                                                        return `${first}${last}`;
                                                    })()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        {tutor.name}
                                                    </p>
                                                    {currentTutor?.id === tutor.id && (
                                                        <span className="inline-block text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-semibold">
                                                            Currently Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-15 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-medium">📧</span>
                                                    <span>{tutor.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-medium">🆔</span>
                                                    <span>Code: {tutor.employeeCode}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedTutorId === tutor.id && (
                                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                                                <Check className="h-5 w-5 text-white font-bold" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <div className="border-t bg-gray-50 p-5 flex gap-3 justify-end">
                    {currentTutor && (
                        <Button
                            variant="outline"
                            onClick={handleRemoveTutor}
                            disabled={assigning}
                            className="border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                        >
                            {assigning ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                'Remove Tutor'
                            )}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={assigning}
                        className="border-2 font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignTutor}
                        disabled={!selectedTutorId || assigning}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold shadow-lg"
                    >
                        {assigning ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Tutor
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
