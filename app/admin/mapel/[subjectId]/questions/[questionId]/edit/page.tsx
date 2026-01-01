"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import MathRenderer from "@/components/MathRenderer";

interface Subject {
    id: number;
    name: string;
    level_id: number;
    levels?: { name: string };
}

interface ExamPackage {
    id: number;
    title: string;
}

interface Option {
    id: string | number; // String for temp (new), number for existing
    option_text: string;
    is_correct: boolean;
    score_value: number | string;
}

export default function EditQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;
    const questionId = params.questionId as string;
    const supabase = createClient();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [packages, setPackages] = useState<ExamPackage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        exam_package_id: "",
        type: "PG",
        question_text: "",
        max_score: 10,
        discussion: ""
    });

    const [options, setOptions] = useState<Option[]>([]);
    const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Subject
                const { data: subjectData } = await supabase
                    .from("subjects")
                    .select("*, levels(name)")
                    .eq("id", subjectId)
                    .single();
                setSubject(subjectData);

                // 2. Fetch Packages
                if (subjectData) {
                    const { data: pkgData } = await supabase
                        .from("exam_packages")
                        .select("id, title")
                        .eq("level_id", subjectData.level_id)
                        .order("created_at", { ascending: false });
                    setPackages(pkgData || []);
                }

                // 3. Fetch Question & Options
                const { data: questionData, error: qError } = await supabase
                    .from("questions")
                    .select("*")
                    .eq("id", questionId)
                    .single();

                if (qError) throw qError;

                setFormData({
                    exam_package_id: questionData.exam_package_id ? String(questionData.exam_package_id) : "",
                    type: questionData.type || "PG",
                    question_text: questionData.question_text || "",
                    max_score: questionData.max_score || 0,
                    discussion: questionData.discussion || ""
                });

                // Fetch Options
                const { data: optionData, error: oError } = await supabase
                    .from("options")
                    .select("*")
                    .eq("question_id", questionId)
                    .order("id", { ascending: true });

                if (oError) throw oError;

                if (optionData) {
                    setOptions(optionData.map(o => ({
                        id: o.id,
                        option_text: o.option_text,
                        is_correct: o.is_correct,
                        score_value: o.score_value || 0
                    })));
                }

            } catch (error) {
                console.error("Error init:", error);
                alert("Gagal memuat data.");
                router.push(`/admin/mapel/${subjectId}/questions`);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [subjectId, questionId]);

    // Handlers
    const handleOptionChange = (id: string | number, field: keyof Option, value: any) => {
        setOptions(prev => prev.map(opt => {
            if (opt.id === id) {
                return { ...opt, [field]: value };
            }
            // Logic for single correct answer
            if (field === "is_correct" && value === true && formData.type === "PG") {
                return { ...opt, is_correct: false };
            }
            return opt;
        }));
    };

    const addOption = () => {
        setOptions(prev => [
            ...prev,
            { id: `NEW-${Math.random()}`, option_text: "", is_correct: false, score_value: 0 }
        ]);
    };

    const removeOption = (id: string | number) => {
        if (typeof id === 'number') {
            setDeletedOptionIds(prev => [...prev, id]);
        }
        setOptions(prev => prev.filter(o => o.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question_text) {
            alert("Teks soal wajib diisi");
            return;
        }

        if (formData.type === "PG") {
            const hasCorrect = options.some(o => o.is_correct);
            if (!hasCorrect) {
                alert("Pilih satu kunci jawaban yang benar.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // 1. Update Question
            const { error: qError } = await supabase
                .from("questions")
                .update({
                    exam_package_id: formData.exam_package_id ? parseInt(formData.exam_package_id) : null,
                    type: formData.type,
                    question_text: formData.question_text,
                    max_score: formData.max_score,
                    discussion: formData.discussion
                })
                .eq("id", questionId);

            if (qError) throw qError;

            // 2. Handle Options

            // A. Delete removed options
            if (deletedOptionIds.length > 0) {
                const { error: delError } = await supabase
                    .from("options")
                    .delete()
                    .in("id", deletedOptionIds);
                if (delError) throw delError;
            }

            // B. Upsert (Update existing + Insert new)
            // Separate lists to handle IDs correctly
            const optionsToUpdate = options
                .filter(o => typeof o.id === 'number')
                .map(o => ({
                    id: o.id as number,
                    question_id: parseInt(questionId),
                    option_text: o.option_text,
                    is_correct: o.is_correct,
                    score_value: Number(o.score_value) || 0
                }));

            const optionsToInsert = options
                .filter(o => typeof o.id === 'string') // New ones have string IDs
                .map(o => ({
                    question_id: parseInt(questionId),
                    option_text: o.option_text,
                    is_correct: o.is_correct,
                    score_value: Number(o.score_value) || 0
                }));

            if (optionsToUpdate.length > 0) {
                const { error: upError } = await supabase
                    .from("options")
                    .upsert(optionsToUpdate);
                if (upError) throw upError;
            }

            if (optionsToInsert.length > 0) {
                const { error: insError } = await supabase
                    .from("options")
                    .insert(optionsToInsert);
                if (insError) throw insError;
            }

            alert("Soal berhasil diperbarui!");
            router.push(`/admin/mapel/${subjectId}/questions`);
            router.refresh();

        } catch (error) {
            console.error("Error updating question:", error);
            alert("Terjadi kesalahan saat menyimpan perubahan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href={`/admin/mapel/${subjectId}/questions`}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Soal
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Soal</h1>
                    <p className="text-slate-500">Mata Pelajaran: {subject?.name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <h2 className="font-bold text-lg text-slate-700 border-b border-slate-100 pb-2">Informasi Dasar</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Paket Soal</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.exam_package_id}
                                onChange={(e) => setFormData({ ...formData, exam_package_id: e.target.value })}
                            >
                                <option value="">-- Pilih Paket (Opsional) --</option>
                                {packages.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Soal</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="PG">Pilihan Ganda</option>
                                <option value="essay" disabled>Esai (Coming Soon)</option>
                                <option value="true_false" disabled>Benar/Salah (Coming Soon)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">Pertanyaan <span className="text-red-500">*</span></label>
                            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                Support Math: $...$ (inline), $$...$$ (block)
                            </div>
                        </div>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                            placeholder="Tulis pertanyaan di sini... Gunakan $x^2$ untuk matematika."
                            value={formData.question_text}
                            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                        />
                        {/* Live Preview */}
                        {formData.question_text && (
                            <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Live Preview
                                </label>
                                <div className="prose prose-sm max-w-none text-slate-800">
                                    <MathRenderer text={formData.question_text} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Bobot Nilai</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.max_score}
                                onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Options/Answers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h2 className="font-bold text-lg text-slate-700">Pilihan Jawaban</h2>
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Tambah Opsi
                        </button>
                    </div>

                    <div className="space-y-4">
                        {options.map((opt, idx) => (
                            <div key={opt.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 group">
                                <div className="mt-3">
                                    <input
                                        type="radio"
                                        name="correct_answer"
                                        checked={opt.is_correct}
                                        onChange={(e) => handleOptionChange(opt.id, "is_correct", e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Pilihan {String.fromCharCode(65 + idx)}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(opt.id)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <textarea
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                                        placeholder={`Isi jawaban pilihan ${String.fromCharCode(65 + idx)}...`}
                                        value={opt.option_text}
                                        onChange={(e) => handleOptionChange(opt.id, "option_text", e.target.value)}
                                    />
                                    {opt.option_text && (
                                        <div className="mt-1 px-3 py-2 bg-slate-100 rounded text-sm text-slate-700">
                                            <MathRenderer text={opt.option_text} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Bobot Opsi:</label>
                                        <input
                                            type="number"
                                            className="w-20 px-2 py-1 text-sm rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            value={opt.score_value}
                                            onChange={(e) => handleOptionChange(opt.id, "score_value", e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Discussion */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <h2 className="font-bold text-lg text-slate-700 border-b border-slate-100 pb-2">Pembahasan (Opsional)</h2>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Tulis pembahasan jawaban di sini..."
                        value={formData.discussion}
                        onChange={(e) => setFormData({ ...formData, discussion: e.target.value })}
                    />
                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-end gap-4 z-40 lg:pl-64">
                    <Link
                        href={`/admin/mapel/${subjectId}/questions`}
                        className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
}
