"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, XCircle, FileText, ArrowLeft, Trophy, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import StudentSidebar from "@/components/StudentSidebar";

interface ExamResult {
    id: string;
    student_name: string;
    total_score: number;
    created_at: string;
    student_answers: {
        is_correct: boolean;
        score_earned: number;
        selected_option_id: string;
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
            } else {
                setResult(data);
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
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Data Tidak Ditemukan</h1>
                <Link href="/dashboard" className="text-indigo-600 hover:underline">
                    Kembali ke Dashboard
                </Link>
            </div>
        );
    }

    // Calculations
    const totalQuestions = result.student_answers.length;
    const correctAnswers = result.student_answers.filter(a => a.is_correct).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const score = result.total_score;

    const currentAnswer = result.student_answers[currentQuestionIndex];
    const currentQuestion = currentAnswer.questions;

    return (
        <div className="flex bg-slate-50 font-sans selection:bg-indigo-100 min-h-screen">
            {/* --- Sidebar (Full Height) --- */}
            <StudentSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                showDefaultLinks={true} // Show Dashboard, etc.
            />

            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 h-16 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">Hasil Ujian</h1>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(result.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {result.student_name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                            <Trophy className="w-4 h-4" />
                            <span className="font-bold text-lg">{score}</span>
                            <span className="text-xs font-medium uppercase text-indigo-400">Poin</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Center: Question Review */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="max-w-3xl mx-auto space-y-6 pb-24">

                            {/* Question Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-sm">
                                            No. {currentQuestionIndex + 1}
                                        </span>
                                        {currentAnswer.is_correct ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm font-bold px-2 py-1 bg-green-50 rounded-md border border-green-200">
                                                <CheckCircle2 className="w-4 h-4" /> Benar (+{currentAnswer.score_earned})
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 text-sm font-bold px-2 py-1 bg-red-50 rounded-md border border-red-200">
                                                <XCircle className="w-4 h-4" /> Salah (0)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="prose prose-slate max-w-none text-slate-800 mb-8 font-medium leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {currentQuestion.options.map((opt) => {
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
                                                        group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                                                        ${containerClass}
                                                    `}
                                                >
                                                    <div className="shrink-0">{icon}</div>
                                                    <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: opt.option_text }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Discussion */}
                                {currentQuestion.discussion && (
                                    <div className="bg-blue-50/50 p-6 border-t border-blue-100">
                                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Pembahasan
                                        </h3>
                                        <div className="prose prose-sm prose-blue max-w-none text-slate-700">
                                            <div dangerouslySetInnerHTML={{ __html: currentQuestion.discussion }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Navigation */}
                    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full border-t lg:border-t-0">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Navigasi Soal</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <div className="grid grid-cols-5 gap-3">
                                {result.student_answers.map((ans, idx) => {
                                    const isCurrent = idx === currentQuestionIndex;
                                    let colorClass = ans.is_correct
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-red-100 text-red-700 border-red-200";

                                    if (isCurrent) {
                                        colorClass += " ring-2 ring-indigo-500 ring-offset-1";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-lg text-sm font-bold border transition-all
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
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Legenda</div>
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
