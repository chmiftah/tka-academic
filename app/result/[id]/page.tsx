"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    CheckCircle, XCircle, Home, FileText, Loader2, BookOpen,
    Award, Clock, Menu, ChevronLeft, ChevronRight, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import MathRenderer from "@/components/MathRenderer";
import StudentSidebar from "@/components/StudentSidebar";
// Confetti removed to avoid dependency issues

// 1. UPDATE INTERFACE
interface ExamResult {
    id: string;
    student_name: string;
    total_score: number;
    created_at: string;
    student_answers: {
        is_correct: boolean;
        score_earned: number;
        selected_option_id: string; // Corrected column name
        questions: {
            question_text: string;
            discussion: string | null;
            options: { // Added: List of options for the question
                id: string;
                option_text: string; // Corrected column name
                is_correct: boolean;
            }[];
        };
    }[];
}

export default function ResultPage() {
    const params = useParams();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const fetchResult = async () => {
            const supabase = createClient();

            // 2. UPDATE QUERY
            const { data, error } = await supabase
                .from("exam_results")
                .select(`
          *,
          student_answers (
            is_correct,
            score_earned,
            selected_option_id,
            questions (
              question_text,
              discussion,
              options (
                id,
                option_text,
                is_correct
              )
            )
          )
        `)
                .eq("id", params.id)
                .single();

            if (error) {
                console.error("Error fetching result:", error);
            }

            if (data) {
                setResult(data);
            }
            setLoading(false);
        };

        if (params.id) fetchResult();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Menghitung Skor...</p>
                </div>
            </div>
        );
    }

    if (!result) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-10 text-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
                <Link href="/dashboard" className="text-indigo-600 hover:underline">Kembali ke Dashboard</Link>
            </div>
        </div>
    );

    const questions = result.student_answers;
    const totalQuestions = questions.length;
    const currentAnswer = questions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    // Helper for grid color
    const getGridColor = (idx: number, isCorrect: boolean) => {
        const isActive = idx === currentQuestionIndex;
        if (isActive) return "bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-100";
        if (isCorrect) return "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200";
        return "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200";
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 overflow-hidden">
            {/* --- Left Sidebar (Menu) - Full Height --- */}
            <StudentSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                showDefaultLinks={true}
            >
                {/* Empty Children -> StudentSidebar will show default links */}
            </StudentSidebar>

            {/* --- Right Column (Header + Content) --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* --- Top Bar (Modernized) --- */}
                <header className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-6 z-40 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 lg:hidden text-slate-600 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-slate-800">
                                Hasil Ujian
                            </h1>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <span>{result.student_name}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{new Date(result.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Score Pill */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Award className="w-4 h-4" />
                            <span className="font-mono text-lg font-bold tracking-wider">
                                {result.total_score}
                            </span>
                            <span className="text-xs font-semibold opacity-60">/100</span>
                        </div>
                    </div>
                </header>

                {/* --- Content Wrapper (Center + Right) --- */}
                <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                    {/* --- Center: Question Review --- */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="max-w-3xl mx-auto space-y-6 pb-24">

                            {/* Question Header Badge */}
                            <div className="flex items-center justify-between">
                                <div className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
                                    Soal {currentQuestionIndex + 1}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold border ${currentAnswer.is_correct ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {currentAnswer.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    <span>{currentAnswer.is_correct ? 'Benar' : 'Salah'}</span>
                                    <span className="ml-1 text-xs opacity-75">({currentAnswer.is_correct ? `+${currentAnswer.score_earned}` : '0'} Poin)</span>
                                </div>
                            </div>

                            {/* Question Card Lookalike */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
                                <div className="prose prose-slate max-w-none prose-p:leading-loose text-slate-800 text-lg">
                                    <MathRenderer text={currentAnswer.questions?.question_text} />
                                </div>

                                {/* Options Display */}
                                <div className="space-y-3">
                                    {currentAnswer.questions?.options?.map((opt, idx) => {
                                        // Fix string vs number comparison if needed (IDs usually string or int)
                                        // Assuming ids are compatible (likely both strings or castable)
                                        const isSelected = String(opt.id) === String(currentAnswer.selected_option_id);
                                        const isCorrect = opt.is_correct;

                                        // Logic Highlighting
                                        let containerClass = "border-slate-200 hover:bg-slate-50"; // Default
                                        let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>;

                                        if (isSelected) {
                                            if (isCorrect) {
                                                containerClass = "bg-green-50 border-green-200 ring-1 ring-green-200";
                                                icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                            } else {
                                                containerClass = "bg-red-50 border-red-200 ring-1 ring-red-200";
                                                icon = <XCircle className="w-5 h-5 text-red-500" />;
                                            }
                                        } else if (isCorrect) {
                                            // Show correct answer if not selected
                                            containerClass = "bg-green-50/50 border-green-200 border-dashed";
                                            icon = <CheckCircle2 className="w-5 h-5 text-green-600 opacity-50" />;
                                        }

                                        return (
                                            <div
                                                key={opt.id}
                                                className={`
                                                    flex items-start gap-4 p-4 rounded-xl border transition-all
                                                    ${containerClass}
                                                `}
                                            >
                                                <div className="shrink-0 mt-0.5">{icon}</div>
                                                <div className={`flex-1 text-sm ${isSelected && !isCorrect ? 'text-red-700 font-medium' : (isCorrect ? 'text-green-700 font-medium' : 'text-slate-600')}`}>
                                                    <MathRenderer text={opt.option_text} />
                                                </div>
                                                {(isSelected || isCorrect) && (
                                                    <div className="shrink-0 text-xs font-bold uppercase px-2 py-1 rounded bg-white/50">
                                                        {isSelected && isCorrect && <span className="text-green-700">Jawaban Anda (Benar)</span>}
                                                        {isSelected && !isCorrect && <span className="text-red-600">Jawaban Anda (Salah)</span>}
                                                        {!isSelected && isCorrect && <span className="text-green-600 opacity-75">Kunci Jawaban</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Discussion Section */}
                            {currentAnswer.questions?.discussion && (
                                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-indigo-50/50 px-5 py-3 border-b border-indigo-100 flex items-center gap-2 text-indigo-700">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Pembahasan</span>
                                    </div>
                                    <div className="p-6 text-sm text-slate-600 leading-relaxed">
                                        <MathRenderer text={currentAnswer.questions.discussion} />
                                    </div>
                                </div>
                            )}

                            {/* Bottom Navigation (Inside Center) */}
                            <div className="flex items-center justify-between mt-8">
                                <button
                                    onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                                    disabled={isFirstQuestion}
                                    className="
                                        flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium
                                        hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all active:scale-95 bg-white
                                    "
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Sebelumnya</span>
                                </button>

                                <button
                                    onClick={() => setCurrentQuestionIndex(p => Math.min(totalQuestions - 1, p + 1))}
                                    disabled={isLastQuestion}
                                    className="
                                        flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold
                                        shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300
                                        active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                >
                                    <span>Selanjutnya</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex justify-center mt-8 pt-8 border-t border-slate-100">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm text-sm"
                                >
                                    <Home className="w-4 h-4" />
                                    Kembali ke Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Sidebar: Question Grid --- */}
                    <div className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col h-full border-t lg:border-t-0">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <div className="grid grid-cols-2 divide-x divide-slate-200">
                                <div className="text-center px-2">
                                    <div className="text-xl font-bold text-green-600">{result.student_answers.filter(a => a.is_correct).length}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Benar</div>
                                </div>
                                <div className="text-center px-2">
                                    <div className="text-xl font-bold text-red-500">{result.student_answers.filter(a => !a.is_correct).length}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Salah</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <div className="grid grid-cols-5 gap-3">
                                {questions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`
                                            aspect-square flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200
                                            ${getGridColor(idx, q.is_correct)}
                                        `}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Keterangan</div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-100"></div>
                                <span>Posisi Sekarang</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                                <span>Jawaban Benar</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                                <span>Jawaban Salah</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}