"use client";

export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    Flag,
    Clock,
    X,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import StudentSidebar from "@/components/StudentSidebar";
import { submitExam } from "../actions";

// --- Types ---
interface Option {
    id: string;
    text: string;
    is_correct?: boolean;
    score?: number;
}

interface Question {
    id: string;
    stimulus?: {
        type: "text" | "image";
        content: string;
    };
    text: string;
    options: Option[];
}

const EXAM_DURATION_SECONDS = 3600; // 1 Hour

export default function ExamRunner() {
    const router = useRouter();
    const params = useParams() as { packageId: string }; // Corrected param name
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flags, setFlags] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Questions
    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            console.log("Checking Supabase Config...");
            console.log("- URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing");
            console.log("- Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing");

            const supabase = createClient();

            const { data, error } = await supabase
                .from('questions')
                .select(`
        *,
        options (*),
        stimuli!fk_questions_stimuli (*) 
    `)
                .eq('exam_package_id', params.packageId);

            if (error) {
                console.error("Supabase Error:", error);
                alert("Gagal mengambil data: " + error.message);
            } else if (data) {
                console.log("Data fetched:", data);

                const mappedQuestions: Question[] = data.map((q: any) => {
                    const dbStimulus = q.stimuli;

                    return {
                        id: q.id,
                        text: q.question_text,
                        stimulus: (dbStimulus && dbStimulus.content) ? {
                            type: dbStimulus.type || 'text',
                            content: dbStimulus.content
                        } : undefined,
                        options: q.options ? q.options.map((opt: any) => ({
                            id: opt.id,
                            text: opt.option_text,
                            is_correct: opt.is_correct,
                            score: opt.score_value
                        })) : []
                    };
                });

                setQuestions(mappedQuestions);
            }
            setLoading(false);
        };

        if (params.packageId) {
            fetchQuestions();
        }
    }, [params.packageId]);



    // ... inside component
    const handleSubmitExam = async () => {
        if (!confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) return;
        setLoading(true);

        try {
            const result = await submitExam(params.packageId, answers);
            if (result.success) {
                router.push(`/result/${result.resultId}`);
            }
        } catch (err: any) {
            console.error("Gagal submit:", err);
            alert("Terjadi kesalahan saat mengirim jawaban: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Timer Effect
    useEffect(() => {
        if (loading) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading]);

    // Format Timer mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
    };

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleOptionSelect = (optionId: string) => {
        if (!currentQuestion) return;
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionId,
        }));
    };

    const toggleFlag = () => {
        if (!currentQuestion) return;
        const newFlags = new Set(flags);
        if (newFlags.has(currentQuestion.id)) {
            newFlags.delete(currentQuestion.id);
        } else {
            newFlags.add(currentQuestion.id);
        }
        setFlags(newFlags);
    };

    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    const getQuestionStatusColor = (index: number, qId: string) => {
        const isCurrent = index === currentQuestionIndex;
        const isAnswered = !!answers[qId];
        const isFlagged = flags.has(qId);

        if (isCurrent) return "ring-2 ring-blue-600 border-blue-600 bg-white text-blue-700 font-bold";
        if (isFlagged) return "bg-yellow-100 text-yellow-700 border-yellow-300";
        if (isAnswered) return "bg-blue-600 text-white border-blue-600";
        return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Memuat Ujian...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Tidak ada soal ditemukan.</h2>
                    <p className="text-slate-500 mt-2">Paket ujian ini mungkin belum memiliki soal atau ID salah.</p>
                    <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">Kembali ke Beranda</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            {/* --- Top Bar --- */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 rounded-md hover:bg-slate-100 lg:hidden text-slate-600"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                        Ujian #{params.packageId}
                    </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-lg font-semibold tracking-wide ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* --- Main Layout --- */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* --- Sidebar (Questions Grid) --- */}
                <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentQuestionIndex(idx);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`
                                aspect-square flex items-center justify-center rounded-lg text-sm font-medium border transition-all
                                ${getQuestionStatusColor(idx, q.id)}
                            `}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Dijawab</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div> Ragu-ragu</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div> Belum dijawab</div>
                        </div>
                    </div>
                </StudentSidebar>

                {/* --- Main Content Area --- */}
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-6xl mx-auto w-full min-h-full flex flex-col">

                        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
                            {/* Stimulus Section (Conditional) */}
                            {currentQuestion.stimulus && (
                                <div className="md:w-1/2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Informasi Pendukung
                                    </div>
                                    <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-sm prose-slate max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: currentQuestion.stimulus.content }} />
                                    </div>
                                </div>
                            )}

                            {/* Question Section */}
                            <div className={`flex flex-col ${currentQuestion.stimulus ? 'md:w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex-1">
                                    <div className="flex items-start justify-between mb-6">
                                        <h2 className="text-sm font-bold text-blue-600/80 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                                            Soal No. {currentQuestionIndex + 1}
                                        </h2>
                                        <button
                                            onClick={toggleFlag}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${flags.has(currentQuestion.id) ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <Flag className={`w-4 h-4 ${flags.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                                            <span className="hidden sm:inline">Ragu-ragu</span>
                                        </button>
                                    </div>

                                    <div className="prose prose-slate max-w-none mb-8">
                                        <p className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
                                            {currentQuestion.text}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {currentQuestion.options.map((option) => {
                                            const isSelected = answers[currentQuestion.id] === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(option.id)}
                                                    className={`
                                            w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group
                                            ${isSelected
                                                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/20'
                                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }
                                        `}
                                                >
                                                    <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors shrink-0
                                            ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                                        `}>
                                                        <div className="w-2 h-2 rounded-full bg-current" />
                                                    </div>
                                                    <span className={`text-base ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                                                        {option.text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200 p-4 sm:px-6 lg:px-8">
                            <div className="max-w-6xl mx-auto flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                                    disabled={isFirstQuestion}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                </button>

                                {isLastQuestion ? (
                                    <button
                                        onClick={handleSubmitExam}
                                        className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow-sm hover:shadow active:scale-95 transition-all"
                                    >
                                        <span>Selesai Ujian</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(p => Math.min(totalQuestions - 1, p + 1))}
                                        className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-blue-200 shadow-lg hover:shadow-xl active:scale-95 transition-all"
                                    >
                                        <span className="hidden sm:inline">Selanjutnya</span>
                                        <span className="sm:hidden">Next</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
