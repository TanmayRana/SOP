import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

interface QuizViewProps {
    questions: QuizQuestion[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, currentIndex, onNext, onPrev }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    if (!questions || questions.length === 0) return null;
    const quiz = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleAnswerSelect = (index: number) => {
        setSelectedAnswer(index);
        setShowExplanation(true);
    };

    const handleNavigation = (direction: 'next' | 'prev') => {
        setSelectedAnswer(null);
        setShowExplanation(false);
        direction === 'next' ? onNext() : onPrev();
    };

    const correctAnswerIndex = quiz.options.indexOf(quiz.answer);

    return (
        <div className="w-full min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2 sm:space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                            Question {currentIndex + 1} <span className="hidden xs:inline">of</span><span className="xs:hidden">/</span> {questions.length}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-secondary"
                        >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                    </div>
                    <div className="relative h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/50 shadow-sm">
                    <p className="text-sm sm:text-base md:text-lg font-medium text-foreground leading-relaxed">
                        {quiz.question}
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    {quiz.options.map((option, i) => {
                        const isSelected = selectedAnswer === i;
                        const isCorrect = i === correctAnswerIndex;
                        const showResult = showExplanation;

                        let buttonStyles = "w-full text-left p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium ";

                        if (!showResult) {
                            buttonStyles += "bg-secondary/40 hover:bg-secondary/60 border-2 border-transparent hover:border-primary/50 hover:shadow-md active:scale-[0.98] sm:hover:scale-[1.01]";
                        } else if (isCorrect) {
                            buttonStyles += "bg-green-500/20 border-2 border-green-500 shadow-md";
                        } else if (isSelected && !isCorrect) {
                            buttonStyles += "bg-red-500/20 border-2 border-red-500";
                        } else {
                            buttonStyles += "bg-secondary/20 border-2 border-transparent opacity-50";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => !showExplanation && handleAnswerSelect(i)}
                                disabled={showExplanation}
                                className={buttonStyles}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-background flex items-center justify-center font-bold text-xs border border-border">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="flex-1 leading-snug">{option}</span>
                                    {showResult && isCorrect && (
                                        <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                                    )}
                                    {showResult && isSelected && !isCorrect && (
                                        <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                    <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1 sm:mb-1.5">
                            Explanation
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {quiz.explanation}
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 gap-2 sm:gap-3">
                    <Button
                        disabled={currentIndex === 0}
                        onClick={() => handleNavigation('prev')}
                        variant="outline"
                        size="default"
                        className="gap-1 sm:gap-2 font-semibold text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Previous</span>
                        <span className="xs:hidden">Prev</span>
                    </Button>
                    <Button
                        disabled={currentIndex === questions.length - 1}
                        onClick={() => handleNavigation('next')}
                        variant="default"
                        size="default"
                        className="gap-1 sm:gap-2 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
                    >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuizView;