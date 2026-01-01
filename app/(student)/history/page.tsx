"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, Award, ChevronRight, FileText, Clock } from "lucide-react";

interface ExamHistory {
    id: string;
    student_name: string;
    total_score: number;
    created_at: string;
    exam_package_id: number;
    exam_packages: {
        title: string;
        level_id: number;
    };
}

export default function HistoryPage() {
    const [history, setHistory] = useState<ExamHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient();

            // In a real app, filtering by user_id from auth session is crucial.
            // Here we might fetch all or filter by 'student_name' if we had it stored in session.
            // For this demo/MVP, we'll fetch all results (or filter if possible).
            // Since we don't have auth enforced globally yet, we just list recently created results.

            const { data, error } = await supabase
                .from("exam_results")
                .select(`
                    id,
                    student_name,
                    total_score,
                    created_at,
                    exam_package_id,
                    exam_packages (
                        title,
                        level_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setHistory(data || []);
            }
            setLoading(false);
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Riwayat Ujian</h1>
                <p className="text-slate-500 mt-1">Daftar ujian yang telah kamu selesaikan.</p>
            </div>

            {/* List */}
            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800">Belum ada riwayat</h3>
                        <p className="text-slate-500">Kamu belum menyelesaikan ujian apapun.</p>
                        <Link href="/exam" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
                            Mulai Ujian Sekarang
                        </Link>
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Left Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(item.created_at).toLocaleDateString("id-ID", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                        <span>•</span>
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(item.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                        {item.exam_packages?.title || "Ujian Tanpa Judul"}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                            {item.student_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Stats & Action */}
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-medium text-slate-400 uppercase">Nilai Akhir</span>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-5 h-5 text-indigo-500" />
                                            <span className="text-2xl font-bold font-mono text-slate-800">
                                                {item.total_score}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/result/${item.id}`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
                                    >
                                        Detail
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
