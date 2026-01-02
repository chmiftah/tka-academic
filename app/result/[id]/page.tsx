"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, XCircle, FileText, ArrowLeft, Trophy, Calendar, User, Menu, Home, HelpCircle, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MathRenderer from "@/components/MathRenderer";

interface ExamResult {
    id: string;
    student_name: string;
    total_score: number;
    created_at: string;
    exam_package_id: string;
    student_answers: {
        is_correct: boolean;
        score_earned: number;
        selected_option_id: string | null;
        questions: {
            question_text: string;
            discussion: string | null;
            options: {
                id: string;
                option_text: string;
                is_correct: boolean;
            }[];
        };
    }[];
}

export default function ResultPage() {
    const params = useParams();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const fetchResult = async () => {
            const supabase = createClient();

            // 1. Fetch Result & Answers
            const { data: resultData, error } = await supabase
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
                setLoading(false);
                return;
            }

            setResult(resultData);

            // 2. Fetch Total Questions Count
            if (resultData?.exam_package_id) {
                const { count, error: countError } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('exam_package_id', resultData.exam_package_id);

                if (!countError && count !== null) {
                    setTotalQuestionsCount(count);
                } else {
                    setTotalQuestionsCount(resultData.student_answers.length);
                }
            } else {
                setTotalQuestionsCount(resultData.student_answers.length);
            }

            setLoading(false);
        };

        if (params.id) {
            fetchResult();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-6 text-center px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <AlertCircle className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Result Not Found</h1>
                    <p className="text-slate-500 mt-2">We couldn't find the exam result you are looking for.</p>
                </div>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
                >
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // --- Calculations ---
    const correctAnswers = result.student_answers.filter(a => a.is_correct).length;

    // Wrong = Incorrect AND has a selected option (attempted but wrong)
    const wrongAnswers = result.student_answers.filter(a => !a.is_correct && a.selected_option_id).length;

    // Unanswered = Total - (Correct + Wrong) OR explicitly null selection
    const unansweredAnswers = Math.max(0, totalQuestionsCount - (correctAnswers + wrongAnswers));

    const score = result.total_score;
    const passed = score >= 60; // Example passing grade

    const currentAnswer = result.student_answers[currentQuestionIndex];
    const currentQuestion = currentAnswer?.questions;

    return (
        <div className="flex bg-slate-50 font-sans selection:bg-blue-100 h-screen overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 h-full">

                {/* --- Header --- */}
                <header className="flex-none bg-white border-b border-slate-200 z-30 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 lg:hidden text-slate-600"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors hidden sm:block">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold text-slate-800">Exam Results</h1>
                            <span className="text-xs text-slate-400 font-medium">
                                {result ? new Date(result.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-full transition-colors"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                    {/* --- Center: Content Area --- */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
                        <div className="max-w-5xl mx-auto space-y-8 pb-24">

                            {/* 1. Score Card (Hero) & Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Score Card */}
                                <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                                    {/* Decorative Blobs */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
                                            {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {passed ? "Lulus" : "Belum Lulus"}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-medium text-blue-100 mb-1">Total Nilai</h2>
                                            <div className="text-7xl sm:text-8xl font-bold tracking-tighter leading-none">
                                                {score}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 mt-auto pt-6">
                                        <p className="text-blue-100 text-sm leading-relaxed">
                                            {passed
                                                ? "Selamat! Kamu telah memahami materi dengan baik."
                                                : "Jangan menyerah! Pelajari pembahasan di bawah ini."}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Grid (3 Columns) */}
                                <div className="lg:col-span-7 grid grid-cols-3 gap-4">
                                    {/* Correct */}
                                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="text-3xl font-bold text-slate-800">{correctAnswers}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benar</div>
                                    </div>

                                    {/* Wrong */}
                                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                                            <XCircle className="w-6 h-6" />
                                        </div>
                                        <div className="text-3xl font-bold text-slate-800">{wrongAnswers}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salah</div>
                                    </div>

                                    {/* Unanswered */}
                                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-1">
                                            <HelpCircle className="w-6 h-6" />
                                        </div>
                                        <div className="text-3xl font-bold text-slate-800">{unansweredAnswers}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kosong</div>
                                    </div>

                                    {/* Action Buttons (Span Full Width) */}
                                    <div className="col-span-3 flex flex-col sm:flex-row gap-3 mt-2">
                                        <Link
                                            href="/dashboard"
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
                                        >
                                            Kembali ke Dashboard
                                        </Link>
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-600 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all active:scale-95"
                                            onClick={() => {
                                                const element = document.getElementById('question-review');
                                                element?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Lihat Pembahasan
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Divider Title */}
                            <div id="question-review" className="flex items-center justify-between pt-8">
                                <h3 className="text-xl font-bold text-slate-800">Detail Pembahasan</h3>
                                <div className="text-sm text-slate-500 font-medium">
                                    Soal {currentQuestionIndex + 1} dari {totalQuestionsCount}
                                </div>
                            </div>

                            {/* Question Review Card */}
                            {currentQuestion ? (
                                <div className="bg-white rounded-[28px] shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 sm:p-8">
                                        {/* Question Text */}
                                        <div className="prose prose-slate max-w-none text-slate-800 mb-8 font-medium leading-relaxed text-lg">
                                            <MathRenderer text={currentQuestion.question_text} />
                                        </div>

                                        {/* Options List */}
                                        <div className="space-y-4">
                                            {currentQuestion.options.map((opt) => {
                                                const isSelected = String(opt.id) === String(currentAnswer?.selected_option_id);
                                                const isCorrect = opt.is_correct;

                                                // Styling Logic
                                                let containerClass = "border-slate-200 bg-white";
                                                let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>;

                                                if (isSelected) {
                                                    if (isCorrect) {
                                                        containerClass = "bg-green-50 border-green-200 ring-1 ring-green-200 shadow-sm";
                                                        icon = <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" />;
                                                    } else {
                                                        containerClass = "bg-red-50 border-red-200 ring-1 ring-red-200 shadow-sm";
                                                        icon = <XCircle className="w-6 h-6 text-red-500 fill-red-100" />;
                                                    }
                                                } else if (isCorrect) {
                                                    // Show correct answer if missed
                                                    containerClass = "bg-white border-green-300 border-dashed ring-1 ring-green-100";
                                                    icon = <CheckCircle2 className="w-6 h-6 text-green-600 opacity-50" />;
                                                }

                                                return (
                                                    <div
                                                        key={opt.id}
                                                        className={`
                                                            px-5 py-4 rounded-xl border transition-all flex items-center gap-4
                                                            ${containerClass}
                                                        `}
                                                    >
                                                        <div className="shrink-0">{icon}</div>
                                                        <div className={`text-base flex-1 ${isSelected && isCorrect ? 'text-green-800 font-medium' : isSelected ? 'text-red-800 font-medium' : 'text-slate-700'}`}>
                                                            <MathRenderer text={opt.option_text} />
                                                        </div>
                                                        {isCorrect && !isSelected && (
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">Jawaban Benar</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Discussion Section with Filled Tonal Style */}
                                    {currentQuestion.discussion && (
                                        <div className="bg-blue-50/50 p-6 sm:p-8 border-t border-blue-100/50">
                                            <h3 className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                Pembahasan
                                            </h3>
                                            <div className="prose prose-sm prose-blue max-w-none text-slate-700 leading-relaxed bg-white/60 p-5 rounded-2xl border border-blue-100">
                                                <MathRenderer text={currentQuestion.discussion} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 bg-white rounded-[28px] border border-slate-200 border-dashed">
                                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>Soal tidak ditemukan</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Right Sidebar: Navigation --- */}
                    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-96 lg:h-full shrink-0">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Navigasi Soal</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <div className="grid grid-cols-5 gap-3">
                                {result.student_answers.map((ans, idx) => {
                                    const isCurrent = idx === currentQuestionIndex;
                                    let colorClass = "bg-slate-100 text-slate-500"; // Default (unanswered/unknown)

                                    if (ans.is_correct) {
                                        colorClass = "bg-green-100 text-green-700 hover:bg-green-200";
                                    } else if (ans.selected_option_id) {
                                        // Answered but wrong
                                        colorClass = "bg-red-100 text-red-700 hover:bg-red-200";
                                    } else {
                                        // Unanswered
                                        colorClass = "bg-slate-100 text-slate-500 hover:bg-slate-200";
                                    }

                                    if (isCurrent) {
                                        colorClass += " ring-2 ring-blue-600 ring-offset-2 scale-105 z-10 shadow-md";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-200
                                                ${colorClass}
                                            `}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legenda</div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                                <span>Benar</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                                <span>Salah</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                                <div className="w-3 h-3 rounded-full bg-slate-400 shadow-sm"></div>
                                <span>Kosong</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
