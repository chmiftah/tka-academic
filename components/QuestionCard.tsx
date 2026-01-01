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
                return "Pilih satu atau lebih jawaban";
            case 'TRUE_FALSE': return "Pilih opsi Benar atau Salah";
            default: return "Pilih satu jawaban yang paling tepat";
        }
    };

    return (
        <div className={`flex flex-col ${question.stimulus ? 'md:w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-blue-600/80 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                                Soal No. {index + 1}
                            </h2>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                {question.type === 'SINGLE_CHOICE' || question.type === 'PG' ? 'Pilihan Ganda' : (question.type === 'CHECKLIST' || question.type === 'complex') ? 'Pilihan Majemuk' : 'Benar / Salah'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 ml-1 mt-1">{getHelperText()}</p>
                    </div>

                    <button
                        onClick={toggleFlag}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${flags.has(question.id) ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Flag className={`w-4 h-4 ${flags.has(question.id) ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Ragu-ragu</span>
                    </button>
                </div>

                <div className="prose prose-slate max-w-none mb-8">
                    <div className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
                        <MathRenderer text={question.text} block={false} /> {/* Used MathRenderer for question text */}
                    </div>
                </div>

                <div className={`grid gap-3 ${question.type === 'TRUE_FALSE' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {question.options.map((option, optionIndex) => {
                        const selected = selectedIds.includes(String(option.id));
                        const letter = String.fromCharCode(65 + optionIndex); // A, B, C...

                        // Render Checkbox Icon for CHECKLIST and 'complex'
                        const renderIcon = () => {
                            if (question.type === 'CHECKLIST' || question.type === 'complex') {
                                return selected
                                    ? <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                                    : <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white" />;
                            }
                            // Default to Radio for SINGLE_CHOICE, 'PG' and TRUE_FALSE (though TF is card style)
                            return selected
                                ? <CircleDot className="w-5 h-5 text-blue-600 fill-current" />
                                : <Circle className="w-5 h-5 text-slate-300" />;
                        };

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(String(option.id))}
                                className={`
                                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group
                                    ${selected
                                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/20'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }
                                    ${question.type === 'TRUE_FALSE' ? 'justify-center text-center flex-col gap-2 py-6' : 'flex-row'}
                                `}
                            >
                                {question.type !== 'TRUE_FALSE' && (
                                    <div className="mr-4 shrink-0 transition-colors">
                                        {/* Conditional rendering for PG type with letter, otherwise use renderIcon */}
                                        {question.type === 'PG' ? (
                                            <div className={`flex-shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors
                                                ${selected
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white border-slate-300 text-slate-500 group-hover:border-blue-400'
                                                }
                                            `}>
                                                <span className="font-bold">{letter}</span>
                                            </div>
                                        ) : (
                                            renderIcon()
                                        )}
                                    </div>
                                )}

                                <span className={`text-base ${selected ? 'text-blue-900 font-medium' : 'text-slate-700'} ${question.type === 'TRUE_FALSE' ? 'text-lg font-bold' : ''}`}>
                                    <MathRenderer text={option.text} /> {/* Used MathRenderer for option text */}
                                </span>

                                {question.type === 'TRUE_FALSE' && selected && (
                                    <div className="mt-1 text-blue-600">
                                        <div className="w-6 h-1 bg-blue-600 rounded-full mx-auto" />
                                    </div>
                                )}
                                {/* Checkmark Indicator for complex type */}
                                {(question.type === 'complex' || question.type === 'CHECKLIST') && selected && (
                                    <div className="text-blue-600 animate-in zoom-in duration-200 ml-auto">
                                        <CheckCircle2 className="w-6 h-6" />
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
