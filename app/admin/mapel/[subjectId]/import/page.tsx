"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileJson, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Subject {
    id: number;
    name: string;
    level_id: number;
    levels?: { name: string };
}

export default function ImportQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;
    const supabase = createClient();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [jsonInput, setJsonInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);

    // Status Logs
    const [logs, setLogs] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);

    const exampleJson = [
        {
            "question_text": "Apa ibu kota Indonesia?",
            "type": "PG",
            "max_score": 10,
            "discussion": "Jakarta adalah ibu kota Indonesia.",
            "options": [
                { "option_text": "Jakarta", "is_correct": true, "score_value": 10 },
                { "option_text": "Bandung", "is_correct": false, "score_value": 0 }
            ]
        }
    ];

    useEffect(() => {
        const fetchSubject = async () => {
            setIsLoading(true);
            const { data } = await supabase
                .from("subjects")
                .select("*, levels(name)")
                .eq("id", subjectId)
                .single();
            setSubject(data);
            setIsLoading(false);
        };
        fetchSubject();
    }, [subjectId]);

    const handleCopyExample = () => {
        setJsonInput(JSON.stringify(exampleJson, null, 2));
    };

    const handleImport = async () => {
        if (!jsonInput.trim()) return;

        setIsImporting(true);
        setLogs([]);
        setSuccessCount(0);
        setErrorCount(0);

        try {
            const parsedData = JSON.parse(jsonInput);
            if (!Array.isArray(parsedData)) {
                throw new Error("Format JSON harus berupa Array [...]");
            }

            let sCount = 0;
            let eCount = 0;
            const newLogs = [];

            for (const [index, item] of parsedData.entries()) {
                const questionNum = index + 1;
                try {
                    // Validation
                    if (!item.question_text) throw new Error("question_text wajib diisi");

                    // 1. Insert Question
                    const { data: qData, error: qError } = await supabase
                        .from("questions")
                        .insert([{
                            subject_id: parseInt(subjectId),
                            type: item.type || "PG",
                            question_text: item.question_text,
                            max_score: item.max_score || 0,
                            discussion: item.discussion || ""
                        }])
                        .select()
                        .single();

                    if (qError) throw qError;

                    // 2. Insert Options if exist
                    if (item.options && Array.isArray(item.options) && item.options.length > 0) {
                        const optionsPayload = item.options.map((opt: any) => ({
                            question_id: qData.id,
                            option_text: opt.option_text || "",
                            is_correct: !!opt.is_correct,
                            score_value: Number(opt.score_value) || 0
                        }));

                        const { error: oError } = await supabase
                            .from("options")
                            .insert(optionsPayload);

                        if (oError) throw oError;
                    }

                    sCount++;
                    newLogs.push(`✅ Soal #${questionNum} berhasil disimpan.`);

                } catch (err: any) {
                    eCount++;
                    console.error(err);
                    newLogs.push(`❌ Soal #${questionNum} gagal: ${err.message || "Unknown error"}`);
                }

                // Update live
                setSuccessCount(sCount);
                setErrorCount(eCount);
                setLogs([...newLogs]);
            }

            alert(`Import selesai! Berhasil: ${sCount}, Gagal: ${eCount}`);
            if (sCount > 0) {
                // Optional: redirect or just stay
                // router.push(`/admin/mapel/${subjectId}/questions`);
            }

        } catch (error: any) {
            alert("Format JSON Invalid: " + error.message);
        } finally {
            setIsImporting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href={`/admin/mapel`}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Mata Pelajaran
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Import Soal (JSON)</h1>
                    <p className="text-slate-500">Mata Pelajaran: {subject?.name} - {subject?.levels?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-slate-700">Paste JSON di sini</label>
                            <button
                                onClick={handleCopyExample}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <Copy className="w-3 h-3" /> Contoh Format
                            </button>
                        </div>
                        <textarea
                            className="w-full h-[500px] font-mono text-sm p-4 rounded-lg bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="[ ... ]"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleImport}
                        disabled={isImporting || !jsonInput}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />}
                        Mulai Import
                    </button>
                </div>

                {/* Status/Logs Section */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Status Import</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                                <p className="text-xs text-green-600 font-bold uppercase">Berhasil</p>
                                <p className="text-2xl font-bold text-green-700">{successCount}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                <p className="text-xs text-red-600 font-bold uppercase">Gagal</p>
                                <p className="text-2xl font-bold text-red-700">{errorCount}</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-y-auto max-h-[400px] font-mono text-xs text-slate-300 space-y-1">
                            {logs.length === 0 ? (
                                <p className="text-slate-500 italic text-center mt-10">Menunggu proses import...</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={log.startsWith("❌") ? "text-red-400" : "text-green-400"}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
