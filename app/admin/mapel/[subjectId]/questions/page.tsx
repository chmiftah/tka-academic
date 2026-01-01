"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import MathRenderer from "@/components/MathRenderer";

interface Question {
    id: number;
    question_text: string;
    type: string;
    max_score: number;
    exam_package_id: number;
    exam_packages?: {
        title: string;
    };
}

interface Subject {
    id: number;
    name: string;
    level_id: number;
    levels?: {
        name: string;
    };
}

export default function QuestionListPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [examPackages, setExamPackages] = useState<{ id: number, title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Bulk Action State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [targetPackageId, setTargetPackageId] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [subjectId]);

    async function fetchData() {
        setIsLoading(true);
        try {
            // Fetch Subject Details
            const { data: subjectData, error: subjectError } = await supabase
                .from("subjects")
                .select("*, levels(name)")
                .eq("id", subjectId)
                .single();

            if (subjectError) throw subjectError;
            setSubject(subjectData);

            // Fetch Questions
            const { data: questionData, error: questionError } = await supabase
                .from("questions")
                .select("*, exam_packages(title)")
                .eq("subject_id", subjectId);

            if (questionError) throw questionError;
            setQuestions(questionData || []);

            // Fetch Exam Packages (Available for this subject/level context if needed, currently fetching all relevant or all)
            const { data: packageData, error: packageError } = await supabase
                .from("exam_packages")
                .select("id, title")
                // Optional: Filter packages by the same level if necessary. For now getting all.
                .order('title');

            if (packageError) console.error("Error fetching packages:", packageError);
            setExamPackages(packageData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Gagal mengambil data soal.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;

        try {
            const { error } = await supabase
                .from("questions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Refresh
            setQuestions(prev => prev.filter(q => q.id !== id));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (error) {
            console.error("Error deleting question:", error);
            alert("Gagal menghapus soal.");
        }
    };

    const handleBatchUpdate = async () => {
        if (selectedIds.size === 0) {
            alert("Pilih minimal satu soal.");
            return;
        }
        if (!targetPackageId) {
            alert("Pilih paket soal tujuan.");
            return;
        }
        if (!confirm(`Pindahkan ${selectedIds.size} soal ke paket terpilih?`)) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from("questions")
                .update({ exam_package_id: parseInt(targetPackageId) })
                .in("id", Array.from(selectedIds));

            if (error) throw error;

            alert("Berhasil memindahkan soal!");
            setSelectedIds(new Set());
            setTargetPackageId("");
            fetchData(); // Refresh to see changes
        } catch (error: any) {
            console.error("Error batch update:", error);
            alert("Gagal update data: " + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === questions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(questions.map(q => q.id)));
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/admin/mapel"
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Mata Pelajaran
                </Link>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Bank Soal: {subject?.name || <span className="animate-pulse bg-slate-200 rounded w-24 inline-block h-6" />}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Jenjang: {subject?.levels?.name || "-"}
                        </p>
                    </div>

                    <Link
                        href={`/ admin / mapel / ${subjectId} /questions/create`}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Soal Baru
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari konten soal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* Bulk Action */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 w-full md:w-auto p-1 bg-indigo-50 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                            <select
                                value={targetPackageId}
                                onChange={(e) => setTargetPackageId(e.target.value)}
                                className="text-sm border-0 bg-transparent focus:ring-0 text-slate-700 font-medium py-1.5 pl-3 pr-8"
                            >
                                <option value="">Pilih Paket Tujuan...</option>
                                {examPackages.map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleBatchUpdate}
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                            >
                                {isUpdating ? 'Memproses...' : 'Pindahkan'}
                            </button>
                            <div className="px-3 text-xs font-bold text-indigo-700 border-l border-indigo-200">
                                {selectedIds.size} terpilih
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={questions.length > 0 && selectedIds.size === questions.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 w-16">No</th>
                                <th className="px-6 py-3 w-1/2">Konten Soal</th>
                                <th className="px-6 py-3">Tipe</th>
                                <th className="px-6 py-3">Paket Soal</th>
                                <th className="px-6 py-3 text-center">Skor</th>
                                <th className="px-6 py-3 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Memuat data soal...
                                    </td>
                                </tr>
                            ) : filteredQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        Belum ada soal untuk mata pelajaran ini.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuestions.map((q, index) => (
                                    <tr key={q.id} className={`transition-colors group border-b border-slate-50 ${selectedIds.has(q.id) ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-3">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedIds.has(q.id)}
                                                onChange={() => toggleSelect(q.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 line-clamp-2 max-w-lg">
                                                <MathRenderer text={q.question_text} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                                {q.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            {q.exam_packages?.title || (
                                                <span className="text-slate-400 italic">Tidak ada paket</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-center font-medium text-slate-700">
                                            {q.max_score}
                                        </td>
                                        <td className="px-6 py-3 flex items-center justify-center gap-2">
                                            <Link
                                                href={`/admin/mapel/${subjectId}/questions/${q.id}/edit`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td >
                                    </tr >
                                ))
                            )}
                        </tbody >
                    </table >
                </div >
            </div >
        </div >
    );
}
