"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, ChevronRight, Search, Filter, X, ChevronLeft } from "lucide-react";

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

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
    const [history, setHistory] = useState<ExamHistory[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<ExamHistory[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filterDate, setFilterDate] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterPackage, setFilterPackage] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient();

            // 1. Fetch Results first (No JOIN due to missing FK)
            const { data: results, error: resultError } = await supabase
                .from("exam_results")
                .select(`
                    id,
                    student_name,
                    total_score,
                    created_at,
                    exam_package_id
                `)
                .order('created_at', { ascending: false });

            if (resultError) {
                console.error("Error fetching history:", resultError);
                setLoading(false);
                return;
            }

            if (!results || results.length === 0) {
                setHistory([]);
                setFilteredHistory([]);
                setLoading(false);
                return;
            }

            // 2. Extract Package IDs and Fetch Packages
            const packageIds = Array.from(new Set(results.map(r => r.exam_package_id))).filter(Boolean);

            let packagesMap: Record<number, { title: string, level_id: number }> = {};

            if (packageIds.length > 0) {
                const { data: packages, error: packageError } = await supabase
                    .from("exam_packages")
                    .select("id, title, level_id")
                    .in("id", packageIds);

                if (packageError) {
                    console.error("Error fetching packages:", packageError);
                } else if (packages) {
                    packages.forEach(p => {
                        packagesMap[p.id] = { title: p.title, level_id: p.level_id };
                    });
                }
            }

            // 3. Merge Data
            const mergedHistory: ExamHistory[] = results.map(r => ({
                ...r,
                exam_packages: packagesMap[r.exam_package_id] || { title: "Ujian Tidak Diketahui", level_id: 0 }
            }));

            setHistory(mergedHistory);
            setFilteredHistory(mergedHistory);
            setLoading(false);
        };

        fetchHistory();
    }, []);

    // Filter Logic
    useEffect(() => {
        let temp = history;

        if (filterDate) {
            temp = temp.filter(item => item.created_at.startsWith(filterDate));
        }

        if (filterName) {
            const lowerName = filterName.toLowerCase();
            temp = temp.filter(item => item.student_name.toLowerCase().includes(lowerName));
        }

        if (filterPackage) {
            const lowerPkg = filterPackage.toLowerCase();
            temp = temp.filter(item =>
                (item.exam_packages?.title || "").toLowerCase().includes(lowerPkg)
            );
        }

        setFilteredHistory(temp);
        setCurrentPage(1); // Reset to first page when filtering
    }, [filterDate, filterName, filterPackage, history]);

    const resetFilters = () => {
        setFilterDate("");
        setFilterName("");
        setFilterPackage("");
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-[1920px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Riwayat Ujian</h1>
                    <p className="text-slate-500 mt-1">Daftar lengkap hasil ujian yang telah diselesaikan.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Filter className="w-4 h-4" />
                    Filter Data
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Nama Siswa</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Paket Soal</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari paket..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                value={filterPackage}
                                onChange={(e) => setFilterPackage(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="w-full px-4 py-2 bg-slate-100 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">No</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paket Soal</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nilai</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                                <Search className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p>Data tidak ditemukan sesuai filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedHistory.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-center text-slate-400 font-medium">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700">
                                                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(item.created_at).toLocaleTimeString("id-ID", {
                                                        hour: '2-digit', minute: '2-digit'
                                                    })} WIB
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                            {item.student_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {item.exam_packages?.title || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-green-50 text-green-700 font-bold border border-green-200 text-sm">
                                                {item.total_score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/result/${item.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                                            >
                                                Detail
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                        <div className="text-sm text-slate-500">
                            Menampilkan <span className="font-bold text-slate-700">{startIndex + 1}</span> sampai <span className="font-bold text-slate-700">{Math.min(startIndex + ITEMS_PER_PAGE, filteredHistory.length)}</span> dari <span className="font-bold text-slate-700">{filteredHistory.length}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`
                                            w-8 h-8 rounded-lg text-sm font-medium transition-all
                                            ${currentPage === page
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
                                        `}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
