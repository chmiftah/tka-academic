import React from 'react';
import { Flag, Check, Square, Circle, CircleDot, CheckCircle2 } from "lucide-react";
import { useExamStore } from "@/store/examStore";
import MathRenderer from "@/components/MathRenderer";

interface Option {
    id: string;
    text: string;
    is_correct?: boolean;
    score?: number;
}

interface Question {
    id: string;
    text: string;
    type: 'SINGLE_CHOICE' | 'CHECKLIST' | 'TRUE_FALSE' | 'PG' | 'complex' | string;
    max_score?: number;
    options: Option[];
    stimulus?: {
        type: "text" | "image";
        content: string;
    };
}

interface QuestionCardProps {
    question: Question;
    index: number;
    flags: Set<string>;
    toggleFlag: () => void;
}

export default function QuestionCard({ question, index, flags, toggleFlag }: QuestionCardProps) {
    const { answers, setAnswer } = useExamStore();
    // Default to empty array if undefined
    const selectedIds = answers[question.id] || [];

    const handleSelect = (optionId: string) => {
        // Handle PG/SINGLE_CHOICE as single select
        if (question.type === 'SINGLE_CHOICE' || question.type === 'PG') {
            // Replace with single value
            setAnswer(question.id, [optionId]);
        } else {
            // Toggle logic for CHECKLIST, complex, and TRUE_FALSE
            const newSelection = selectedIds.includes(optionId)
                ? selectedIds.filter(id => id !== optionId)
                : [...selectedIds, optionId];
            setAnswer(question.id, newSelection);
        }
    };

    const getHelperText = () => {
        switch (question.type) {
            case 'CHECKLIST':
            case 'complex':
                return "Pilih satu atau lebih jawaban (Multi-select)";
            case 'TRUE_FALSE': return "Tentukan pernyataan Benar atau Salah";
            default: return "Pilih satu jawaban yang paling tepat";
        }
    };

    const isComplexOrChecklist = question.type === 'CHECKLIST' || question.type === 'complex';

    return (
        <div className={`flex flex-col ${question.stimulus ? 'md:w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
            <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 sm:p-8 flex-1">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold shadow-sm">
                                {index + 1}
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                                {question.type === 'SINGLE_CHOICE' || question.type === 'PG' ? 'Pilihan Ganda' : (isComplexOrChecklist) ? 'Pilihan Majemuk' : 'Benar / Salah'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium pl-1">{getHelperText()}</p>
                    </div>

                    <button
                        onClick={toggleFlag}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all
                            ${flags.has(question.id)
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }
                        `}
                    >
                        <Flag className={`w-3.5 h-3.5 ${flags.has(question.id) ? 'fill-current' : ''}`} />
                        <span>{flags.has(question.id) ? 'Ditandai' : 'Tandai Ragu'}</span>
                    </button>
                </div>

                {/* Question Text */}
                <div className="prose prose-slate max-w-none mb-8">
                    <div className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed tracking-tight">
                        <MathRenderer text={question.text} block={false} />
                    </div>
                </div>

                {/* Options Grid */}
                <div className={`grid gap-4 ${question.type === 'TRUE_FALSE' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {question.options.map((option, optionIndex) => {
                        const selected = selectedIds.includes(String(option.id));
                        const letter = String.fromCharCode(65 + optionIndex); // A, B, C...

                        // Render Logic
                        const isPG = question.type === 'PG' || question.type === 'SINGLE_CHOICE';

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(String(option.id))}
                                className={`
                                    relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center group
                                    ${selected
                                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/20 z-10'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
                                    }
                                    ${question.type === 'TRUE_FALSE' ? 'flex-col justify-center text-center py-8 gap-3' : 'flex-row gap-4'}
                                `}
                            >
                                {/* Indicator / Icon */}
                                {question.type !== 'TRUE_FALSE' && (
                                    <div className="shrink-0">
                                        {isPG ? (
                                            <div className={`
                                                w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200
                                                ${selected
                                                    ? 'bg-blue-600 text-white shadow-md scale-105'
                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                                                }
                                            `}>
                                                {letter}
                                            </div>
                                        ) : (
                                            /* Checkbox style for Multiple Choice */
                                            <div className={`
                                                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
                                                ${selected
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-slate-300 bg-white group-hover:border-blue-400'
                                                }
                                            `}>
                                                {selected && <Check className="w-4 h-4" strokeWidth={3} />}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Option Text */}
                                <div className="flex-1 min-w-0">
                                    <span className={`
                                        text-base leading-snug break-words
                                        ${selected ? 'text-blue-900 font-semibold' : 'text-slate-700 font-normal'} 
                                        ${question.type === 'TRUE_FALSE' ? 'text-lg' : ''}
                                    `}>
                                        <MathRenderer text={option.text} />
                                    </span>
                                </div>

                                {/* Active State Decoration (Right side check) */}
                                {selected && isPG && (
                                    <div className="absolute right-4 text-blue-600 animate-in fade-in zoom-in duration-200">
                                        <CheckCircle2 className="w-6 h-6 fill-blue-100" />
                                    </div>
                                )}

                                {isComplexOrChecklist && selected && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 text-blue-400">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}

                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
