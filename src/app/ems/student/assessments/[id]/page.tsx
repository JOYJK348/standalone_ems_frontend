'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TopNavbar } from '@/components/ems/dashboard/top-navbar';
import { BottomNav } from '@/components/ems/dashboard/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Send, AlertCircle, CheckCircle, Trophy, Loader2, User } from 'lucide-react';
import api from '@/lib/api';

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    options: string[];
    marks: number;
}

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    duration_minutes: number;
    total_marks: number;
    passing_marks: number;
    course?: {
        course_name: string;
    };
    tutor?: {
        first_name: string;
        last_name: string;
    };
}

interface Attempt {
    id: number;
    score: number | null;
    is_passed: boolean | null;
    submitted_at: string | null;
}

export default function QuizTakePage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params?.id as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [quizStarted, setQuizStarted] = useState(false);

    useEffect(() => {
        if (quizId) {
            fetchQuiz();
        }
    }, [quizId]);

    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && quizStarted && !attempt?.submitted_at) {
            handleSubmit(true);
        }
    }, [timeLeft, quizStarted]);

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/ems/students/quizzes/${quizId}`);
            if (response.data.success) {
                setQuiz(response.data.data);

                // Check if already attempted
                if (response.data.data.attempt) {
                    setAttempt(response.data.data.attempt);
                }
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
            toast.error('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async () => {
        try {
            setLoading(true);

            // Fetch questions
            const questionsResponse = await api.get(`/ems/students/quizzes/${quizId}/questions`);
            if (questionsResponse.data.success) {
                setQuestions(questionsResponse.data.data);
            }

            // Start attempt
            const attemptResponse = await api.post(`/ems/students/quizzes/${quizId}/start`);
            if (attemptResponse.data.success) {
                setAttemptId(attemptResponse.data.data.id);
                setTimeLeft((quiz?.duration_minutes || 30) * 60);
                setQuizStarted(true);
                toast.success('Quiz started! Good luck!');
            }
        } catch (error: any) {
            console.error('Failed to start quiz:', error);
            toast.error(error.response?.data?.message || 'Failed to start quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!attemptId) return;

        if (!autoSubmit) {
            const confirmed = window.confirm('Are you sure you want to submit? You cannot change your answers after submission.');
            if (!confirmed) return;
        }

        setSubmitting(true);

        try {
            const response = await api.post(`/ems/students/quizzes/${quizId}/submit`, {
                attempt_id: attemptId,
                answers
            });

            if (response.data.success) {
                setAttempt(response.data.data);
                setQuizStarted(false);
                toast.success('Quiz submitted successfully!');
            } else {
                toast.error(response.data.message || 'Failed to submit quiz');
            }
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (timeLeft < 60) return 'text-red-600';
        if (timeLeft < 300) return 'text-orange-600';
        return 'text-green-600';
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading quiz...</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    // Show results if already submitted
    if (attempt?.submitted_at) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/ems/student/assessments')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Assessments
                    </Button>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl">{quiz?.quiz_title}</CardTitle>
                            <p className="text-gray-600">{quiz?.course?.course_name}</p>
                        </CardHeader>
                    </Card>

                    <Card className={`border-2 ${attempt.is_passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <CardContent className="py-8 text-center">
                            <div className="mb-6">
                                {attempt.is_passed ? (
                                    <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                ) : (
                                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                                )}
                                <h2 className={`text-3xl font-bold mb-2 ${attempt.is_passed ? 'text-green-900' : 'text-red-900'}`}>
                                    {attempt.is_passed ? 'Congratulations!' : 'Keep Trying!'}
                                </h2>
                                <p className={attempt.is_passed ? 'text-green-700' : 'text-red-700'}>
                                    {attempt.is_passed ? 'You passed the quiz!' : 'You did not pass this time.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                <div className={`p-4 rounded-lg ${attempt.is_passed ? 'bg-white' : 'bg-white'}`}>
                                    <p className="text-sm text-gray-600 mb-1">Your Score</p>
                                    <p className={`text-3xl font-bold ${attempt.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {attempt.score}/{quiz?.total_marks}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg ${attempt.is_passed ? 'bg-white' : 'bg-white'}`}>
                                    <p className="text-sm text-gray-600 mb-1">Percentage</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {((attempt.score || 0) / (quiz?.total_marks || 1) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg ${attempt.is_passed ? 'bg-white' : 'bg-white'}`}>
                                    <p className="text-sm text-gray-600 mb-1">Passing Marks</p>
                                    <p className="text-3xl font-bold text-gray-900">{quiz?.passing_marks}</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.push('/ems/student/assessments')}
                                className="mt-6"
                            >
                                Back to Assessments
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <BottomNav />
            </div>
        );
    }

    // Show start screen if not started
    if (!quizStarted) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/ems/student/assessments')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Assessments
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{quiz?.quiz_title}</CardTitle>
                            <p className="text-gray-600">{quiz?.course?.course_name}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {quiz?.quiz_description && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                    <p className="text-gray-700">{quiz.quiz_description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="text-lg font-semibold text-gray-900">{quiz?.duration_minutes} minutes</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Marks</p>
                                    <p className="text-lg font-semibold text-gray-900">{quiz?.total_marks}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Passing Marks</p>
                                    <p className="text-lg font-semibold text-gray-900">{quiz?.passing_marks}</p>
                                </div>
                            </div>

                            {quiz?.tutor && (
                                <div className="flex items-center space-x-2 pt-4 border-t">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Created By</p>
                                        <p className="font-semibold text-gray-900">
                                            {quiz.tutor.first_name} {quiz.tutor.last_name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        Instructions
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                                        <li>Once started, the timer cannot be paused</li>
                                        <li>Answer all questions before time runs out</li>
                                        <li>Quiz will auto-submit when time expires</li>
                                        <li>You cannot change answers after submission</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={startQuiz}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    size="lg"
                                >
                                    Start Quiz
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <BottomNav />
            </div>
        );
    }

    // Show quiz questions
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Timer Header */}
                <div className="sticky top-0 z-10 bg-white border-b pb-4 mb-6 rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{quiz?.quiz_title}</h1>
                            <p className="text-sm text-gray-600">
                                {answeredCount} of {totalQuestions} questions answered
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center space-x-2">
                                <Clock className={`w-5 h-5 ${getTimeColor()}`} />
                                <span className={`text-2xl font-bold ${getTimeColor()}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Time Remaining</p>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                {timeLeft < 300 && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-orange-900">Time is running out!</p>
                            <p className="text-sm text-orange-700">Make sure to submit your answers before time expires.</p>
                        </div>
                    </div>
                )}

                {/* Questions */}
                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">
                                        Question {index + 1}
                                        <span className="ml-2 text-sm font-normal text-gray-600">
                                            ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                                        </span>
                                    </CardTitle>
                                    {answers[question.id] && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Answered
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-gray-900 mt-2">{question.question_text}</p>
                            </CardHeader>
                            <CardContent>
                                {(question.question_type === 'MULTIPLE_CHOICE' || question.question_type === 'MCQ') && (
                                    <div className="space-y-3">
                                        {question.options.map((option, optIndex) => (
                                            <label
                                                key={optIndex}
                                                className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                                style={{
                                                    borderColor: answers[question.id] === option ? '#3b82f6' : '#e5e7eb',
                                                    backgroundColor: answers[question.id] === option ? '#eff6ff' : 'white'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    checked={answers[question.id] === option}
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-gray-900">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.question_type === 'TRUE_FALSE' && (
                                    <div className="space-y-3">
                                        {['True', 'False'].map((option) => (
                                            <label
                                                key={option}
                                                className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                                style={{
                                                    borderColor: answers[question.id] === option ? '#3b82f6' : '#e5e7eb',
                                                    backgroundColor: answers[question.id] === option ? '#eff6ff' : 'white'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    checked={answers[question.id] === option}
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-gray-900">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.question_type === 'SHORT_ANSWER' && (
                                    <textarea
                                        value={answers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        placeholder="Type your answer here..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-white border-t pt-6 mt-8 rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Progress: <span className="font-semibold text-gray-900">{answeredCount}/{totalQuestions}</span>
                            </p>
                            {answeredCount < totalQuestions && (
                                <p className="text-sm text-orange-600">
                                    {totalQuestions - answeredCount} question(s) remaining
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Quiz
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
