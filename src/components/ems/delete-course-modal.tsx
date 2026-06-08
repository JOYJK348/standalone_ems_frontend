"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface DeleteCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    onSuccess: () => void;
}

export function DeleteCourseModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    onSuccess,
}: DeleteCourseModalProps) {
    const [deleteReason, setDeleteReason] = useState('');
    const [deleting, setDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (!deleteReason.trim()) {
            toast.error('Please provide a reason for deletion');
            return;
        }

        if (deleteReason.trim().length < 10) {
            toast.error('Reason must be at least 10 characters');
            return;
        }

        setDeleting(true);
        try {
            const response = await api.delete(`/ems/courses/${courseId}`, {
                data: { deleteReason: deleteReason.trim() }
            });

            if (response.data.success) {
                toast.success('Course deleted successfully');
                setDeleteReason('');
                onClose();
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error deleting course:', error);
            toast.error(error.response?.data?.message || 'Failed to delete course');
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        if (!deleting) {
            setDeleteReason('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Delete Course</h2>
                                <p className="text-red-100 text-sm mt-1">This action requires a reason</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={deleting}
                            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Warning Message */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-red-900 mb-1">Are you sure?</h3>
                                <p className="text-sm text-red-800 mb-2">
                                    You are about to delete the course:
                                </p>
                                <p className="font-bold text-red-900 text-lg bg-white px-3 py-2 rounded border border-red-300">
                                    "{courseName}"
                                </p>
                                <p className="text-sm text-red-700 mt-2">
                                    This will be a <strong>soft delete</strong>. The course will be marked as deleted but data will be preserved.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-3">
                        <Label htmlFor="deleteReason" className="text-base font-bold text-gray-900">
                            Reason for Deletion <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                            id="deleteReason"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Please provide a detailed reason for deleting this course (minimum 10 characters)..."
                            className="min-h-[120px] border-2 focus:border-red-500 resize-none"
                            disabled={deleting}
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                {deleteReason.length}/500 characters
                            </span>
                            {deleteReason.length > 0 && deleteReason.length < 10 && (
                                <span className="text-red-600 font-medium">
                                    Minimum 10 characters required
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={deleting}
                            className="flex-1 border-2 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting || !deleteReason.trim() || deleteReason.trim().length < 10}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg disabled:opacity-50"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Course
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
