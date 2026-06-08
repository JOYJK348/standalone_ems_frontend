'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, HelpCircle, ChevronRight, BookOpen } from 'lucide-react';
import type { PracticeScenario } from '@/lib/practiceTypes';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/practiceTypes';

interface ScenarioCardProps {
    scenario: PracticeScenario;
    currentHintIndex: number;
    onShowNextHint: () => void;
}

export function ScenarioCard({ scenario, currentHintIndex, onShowNextHint }: ScenarioCardProps) {
    const hints = scenario.expected_hints || [];
    const visibleHints = hints.slice(0, currentHintIndex + 1);
    const allRevealed = currentHintIndex >= hints.length - 1;

    return (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md overflow-hidden">
            <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <BookOpen className="h-5 w-5 text-yellow-700" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Practice Scenario</p>
                                <h3 className="text-lg font-bold text-gray-900">{scenario.title}</h3>
                            </div>
                        </div>
                        <Badge className={DIFFICULTY_COLORS[scenario.difficulty] + ' ml-2'}>
                            {DIFFICULTY_LABELS[scenario.difficulty]}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{scenario.description}</p>

                    {hints.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {!allRevealed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onShowNextHint}
                                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                                >
                                    <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Need a hint? ({currentHintIndex + 1}/{hints.length})
                                </Button>
                            )}
                            {visibleHints.map((hint, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-yellow-900 bg-yellow-100/80 px-3 py-2 rounded-md"
                                >
                                    <Lightbulb className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                                    <span>{hint}</span>
                                </div>
                            ))}
                            {allRevealed && (
                                <p className="text-xs text-yellow-600 italic mt-1">
                                    All hints revealed. Try solving the scenario!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
