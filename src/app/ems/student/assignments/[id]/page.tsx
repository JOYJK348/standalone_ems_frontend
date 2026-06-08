'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText, Clock, User, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Assignment {
    id: number;
    assignment_title: string;
    assignment_description: string;
    deadline: string;
    max_marks: number;
    course?: {
        course_name: string;
        course_code: string;
    };
    tutor?: {
        first_name: string;
        last_name: string;
    };
    submission?: {
        submission_text: string;
        submitted_at: string;
        marks_obtained: number | null;
        feedback: string | null;
    };
}

export default function AssignmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const assignmentId = params?.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submissionText, setSubmissionText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (assignmentId) {
            fetchAssignment();
        }
    }, [assignmentId]);

    const fetchAssignment = async () => {
        try {
            const response = await api.get(`/ems/students/assignments/${assignmentId}`);
            if (response.data.success) {
                setAssignment(response.data.data);
                if (response.data.data.submission) {
                    setSubmissionText(response.data.data.submission.submission_text || '');
                }
            }
        } catch (error) {
            console.error('Failed to fetch assignment:', error);
            toast.error('Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Check file size (5MB = 5 * 1024 * 1024 bytes)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                e.target.value = ''; // Reset input
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!submissionText.trim() && !file) {
            toast.error('Please provide submission text or upload a file');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('submission_text', submissionText);
            if (file) {
                formData.append('file', file);
            }

            const response = await api.post(`/ems/students/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success('Assignment submitted successfully!');
                fetchAssignment();
            } else {
                toast.error(response.data.message || 'Failed to submit assignment');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = () => {
        return assignment && new Date(assignment.deadline) < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading assignment...</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment not found</h3>
                            <Button onClick={() => router.back()} className="mt-4">
                                Go Back
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <BottomNav />
            </div>
        );
    }

    const isSubmitted = !!assignment.submission;
    const isGraded = assignment.submission?.marks_obtained !== null;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/ems/student/assignments')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assignments
                </Button>

                {/* Assignment Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl mb-2">{assignment.assignment_title}</CardTitle>
                                <p className="text-gray-600">{assignment.course?.course_name}</p>
                            </div>
                            {isSubmitted && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                    Submitted
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-700">{assignment.assignment_description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Deadline</p>
                                    <p className={`font-semibold ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                                        {formatDate(assignment.deadline)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Max Marks</p>
                                    <p className="font-semibold text-gray-900">{assignment.max_marks}</p>
                                </div>
                            </div>

                            {assignment.tutor && (
                                <div className="flex items-center space-x-2">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Assigned By</p>
                                        <p className="font-semibold text-gray-900">
                                            {assignment.tutor.first_name} {assignment.tutor.last_name}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Grading (if graded) */}
                {isGraded && (
                    <Card className="mb-6 border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-green-900">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Graded
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-green-700">Score</p>
                                    <p className="text-3xl font-bold text-green-900">
                                        {assignment.submission?.marks_obtained}/{assignment.max_marks}
                                    </p>
                                </div>
                                {assignment.submission?.feedback && (
                                    <div>
                                        <p className="text-sm text-green-700 mb-1">Feedback</p>
                                        <p className="text-green-900">{assignment.submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submission Form */}
                {!isSubmitted && !isOverdue() && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Answer
                                </label>
                                <Textarea
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={8}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload File (Optional)
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-400 mt-1">Accepted formats: PDF, Word, Excel, PPT, Images, Zip. Max size: 5MB.</p>
                                {file && (
                                    <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
                                )}
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Submit Assignment
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Already Submitted */}
                {isSubmitted && !isGraded && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="py-8 text-center">
                            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Assignment Submitted!</h3>
                            <p className="text-blue-700 mb-4">
                                Submitted on {formatDate(assignment.submission!.submitted_at)}
                            </p>
                            <p className="text-sm text-blue-600">Waiting for grading...</p>
                        </CardContent>
                    </Card>
                )}

                {/* Overdue */}
                {!isSubmitted && isOverdue() && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-8 text-center">
                            <Clock className="w-12 h-12 text-red-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-red-900 mb-2">Assignment Overdue</h3>
                            <p className="text-red-700">
                                The deadline for this assignment has passed.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
