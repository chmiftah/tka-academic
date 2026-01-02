"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    Clock,
    Loader2,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "@/components/Sidebar";
import { useExamStore } from "@/store/examStore";
import QuestionCard from "@/components/QuestionCard";

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
    type: 'SINGLE_CHOICE' | 'CHECKLIST' | 'TRUE_FALSE' | 'PG' | 'complex';
    max_score?: number;
    options: Option[];
}

const EXAM_DURATION_SECONDS = 2700; // 45 minutes

export default function ExamSubjectRunner() {
    const router = useRouter();
    const params = useParams() as { packageId: string; subjectId: string };
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [flags, setFlags] = useState<Set<string>>(new Set());

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const isSubmitting = React.useRef(false);

    // Store
    const { answers, initializeExam, examEndTime } = useExamStore();
    const [hydrated, setHydrated] = useState(false);

    // Rehydration
    useEffect(() => {
        useExamStore.persist.rehydrate();
        setHydrated(true);
    }, []);

    // Initialize Exam Timer
    useEffect(() => {
        if (hydrated) {
            initializeExam(EXAM_DURATION_SECONDS);
        }
    }, [hydrated, initializeExam]);

    // Fetch Questions
    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            const supabase = createClient();

            const { data, error } = await supabase
                .from('questions')
                .select(`
        *,
        options (*),
        stimuli!fk_questions_stimuli (*) 
    `)
                .eq('exam_package_id', params.packageId)
                .eq('subject_id', params.subjectId);

            if (error) {
                console.error("Supabase Error:", error);
                alert("Gagal mengambil data: " + error.message);
            } else if (data) {
                const mappedQuestions: Question[] = data.map((q: any) => {
                    const dbStimulus = q.stimuli;
                    return {
                        id: q.id,
                        text: q.question_text,
                        type: q.question_type || 'SINGLE_CHOICE', // Default fallback
                        max_score: q.max_score || 5,
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

        if (params.packageId && params.subjectId) {
            fetchQuestions();
        }
    }, [params.packageId, params.subjectId]);

    const submitExam = async (isAuto: boolean = false) => {
        if (isSubmitting.current) return;
        if (!isAuto && !confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) return;

        isSubmitting.current = true;
        setLoading(true);

        try {
            const supabase = createClient();

            // Fetch User
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("Unauthorized: You must be logged in to submit.");
            }

            let totalScore = 0;
            const detailedAnswers: {
                question_id: string;
                selected_option_id: number | null; // Allow null for unanswered
                is_correct: boolean;
                score_earned: number;
            }[] = [];

            // 1. Iterate through ALL questions (Source of Truth)
            questions.forEach((q) => {
                const selectedIds = answers[q.id] || [];
                const maxScore = q.max_score || 5;

                // Case A: Unanswered (Empty or undefined)
                if (selectedIds.length === 0) {
                    detailedAnswers.push({
                        question_id: q.id,
                        selected_option_id: null,
                        is_correct: false,
                        score_earned: 0
                    });
                    // Move to next question
                    return;
                }

                // Case B: Answered
                if (q.type === 'SINGLE_CHOICE' || q.type === 'PG') {
                    // All or Nothing
                    const selectedId = selectedIds[0];
                    const selectedOption = q.options.find(opt => String(opt.id) === String(selectedId));
                    const isCorrect = selectedOption?.is_correct || false;
                    const score = isCorrect ? maxScore : 0;

                    totalScore += score;

                    detailedAnswers.push({
                        question_id: q.id,
                        selected_option_id: parseInt(selectedId),
                        is_correct: isCorrect,
                        score_earned: score
                    });

                } else {
                    // Partial Scoring (Checklist / TrueFalse / Complex)
                    const correctOptions = q.options.filter(opt => opt.is_correct);
                    const totalCorrectOptions = correctOptions.length;

                    // Avoid division by zero
                    const scorePerItem = totalCorrectOptions > 0 ? (maxScore / totalCorrectOptions) : 0;
                    let questionTotalScore = 0;

                    // Insert row for EACH selected option in checklist
                    // Note: If checklist is unanswered, it's caught by Case A above.
                    selectedIds.forEach(id => {
                        const option = q.options.find(opt => String(opt.id) === String(id));
                        const isHit = option?.is_correct || false;
                        const itemScore = isHit ? scorePerItem : 0;

                        questionTotalScore += itemScore;

                        detailedAnswers.push({
                            question_id: q.id,
                            selected_option_id: parseInt(id),
                            is_correct: isHit,
                            score_earned: itemScore
                        });
                    });

                    totalScore += questionTotalScore;
                }
            });

            const { data: resultData, error: resultError } = await supabase
                .from('exam_results')
                .insert({
                    exam_package_id: params.packageId,
                    user_id: user.id, // Linked to authenticated user
                    student_name: user.email, // Fallback display name
                    total_score: totalScore
                })
                .select()
                .single();

            if (resultError) throw resultError;

            // Prepare Insert Payload
            const answersToInsert = detailedAnswers.map(ans => ({
                exam_result_id: resultData.id,
                question_id: ans.question_id,
                selected_option_id: ans.selected_option_id, // This can now be null
                is_correct: ans.is_correct,
                score_earned: ans.score_earned
            }));

            if (answersToInsert.length > 0) {
                const { error: answersError } = await supabase
                    .from('student_answers')
                    .insert(answersToInsert);

                if (answersError) throw answersError;
            }

            // Clear exam store after successful submission
            useExamStore.getState().clearExam();

            router.push(`/result/${resultData.id}`);

        } catch (err: any) {
            console.error("Gagal submit:", err);
            isSubmitting.current = false; // Reset on error
            if (!isAuto) alert("Terjadi kesalahan saat mengirim jawaban: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-submit check
    useEffect(() => {
        if (examEndTime && timeLeft !== null && timeLeft === 0 && !loading && questions.length > 0) {
            submitExam(true);
        }
    }, [timeLeft, examEndTime, loading, questions.length]);

    // Timer Effect
    useEffect(() => {
        if (!examEndTime) return;

        const calculateTime = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((examEndTime - now) / 1000));
            setTimeLeft(diff);
            return diff;
        };

        calculateTime();

        const interval = setInterval(() => {
            calculateTime();
        }, 1000);

        return () => clearInterval(interval);
    }, [examEndTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
    };

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

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

    if (!hydrated || loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Memuat Ujian...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Tidak ada soal ditemukan.</h2>
                    <p className="text-slate-500 mt-2">Mata pelajaran ini belum memiliki soal.</p>
                    <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">Kembali ke Dashboard</Link>
                </div>
            </div>
        );
    }

    const displayTime = timeLeft !== null ? timeLeft : 0;
    const isLowTime = displayTime < 300;

    return (
        <div className="flex w-full h-screen bg-slate-50 font-sans selection:bg-indigo-100 overflow-hidden">
            {/* --- Left Sidebar (Menu) --- */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* --- Header + Content Wrapper --- */}
            <div className="flex-1 flex flex-col w-full h-full min-w-0">

                {/* --- Header (Fixed, Flex-none) --- */}
                <header className="flex-none h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 lg:hidden text-slate-600 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-slate-800 line-clamp-1">
                                Tryout TKA
                            </h1>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium hidden sm:flex">
                                <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    <span>{questions.length} Soal</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>100 Menit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className={`
                            flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all duration-300
                            ${isLowTime
                                ? 'bg-red-50 text-red-600 animate-pulse border border-red-200'
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }
                        `}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono text-base sm:text-lg font-bold tracking-wider">
                                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* --- Body Wrapper (Flex-1) --- */}
                <div className="flex-1 flex w-full h-full overflow-hidden">

                    {/* --- Center: Main Content --- */}
                    <main className="flex-1 flex flex-col relative h-full overflow-hidden">

                        {/* --- Question Scroll Area (Flex-1) --- */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-slate-50">
                            <div className="max-w-3xl mx-auto pb-12">
                                <QuestionCard
                                    question={currentQuestion}
                                    index={currentQuestionIndex}
                                    flags={flags}
                                    toggleFlag={toggleFlag}
                                />
                                {/* Mobile view might need "List Soal" button here if not in header/footer? 
                                    User asked for "hidden lg:flex" sidebar. Mobile usually toggles over.
                                    We have "Lihat Nomor Soal" button below.
                                */}
                            </div>
                        </div>

                        {/* --- Footer: Navigation Buttons (Fixed, Flex-none) --- */}
                        <div className="flex-none bg-white border-t border-slate-200 p-4 z-30">
                            <div className="max-w-3xl mx-auto w-full">
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                                        disabled={isFirstQuestion}
                                        className="
                                            flex items-center gap-2 px-4 py-3 rounded-full border border-slate-200 text-slate-600 font-bold
                                            hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed 
                                            transition-all active:scale-95 bg-white
                                        "
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        <span className="hidden sm:inline">Sebelumnya</span>
                                    </button>

                                    <button
                                        onClick={toggleFlag}
                                        className={`
                                            flex items-center gap-2 px-4 py-3 rounded-full border font-bold transition-all active:scale-95
                                            ${flags.has(currentQuestion.id)
                                                ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                                                : 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'
                                            }
                                        `}
                                    >
                                        <div className={`w-3 h-3 rounded-full border-2 border-current ${flags.has(currentQuestion.id) ? 'bg-current' : ''}`}></div>
                                        <span className="hidden sm:inline">Ragu-ragu</span>
                                        <span className="sm:hidden">Ragu</span>
                                    </button>

                                    {isLastQuestion ? (
                                        <button
                                            onClick={() => submitExam(false)}
                                            className="
                                                flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold 
                                                shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300
                                                active:scale-95 transition-all
                                            "
                                        >
                                            <span>Selesai</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(p => Math.min(totalQuestions - 1, p + 1))}
                                            className="
                                                flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold 
                                                shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300
                                                active:scale-95 transition-all
                                            "
                                        >
                                            <span className="hidden sm:inline">Selanjutnya</span>
                                            <span className="sm:hidden">Lanjut</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Mobile Toggle for Question List */}
                                <div className="mt-4 lg:hidden">
                                    <button
                                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                                        className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                                    >
                                        {isMobileNavOpen ? "Tutup Daftar Soal" : "Lihat Daftar Soal"}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </main>

                    {/* --- Right Sidebar: Question Grid (Flex-none / Fixed width) --- */}
                    {/* Desktop: Always visible. Mobile: Overlay or Toggle? 
                        User Requirement: "Sidebar (Question Grid): hidden lg:flex w-80 flex-col border-l"
                        Grid inside: "flex-1 overflow-y-auto"
                        Responsive: On mobile, we might want to overlay it or show it. 
                        My code logic for `isMobileNavOpen` was handling this. 
                        Let's keep it behaving nicely.
                    */}
                    <aside className={`
                        flex-col w-80 bg-white border-l border-slate-200 h-full
                        ${isMobileNavOpen ? 'fixed inset-0 z-50 flex lg:static lg:flex' : 'hidden lg:flex'}
                    `}>
                        {/* Mobile Close Button (Only visible if fixed/mobile) */}
                        {isMobileNavOpen && (
                            <div className="lg:hidden p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h2 className="font-bold text-slate-800">Daftar Soal</h2>
                                <button onClick={() => setIsMobileNavOpen(false)} className="p-2 bg-slate-100 rounded-full">
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        )}

                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex-none z-10">
                            <div className="grid grid-cols-2 divide-x divide-slate-200">
                                <div className="text-center px-2">
                                    <div className="text-xl font-bold text-indigo-600">{Object.keys(answers).length}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Terjawab</div>
                                </div>
                                <div className="text-center px-2">
                                    <div className="text-xl font-bold text-slate-400">{questions.length - Object.keys(answers).length}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Belum</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
                            <div className="grid grid-cols-5 gap-3">
                                {questions.map((q, idx) => {
                                    const isAnswered = answers[q.id] && answers[q.id].length > 0;
                                    const isFlagged = flags.has(q.id);
                                    const isCurrent = idx === currentQuestionIndex;

                                    let colorClass = "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300";
                                    if (isAnswered) colorClass = "bg-indigo-50 text-indigo-700 border border-indigo-200";
                                    if (isFlagged) colorClass = "bg-yellow-50 text-yellow-600 border border-yellow-200 ring-2 ring-yellow-100";
                                    if (isCurrent) colorClass = "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-100 ring-offset-2";

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setCurrentQuestionIndex(idx);
                                                setIsMobileNavOpen(false); // Close mobile nav on selection
                                            }}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 relative
                                                ${colorClass}
                                            `}
                                        >
                                            {isFlagged && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>}
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3 flex-none z-10">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Keterangan</div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                <span>Posisi Sekarang</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-indigo-50 border border-indigo-200"></div>
                                <span>Sudah Dijawab</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-yellow-50 border border-yellow-200 ring-2 ring-yellow-100"></div>
                                <span>Ragu-ragu</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
