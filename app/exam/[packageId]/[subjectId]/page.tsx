"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    Clock,
    Loader2,
    CheckCircle2,
    FileText,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import StudentSidebar from "@/components/StudentSidebar";
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

const EXAM_DURATION_SECONDS = 360; // 1 Hour

export default function ExamSubjectRunner() {
    const router = useRouter();
    const params = useParams() as { packageId: string; subjectId: string };
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [flags, setFlags] = useState<Set<string>>(new Set());

    // PERBAIKAN 1: Inisialisasi dengan null, bukan 0
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
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

            // Note: Currently just creating a result for the package. 
            // Ideally should track subject-specific results if needed.
            const { data: resultData, error: resultError } = await supabase
                .from('exam_results')
                .insert({
                    exam_package_id: params.packageId,
                    student_name: 'Budi Santoso', // ToDo: Get real user name
                    total_score: totalScore
                })
                .select()
                .single();

            if (resultError) throw resultError;

            // Prepare Insert Payload
            // Filter out any potential invalid entries if necessary, though logic above should be safe
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

    // PERBAIKAN 2: Auto-submit effect check timeLeft !== null
    useEffect(() => {
        if (examEndTime && timeLeft !== null && timeLeft === 0 && !loading && questions.length > 0) {
            submitExam(true);
        }
    }, [timeLeft, examEndTime, loading, questions.length]);

    // Timer Effect (Calculated from store)
    useEffect(() => {
        if (!examEndTime) return;

        // Jalankan sekali di awal untuk menghindari delay 1 detik render
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

    const getQuestionStatusColor = (index: number, qId: string) => {
        const isCurrent = index === currentQuestionIndex;
        const isAnswered = (answers[qId] && answers[qId].length > 0);
        const isFlagged = flags.has(qId);

        if (isCurrent) return "ring-2 ring-blue-600 border-blue-600 bg-white text-blue-700 font-bold";
        if (isFlagged) return "bg-yellow-100 text-yellow-700 border-yellow-300";
        if (isAnswered) return "bg-blue-600 text-white border-blue-600";
        return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
    };

    if (!hydrated || loading) {
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
                    <p className="text-slate-500 mt-2">Mata pelajaran ini belum memiliki soal.</p>
                    <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">Kembali ke Dashboard</Link>
                </div>
            </div>
        );
    }

    // PERBAIKAN 3: Logic display untuk timer agar aman saat null
    const displayTime = timeLeft !== null ? timeLeft : 0;
    const isLowTime = displayTime < 300;

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
                                SKD 4 - CPNS
                            </h1>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
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
                            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                            ${isLowTime
                                ? 'bg-red-50 text-red-600 animate-pulse border border-red-200'
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }
                        `}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono text-lg font-bold tracking-wider">
                                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* --- Content Wrapper (Center + Right) --- */}
                <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                    {/* --- Center: Question Area --- */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="max-w-3xl mx-auto space-y-6 pb-24">

                            {/* Question Header Badge */}
                            <div className="flex items-center justify-between">
                                <div className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
                                    Soal {currentQuestionIndex + 1}
                                </div>
                                <div className="text-xs text-slate-400 font-mono">
                                    cpns|twk|dpd|legislatif
                                </div>
                            </div>

                            {/* Stimulus Section (Conditional) - HIDDEN BY REQUEST
                            {currentQuestion.stimulus && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informasi Pendukung</span>
                                    </div>
                                    <div className="p-6 prose prose-sm prose-slate max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: currentQuestion.stimulus.content }} />
                                    </div>
                                </div>
                            )}
                            */}

                            {/* Question Card */}
                            <QuestionCard
                                question={currentQuestion}
                                index={currentQuestionIndex}
                                flags={flags}
                                toggleFlag={toggleFlag}
                            />

                            {/* Bottom Navigation (Inside Flow) */}
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
                                    onClick={toggleFlag}
                                    className={`
                                        flex items-center gap-2 px-6 py-2.5 rounded-lg border font-medium transition-all active:scale-95
                                        ${flags.has(currentQuestion.id)
                                            ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                                            : 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'
                                        }
                                    `}
                                >
                                    <div className={`w-3 h-4 border-2 border-current ${flags.has(currentQuestion.id) ? 'bg-current' : ''}`}></div>
                                    <span>Ragu-ragu</span>
                                </button>

                                {isLastQuestion ? (
                                    <button
                                        onClick={() => submitExam(false)}
                                        className="
                                            flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold 
                                            shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300
                                            active:scale-95 transition-all
                                        "
                                    >
                                        <span>Selesai</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(p => Math.min(totalQuestions - 1, p + 1))}
                                        className="
                                            flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold 
                                            shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300
                                            active:scale-95 transition-all
                                        "
                                    >
                                        <span>Selanjutnya</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- Right Sidebar: Question Grid --- */}
                    <div className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col h-full border-t lg:border-t-0">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
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

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
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
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`
                                                aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200
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

                        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Keterangan</div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-lg bg-indigo-600"></div>
                                <span>Posisi Sekarang</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-lg bg-indigo-50 border border-indigo-200"></div>
                                <span>Sudah Dijawab</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <div className="w-3 h-3 rounded-lg bg-yellow-50 border border-yellow-200 ring-2 ring-yellow-100"></div>
                                <span>Ragu-ragu</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}