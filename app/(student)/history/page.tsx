"use client";

export const dynamic = 'force-dynamic';

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
// Helper component to safely render dates on client only
const ClientDate = ({ date, timeOnly = false, dateOnly = false }: { date: string, timeOnly?: boolean, dateOnly?: boolean }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (timeOnly) return <>{new Date(date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</>;
    if (dateOnly) return <>{new Date(date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</>;

    return <>{new Date(date).toLocaleString("id-ID")}</>;
};

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

            // 0. Get User
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setHistory([]);
                setFilteredHistory([]);
                setLoading(false);
                return;
            }

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
                .eq('user_id', user.id)
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
            const packageIds = Array.from(new Set(results.map((r: any) => r.exam_package_id))).filter(Boolean);

            let packagesMap: Record<number, { title: string, level_id: number }> = {};

            if (packageIds.length > 0) {
                const { data: packages, error: packageError } = await supabase
                    .from("exam_packages")
                    .select("id, title, level_id")
                    .in("id", packageIds);

                if (packageError) {
                    console.error("Error fetching packages:", packageError);
                } else if (packages) {
                    packages.forEach((p: any) => {
                        packagesMap[p.id] = { title: p.title, level_id: p.level_id };
                    });
                }
            }

            // 3. Merge Data
            const mergedHistory: ExamHistory[] = results.map((r: any) => ({
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-200">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Exam History</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Track your past performance and scores.</p>
                </div>
                <Link href="/dashboard" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 md:hidden">
                    &larr; Back to Dashboard
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <Filter className="w-3 h-3" />
                    Filters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-600"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Student Name..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Package Title..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                            value={filterPackage}
                            onChange={(e) => setFilterPackage(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            onClick={resetFilters}
                            className="w-full px-4 py-2 bg-slate-100 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">No</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Package</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Score</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="w-5 h-5 text-slate-300" />
                                            <p className="text-sm">No records found matching filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedHistory.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-3 text-xs text-center text-slate-400 font-medium">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700">
                                                    <ClientDate date={item.created_at} dateOnly />
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    <ClientDate date={item.created_at} timeOnly /> WIB
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                                            {item.student_name}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600">
                                            <span className="truncate max-w-[200px] block" title={item.exam_packages?.title || "-"}>
                                                {item.exam_packages?.title || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-bold border border-green-200 text-xs shadow-sm">
                                                {item.total_score}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/result/${item.id}`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wide rounded-md hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                            >
                                                Review
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
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredHistory.length)}</span> of <span className="font-semibold text-slate-700">{filteredHistory.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-medium text-slate-600 px-2">
                                Page {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
