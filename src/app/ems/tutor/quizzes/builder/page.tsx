"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TutorTopNavbar } from "@/components/ems/dashboard/tutor-top-navbar";
import { TutorBottomNav } from "@/components/ems/dashboard/tutor-bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ClipboardCheck,
    Plus,
    ArrowLeft,
    Trash2,
    Check,
    Save,
    Eye,
    GripVertical,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface QuizOption {
    id?: number;
    option_text: string;
    is_correct: boolean;
    option_order: number;
}

interface QuizQuestion {
    id?: number;
    question_text: string;
    question_type: string;
    marks: number;
    question_order: number;
    options: QuizOption[];
    explanation?: string;
}

interface Quiz {
    id: number;
    quiz_title: string;
    quiz_description: string;
    total_marks: number;
    duration_minutes: number;
}

export default function QuizBuilderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams?.get("id");

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (quizId) {
            fetchQuizDetails();
        }
    }, [quizId]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);

            // Fetch quiz details
            const quizResponse = await api.get(`/ems/quizzes/${quizId}`);
            if (quizResponse.data.success) {
                setQuiz(quizResponse.data.data);
            }

            // Fetch questions separately
            const questionsResponse = await api.get(`/ems/quizzes/${quizId}/questions`);
            if (questionsResponse.data.success && questionsResponse.data.data) {
                const fetchedQuestions = questionsResponse.data.data.map((q: any) => ({
                    id: q.id,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    marks: q.marks,
                    question_order: q.question_order,
                    explanation: q.explanation || "",
                    options: q.quiz_options || []
                }));
                setQuestions(fetchedQuestions);
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            question_text: "",
            question_type: "MCQ",
            marks: 1,
            question_order: questions.length + 1,
            options: [
                { option_text: "", is_correct: false, option_order: 1 },
                { option_text: "", is_correct: false, option_order: 2 },
                { option_text: "", is_correct: false, option_order: 3 },
                { option_text: "", is_correct: false, option_order: 4 },
            ],
            explanation: "",
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        (updated[index] as any)[field] = value;
        setQuestions(updated);
    };

    const deleteQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        updated.forEach((q, i) => {
            q.question_order = i + 1;
        });
        setQuestions(updated);
    };

    const addOption = (questionIndex: number) => {
        const updated = [...questions];
        const currentOptions = updated[questionIndex].options;
        const newOption: QuizOption = {
            option_text: "",
            is_correct: false,
            option_order: currentOptions.length + 1,
        };
        updated[questionIndex].options = [...currentOptions, newOption];
        setQuestions(updated);
    };

    const updateOption = (
        questionIndex: number,
        optionIndex: number,
        field: string,
        value: any
    ) => {
        const updated = [...questions];
        (updated[questionIndex].options[optionIndex] as any)[field] = value;

        if (field === "is_correct" && value === true) {
            updated[questionIndex].options.forEach((opt, i) => {
                if (i !== optionIndex) {
                    opt.is_correct = false;
                }
            });
        }

        setQuestions(updated);
    };

    const deleteOption = (questionIndex: number, optionIndex: number) => {
        const updated = [...questions];
        updated[questionIndex].options = updated[questionIndex].options.filter(
            (_, i) => i !== optionIndex
        );
        updated[questionIndex].options.forEach((opt, i) => {
            opt.option_order = i + 1;
        });
        setQuestions(updated);
    };

    const saveQuiz = async () => {
        try {
            setSaving(true);
            const response = await api.post(`/ems/quizzes/${quizId}/questions`, {
                questions,
            });

            if (response.data.success) {
                alert("Quiz saved successfully!");
                router.push("/ems/tutor/quizzes");
            }
        } catch (error) {
            console.error("Error saving quiz:", error);
            alert("Failed to save quiz");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TutorTopNavbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/ems/tutor/quizzes">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Quizzes
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                {quiz?.quiz_title}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Build your quiz with multiple choice questions
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/ems/tutor/quizzes/${quizId}`)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button
                                onClick={saveQuiz}
                                disabled={saving || questions.length === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? "Saving..." : "Save Quiz"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quiz Info Card */}
                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Total Marks</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {quiz?.total_marks}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Duration</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {quiz?.duration_minutes} min
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Questions</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {questions.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions List */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {questions.map((question, qIndex) => (
                            <motion.div
                                key={qIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold">
                                                        {qIndex + 1}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <Textarea
                                                    placeholder="Enter your question here..."
                                                    value={question.question_text}
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            qIndex,
                                                            "question_text",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="text-lg font-medium border-0 border-b-2 border-gray-200 focus:border-blue-500 rounded-none px-0 resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={question.marks}
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            qIndex,
                                                            "marks",
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    className="w-20 text-center"
                                                />
                                                <span className="text-sm text-gray-600">marks</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteQuestion(qIndex)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="ml-16 space-y-3">
                                            {question.options.map((option, oIndex) => (
                                                <div
                                                    key={oIndex}
                                                    className="flex items-center gap-3 group"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateOption(
                                                                qIndex,
                                                                oIndex,
                                                                "is_correct",
                                                                !option.is_correct
                                                            )
                                                        }
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${option.is_correct
                                                            ? "bg-green-500 border-green-500"
                                                            : "border-gray-300 hover:border-green-400"
                                                            }`}
                                                    >
                                                        {option.is_correct && (
                                                            <Check className="h-4 w-4 text-white" />
                                                        )}
                                                    </button>
                                                    <span className="text-gray-600 font-medium w-6">
                                                        {String.fromCharCode(65 + oIndex)}.
                                                    </span>
                                                    <Input
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={option.option_text}
                                                        onChange={(e) =>
                                                            updateOption(
                                                                qIndex,
                                                                oIndex,
                                                                "option_text",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="flex-1"
                                                    />
                                                    {question.options.length > 2 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                deleteOption(qIndex, oIndex)
                                                            }
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-gray-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addOption(qIndex)}
                                                className="ml-9"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Option
                                            </Button>
                                        </div>

                                        <div className="ml-16 mt-4">
                                            <Label className="text-sm text-gray-600">
                                                Explanation (Optional)
                                            </Label>
                                            <Textarea
                                                placeholder="Explain the correct answer..."
                                                value={question.explanation || ""}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        qIndex,
                                                        "explanation",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1"
                                                rows={2}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <Button
                        onClick={addQuestion}
                        variant="outline"
                        className="w-full h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Question
                    </Button>
                </div>

                {/* Empty State */}
                {questions.length === 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <ClipboardCheck className="h-20 w-20 text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Questions Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start building your quiz by adding questions
                            </p>
                            <Button
                                onClick={addQuestion}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Question
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <TutorBottomNav />
        </div>
    );
}
